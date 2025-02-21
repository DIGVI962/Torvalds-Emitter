"""API Response model"""

from pydantic import BaseModel

class ChatResponse(BaseModel):
    """Response model for POST '/chat/v2' endpoint"""
    message: str
