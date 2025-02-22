"""RAG Helper class"""

#from pprint import pprint
from typing import List
from IPython.display import Image, display
from typing_extensions import TypedDict

from dotenv import load_dotenv
from langchain import hub
from langchain.schema import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_core.output_parsers import StrOutputParser
from langchain_community.tools.tavily_search import TavilySearchResults
from langgraph.graph import END, StateGraph, START
#from models.grade_documents import GradeDocuments
#from models.rag_state import RAGState


load_dotenv()


class GradeDocuments(BaseModel):
    """Binary score for relevance check on retrieved documents."""

    binary_score: str = Field(
        description="Documents are relevant to the question, 'yes' or 'no'"
    )


class RAGState(TypedDict):
    """Represents the state of our RAG workflow."""
    question: str
    generation: str
    web_search: str
    documents: List[str]


class RAGHelper:
    """A helper class for a RAG (Retrieval-Augmented Generation) pipeline using LangGraph."""

    def __init__(self, llm, retriever):
        """Initialize the RAG pipeline with an LLM and Retriever."""
        self.llm = llm
        self.retriever = retriever
        self.web_search_tool = TavilySearchResults(k=3)

        # Initialize processing components
        self.rag_chain = self.get_rag_chain()
        self.retrieval_grader = self.get_document_grader()
        self.question_rewriter = self.get_question_rewriter()

        # Initialize the workflow graph
        self.workflow = StateGraph(RAGState)
        self.app = self.generate_graph()

    def format_docs(self, docs):
        """Formats documents into a readable format."""
        return "\n\n".join(doc.page_content for doc in docs)

    def get_rag_chain(self):
        """Create and return the RAG chain."""
        prompt = hub.pull("rlm/rag-prompt")
        return prompt | self.llm | StrOutputParser()

    def get_document_grader(self):
        """Create and return the LLM document relevance grader."""
        structured_llm_grader = self.llm.with_structured_output(GradeDocuments)
        system_prompt = """You are a grader assessing relevance of a retrieved document to a user question. 
            If the document contains keyword(s) or semantic meaning related to the question, grade it as relevant.
            Give a binary score 'yes' or 'no'."""
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "Retrieved document: \n\n {document} \n\n User question: {question}")
        ])
        return prompt_template | structured_llm_grader

    def get_question_rewriter(self):
        """Create and return the question re-writer."""
        system_prompt = """You are a question re-writer that optimizes input queries for web search.
            Look at the input and extract the underlying intent.
            Return only the improved question without extra information."""
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "Here is the initial question: \n\n {question} \n Improve the question.")
        ])
        return prompt_template | self.llm | StrOutputParser()

    def retrieve(self, state):
        """Retrieve relevant documents for the given question."""
        print("---RETRIEVING DOCUMENTS---")
        question = state["question"]
        documents = self.retriever.get_relevant_documents(question)
        return {"documents": documents, "question": question}

    def grade_documents(self, state):
        """Filter retrieved documents based on relevance."""
        print("---CHECKING DOCUMENT RELEVANCE---")
        question = state["question"]
        documents = state["documents"]
        filtered_docs = []
        web_search = "No"

        for doc in documents:
            score = self.retrieval_grader.invoke({"question": question, "document": doc.page_content})
            if score.binary_score == "yes":
                print("---DOCUMENT RELEVANT---")
                filtered_docs.append(doc)
            else:
                print("---DOCUMENT NOT RELEVANT---")
                web_search = "Yes"

        return {"documents": filtered_docs, "question": question, "web_search": web_search}

    def generate(self, state):
        """Generate a response using the RAG model."""
        print("---GENERATING ANSWER---")
        question = state["question"]
        documents = state["documents"]
        generation = self.rag_chain.invoke({"context": documents, "question": question})
        return {"documents": documents, "question": question, "generation": generation}

    def transform_query(self, state):
        """Re-write the question to optimize for web search."""
        print("---TRANSFORMING QUERY---")
        question = state["question"]
        better_question = self.question_rewriter.invoke({"question": question})
        return {"documents": state["documents"], "question": better_question}

    def web_search(self, state):
        """Perform web search using the re-written question."""
        print("---PERFORMING WEB SEARCH---")
        question = state["question"]
        docs = self.web_search_tool.invoke({"query": question})
        web_results = Document(page_content="\n".join([d["content"] if isinstance(d, dict) else d for d in docs]))
        state["documents"].append(web_results)
        return {"documents": state["documents"], "question": question}

    def decide_to_generate(self, state):
        """Decide whether to generate an answer or transform the query."""
        print("---ASSESSING DOCUMENT QUALITY---")
        if state["web_search"] == "Yes":
            print("---DOCUMENTS NOT RELEVANT, TRANSFORMING QUERY---")
            return "transform_query"
        print("---DOCUMENTS RELEVANT, GENERATING RESPONSE---")
        return "generate"

    def generate_graph(self):
        """Define and compile the LangGraph workflow."""
        self.workflow.add_node("retrieve", self.retrieve)
        self.workflow.add_node("grade_documents", self.grade_documents)
        self.workflow.add_node("generate", self.generate)
        self.workflow.add_node("transform_query", self.transform_query)
        self.workflow.add_node("web_search_node", self.web_search)

        # Define workflow connections
        self.workflow.add_edge(START, "retrieve")
        self.workflow.add_edge("retrieve", "grade_documents")
        self.workflow.add_conditional_edges("grade_documents", self.decide_to_generate, {
            "transform_query": "transform_query",
            "generate": "generate",
        })
        self.workflow.add_edge("transform_query", "web_search_node")
        self.workflow.add_edge("web_search_node", "generate")
        self.workflow.add_edge("generate", END)

        # Compile the graph
        return self.workflow.compile()

    def display_graph(self):
        """Display the generated graph."""
        display(Image(self.app.get_graph(xray=True).draw_mermaid_png()))

    def produce_response(self, query: str) -> str:
        """Generate a non-streamed response for a given query."""

        inputs = {"question": query}
        print("\n🔹 **Processing Query:**", query, "\n")

        # Run the LangGraph pipeline synchronously (non-streaming mode)
        output = self.app.invoke(inputs)

        # Extract the final response
        final_response = output.get("generation", "Error: No valid response generated.")

        print(f"\n**Final Response:** {final_response}")  # Optional: Print the response for debugging

        return final_response  # Return the final response as a string
