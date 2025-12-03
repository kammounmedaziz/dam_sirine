"""
API Module (Optional)
Standalone REST API without Gradio UI
Use this if you only need the API endpoint
"""

from typing import Dict, List, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from llm_client import LLMClient
from ai_features import AnnouncementGenerator
import uvicorn


# Request model
class AnnouncementRequest(BaseModel):
    """Request schema for announcement generation"""
    audience: str = Field(..., description="Target audience: students, administrative staff, or both")
    instruction: str = Field(..., description="Announcement instruction or content")
    creativity: float = Field(0.5, ge=0.0, le=1.0, description="Creativity/temperature parameter")


# Response model
class AnnouncementObject(BaseModel):
    """Single announcement object"""
    title: str
    audience: str
    content: str


# Initialize FastAPI app
app = FastAPI(
    title="Announcement Generator API",
    description="Generate 3 announcement variations using AI",
    version="1.0.0"
)

# Initialize generator
generator = AnnouncementGenerator(LLMClient())


@app.post("/api/generate", response_model=List[AnnouncementObject])
async def generate_announcements(request: AnnouncementRequest) -> List[Dict[str, Any]]:
    """
    Generate 3 announcement variations.
    
    Args:
        request: AnnouncementRequest with audience, instruction, and creativity
        
    Returns:
        List of 3 announcement objects
        
    Raises:
        HTTPException: If generation fails
    """
    try:
        announcements = generator.generate(
            audience=request.audience,
            instruction=request.instruction,
            creativity=request.creativity
        )
        
        # Check for error responses
        if announcements and announcements[0].get("title") in ["ERROR", "REFUSED"]:
            raise HTTPException(status_code=400, detail=announcements[0].get("content"))
        
        return announcements
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "announcement-generator"}


def run_api(host: str = "0.0.0.0", port: int = 8000):
    """
    Run the standalone FastAPI server.
    
    Args:
        host: Server host address
        port: Server port number
    """
    print(f"🚀 Starting Announcement Generator API")
    print(f"📡 Using model: {generator.llm_client.model_id}")
    print(f"🔌 API endpoint: http://{host}:{port}/api/generate")
    print(f"📄 API docs: http://{host}:{port}/docs")
    
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    run_api()
