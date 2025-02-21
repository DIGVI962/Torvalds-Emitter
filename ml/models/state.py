"""Internal state model"""

class State(dict):
    """Class for managing conversation state."""
    thread_id: str
    query: str
    response: str
    history: list[str]
    last_message_id: int
