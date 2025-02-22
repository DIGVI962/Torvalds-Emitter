"""Main file"""

import json
import os
import re
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Chroma
from langchain_core.messages import HumanMessage, AIMessage
from langchain_groq import ChatGroq
from langchain_ollama import OllamaEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, END, StateGraph

from helper_methods import trim_chat_context, refactor_context
from models.request_models import StateRequest, TranslationRequest
from models.response_model import ChatResponse
from models.state import State
from prompt_templates import generate_prompt, genetrate_translation_prompt, genetrate_summarization_prompt, generate_grade_chat_history_prompt
from rag_helper import RAGHelper


load_dotenv()
port = int(os.environ.get("PORT", 10000))


# FastAPI setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend domain for security
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],  # Allows all headers
)


# Internal state
user_states = {}


# LLM models
#model = ChatOllama(model="llama3.1:8b", tags=["chat"], temperature=0.5)
rag_model = ChatGroq(model=os.environ["RAG_CHATMODEL"], temperature=0.4, api_key=os.environ["GROQAPIKEY"])
model = ChatGroq(model=os.environ["CHATMODEL"], temperature=0.6, api_key=os.environ["GROQAPIKEY"])
text_transform_model = ChatGroq(model=os.environ["TEXT_TRANSFORM_CHATMODEL"], temperature=0.3, api_key=os.environ["GROQAPIKEY"])
grading_model = ChatGroq(model=os.environ["GRADING_CHATMODEL"], temperature=0, api_key=os.environ["GROQAPIKEY"])

embeddings = OllamaEmbeddings(model="mxbai-embed-large:latest")


# Document RAG
loader = TextLoader(file_path=os.environ["RAG_DOC"])
#loader = DirectoryLoader('./', glob = '*dummytext.txt', loader_cls = TextLoader, loader_kwargs={'encoding': 'utf-8'})

docs = loader.load()
doc_sources = [doc.metadata['source']  for doc in docs]
print(doc_sources)

text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=100,
    separators=["\n\n", "\n", "• ", "Section ", "Article ", ". ", "; ", ", ", " ", ""])
documents = text_splitter.split_documents(documents=docs)


vectorstore = Chroma.from_documents(
    documents=documents,
    collection_name="rag-chroma",
    embedding=embeddings,
    persist_directory="./Vectorstore"
)
retriever = vectorstore.as_retriever()


rag_helper = RAGHelper(rag_model, retriever)


# Services

async def call_model(state, config):
    """Call the model and yield responses."""

    state = trim_chat_context(state)
    query = state["query"]
    prompt = generate_prompt(query, refactor_context(state["history"]))
    response = await model.ainvoke(
        [{"role": "user", "content": prompt}],
        config,
    )
    ai_message_id = state["thread_id"] + "-A-" + str(state["last_message_id"])
    state["history"].append(AIMessage(content=response.content, id=ai_message_id))
    user_states[state["thread_id"]] = state
    return {"response": response.content}


def translate_text(base_text: str, target: str) -> str:
    """Use llm to translate text to target language."""

    translation_prompt = genetrate_translation_prompt(base_text=base_text, target=target)
    translated = text_transform_model.invoke(translation_prompt)
    cleaned_translation = re.sub(r"<think>.*?</think>", "", translated.content, flags=re.DOTALL).strip()

    return cleaned_translation


def summarize_history(state: State) -> str:
    """Use llm to summarize chat history."""

    history = refactor_context(state["history"])

    summarization_prompt = genetrate_summarization_prompt(history)
    summary = text_transform_model.invoke(summarization_prompt)
    cleaned_summary = re.sub(r"<think>.*?</think>", "", summary.content, flags=re.DOTALL).strip()

    return cleaned_summary


def grade_chat_history(state: State) -> str:
    """Use llm to grade the chat summary and give an applicable legal category."""

    history = refactor_context(state["history"])

    grading_prompt = generate_grade_chat_history_prompt(history)
    grade = grading_model.invoke(grading_prompt)
    return grade.content


# Base LangGraph implementation {It is not being used, Graph from rag_helper.py is being used.}

memory = MemorySaver()
graph_builder = StateGraph(State)

graph_builder.add_edge(START, "Chatbot")
graph_builder.add_node("Chatbot", call_model)
graph_builder.add_edge("Chatbot", END)

graph = graph_builder.compile(checkpointer=memory)


# APIs

# [Deprecated] Please use the chat/v3 endpoint
@app.post("/chat")
async def chat(request: StateRequest) -> StreamingResponse:
    """API endpoint for streaming chatbot responses."""

    thread_config = {"configurable": {"thread_id": request.thread_id}}
    if request.thread_id in user_states:
        state = user_states[request.thread_id]
        state["query"] = request.query
    else:
        state = {"thread_id": request.thread_id, "query": request.query, "response": "", "history": [], "last_message_id": 0}

    state["last_message_id"] += 1
    user_message_id = state["last_message_id"]
    state["history"].append(HumanMessage(content=request.query, id=request.thread_id + "-H-" + str(user_message_id)))

    async def response_stream() -> AsyncGenerator[str, None]:
        async for msg, _ in graph.astream(
            state,
            config=thread_config,
            stream_mode="messages",
        ):
            if msg.content:
                #yield msg.content
                json_chunk = json.dumps({"message": msg.content})  # Keep Markdown intact
                yield json_chunk

    return StreamingResponse(response_stream(), media_type="application/json")


# [Deprecated] Please use the chat/v3 endpoint
@app.post("/chat/v2")
async def chatv2(request: StateRequest) -> ChatResponse:
    """API endpoint for streaming chatbot responses."""

    thread_config = {"configurable": {"thread_id": request.thread_id}}
    if request.thread_id in user_states:
        state = user_states[request.thread_id]
        state["query"] = request.query
    else:
        state = {"thread_id": request.thread_id, "query": request.query, "response": "", "history": [], "last_message_id": 0}

    state["last_message_id"] += 1
    user_message_id = state["last_message_id"]
    state["history"].append(HumanMessage(content=request.query, id=request.thread_id + "-H-" + str(user_message_id)))

    response = ""

    async for msg, _ in graph.astream(
            state,
            config=thread_config,
            stream_mode="messages",
    ):
        if msg.content:
            response += msg.content

    cleaned_response = re.sub(r"<think>.*?</think>", "", response, flags=re.DOTALL).strip()

    return ChatResponse(message=cleaned_response)


@app.post("/chat/v3")
async def chatv3(request: StateRequest) -> ChatResponse:
    """API endpoint for streaming chatbot responses."""

    try:
        #thread_config = {"configurable": {"thread_id": request.thread_id}}
        if request.thread_id in user_states:
            state = user_states[request.thread_id]
            state["query"] = request.query
        else:
            state = {"thread_id": request.thread_id, "query": request.query, "response": "", "history": [], "last_message_id": 0}

        state["last_message_id"] += 1
        user_message_id = state["last_message_id"]
        state["history"].append(HumanMessage(content=request.query, id=request.thread_id + "-H-" + str(user_message_id)))

        response = ""

        response = rag_helper.produce_response(state["query"])

        state["response"] = response
        ai_message_id = state["thread_id"] + "-A-" + str(state["last_message_id"])
        state["history"].append(AIMessage(content=response, id=ai_message_id))
        user_states[state["thread_id"]] = state

        cleaned_response = re.sub(r"<think>.*?</think>", "", response, flags=re.DOTALL).strip()

        return ChatResponse(message=cleaned_response)
    except Exception:
        return "There was some issue on our side. Please try again or contact our team."


@app.get("/state")
def getstate(thread_id: str) -> dict:
    """API endpoint for getting the internal state for a thread_id"""

    if thread_id in user_states:
        return user_states[thread_id]

    return { "thread_id": thread_id, "query": "", "response": "", "history": [], "last_message_id": 0 }


@app.post("/translate")
def translate(request: TranslationRequest) -> str:
    """API endpoint for translating text to another language using llm"""

    return translate_text(request.query, request.target)


@app.get("/summary")
async def summarize(thread_id: str) -> str:
    """API endpoint for generating summary of chat history"""

    if thread_id in user_states and len(user_states[thread_id]["history"]) > 0:
        state = user_states[thread_id]
    else:
        return "There is no chat history to sumarize."

    return summarize_history(state)


@app.get("/grade")
async def grade_chat(thread_id: str) -> str:
    """API endpoint for grading chat history to return an applicable legal category"""

    if thread_id in user_states and len(user_states[thread_id]["history"]) > 0:
        state = user_states[thread_id]
    else:
        return "NAN"

    return grade_chat_history(state)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=port)
