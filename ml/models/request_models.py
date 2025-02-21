"""API Request model"""

from pydantic import BaseModel

class StateRequest(BaseModel):
    """Request model for POST '/chat' endpoint"""
    query: str
    thread_id: str


class TranslationRequest(BaseModel):
    """Request model for POST '/translate' endpoint"""
    query: str  # Text to translate
    source: str = "auto"  # Source language (default auto-detect)
    target: str = "en"  # Target language (default English)
    email: str = None  # Optional: Email for better rate limits
