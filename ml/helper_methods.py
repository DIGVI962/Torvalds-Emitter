"""Helper methods"""

from langchain_core.messages import HumanMessage
from models.state import State

def trim_chat_context(state: State, context_length: int = 10):
    """Trim the chat context to a maximum length."""
    history = state["history"]
    if len(history) > context_length:
        state["history"] = history[-context_length:]
    return state


def refactor_context(history):
    """Refactor the context into a list of dictionaries."""
    return [{"User": msg.content} if isinstance(msg, HumanMessage) else {"Assistant": msg.content} for msg in history]


def replace_last_occurrence(text, old, new):
    """Replace the last occurrence of a substring in a string."""
    parts = text.rsplit(old, 1)
    return new.join(parts)
