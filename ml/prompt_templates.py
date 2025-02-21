"""Prompts"""

from models.legal_category import LegalCategory

def generate_prompt(question, context):
    """Generate a prompt for the base model based on a template."""
    return f"""
            You are a helpful, knowledgeable assistant for Consultations regarding Indian Legal matters. Use the following conversation history to provide a relevant and informed response.
            Help the user in every way you even upto medium to high level cases and offence, also clear up any enquiries the user may have.

            Conversation History:
            {context}

            Current User Question:
            {question}

            If you don't know the answer don't make up random things.
            Keep your response clear, concise, and helpful.
            Generate the response in .md file format only.
            """
# , but if the issue might be too serious or morally reprehensible then return this 'I cannot help you in this matter. Please contact LLB P.K. Mathur (+915846568952) and nothing else as it will be used later.'
# If you don't know the answer, simply return 'NAN' and nothing else as it will be used later.


def genetrate_translation_prompt(base_text: str, target: str) -> str:
    """Generate a prompt for the translation model based on a template."""
    return f"""
            You are a prefessional translater, your task is to translate the given text into the language provided below.

            Original text:
            {base_text}

            Target language:
            {target}

            Try to preserve the original meaning and context of the given text.
            Generate the response in .md file format only if the original text is in .md file format.
            If the original text is not in .md file format, don't format the translated response in .md file format and instead just give the translated text in the target language.
            """


def genetrate_summarization_prompt(history: str) -> str:
    """Generate a prompt for the translation model based on a template."""
    return f"""
            You are a prefessional assistant, your task is to summarize the given history provided below.

            History:
            {history}

            Try to preserve the original meaning and context of the given text.
            Generate the response in .md file format only.
            """


def generate_grade_chat_history_prompt(history: str) -> str:
    """Grade the chat history to generate a legal category"""
    return f"""
            You are a prefessional assistant, your task is to understand the given history provided below and return legal category that best describes it, the list of legal categories is given below.

            Legal category list:
            {[cat.value for cat in LegalCategory]}

            History:
            {history}

            Try to give a category only from the Legal category list provided.
            If no Legal category is applicable simply return 'NAN' and nothing else.
            """
