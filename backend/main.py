"""
FastAPI Backend for Speechmatics Voice Chat Application
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
import httpx
import asyncio
from datetime import datetime, timedelta
import jwt
import json

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Speechmatics Voice Chat API",
    description="Backend API for Speechmatics Flow integration",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Pydantic models
class JWTRequest(BaseModel):
    type: str = "flow"

class JWTResponse(BaseModel):
    jwt_token: str
    expires_in: int

class ConversationConfig(BaseModel):
    template_id: str
    template_variables: Dict[str, Any] = {}

class StartConversationRequest(BaseModel):
    config: ConversationConfig
    audio_format: Optional[Dict[str, Any]] = None

class ConversationResponse(BaseModel):
    session_id: str
    status: str
    message: str

# Configuration
SPEECHMATICS_API_KEY = os.getenv("API_KEY")
SPEECHMATICS_BASE_URL = "https://asr.api.speechmatics.com"
FLOW_BASE_URL = "wss://flow.api.speechmatics.com"

if not SPEECHMATICS_API_KEY:
    raise ValueError("API_KEY environment variable is required")

def create_speechmatics_jwt(token_type: str = "flow", ttl: int = 60) -> str:
    """Create a Speechmatics JWT token"""
    now = datetime.utcnow()
    payload = {
        "iss": "speechmatics",
        "aud": "speechmatics",
        "iat": now,
        "exp": now + timedelta(seconds=ttl),
        "type": token_type
    }
    
    return jwt.encode(payload, SPEECHMATICS_API_KEY, algorithm="HS256")

def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify API key from Authorization header"""
    if credentials.credentials != os.getenv("BACKEND_API_KEY", "your-backend-api-key"):
        raise HTTPException(status_code=401, detail="Invalid API key")
    return credentials.credentials

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Speechmatics Voice Chat API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/jwt", response_model=JWTResponse)
async def get_jwt_token(
    request: JWTRequest,
    api_key: str = Depends(verify_api_key)
):
    """Generate Speechmatics JWT token"""
    try:
        jwt_token = create_speechmatics_jwt(request.type)
        return JWTResponse(
            jwt_token=jwt_token,
            expires_in=60
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate JWT: {str(e)}")

@app.post("/api/conversation/start", response_model=ConversationResponse)
async def start_conversation(
    request: StartConversationRequest,
    api_key: str = Depends(verify_api_key)
):
    """Start a new conversation session"""
    try:
        # Generate JWT for the conversation
        jwt_token = create_speechmatics_jwt("flow")
        
        # For now, return a mock session ID
        # In a real implementation, you would establish a WebSocket connection
        session_id = f"session_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        return ConversationResponse(
            session_id=session_id,
            status="started",
            message="Conversation started successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start conversation: {str(e)}")

@app.post("/api/conversation/{session_id}/end")
async def end_conversation(
    session_id: str,
    api_key: str = Depends(verify_api_key)
):
    """End a conversation session"""
    try:
        # In a real implementation, you would close the WebSocket connection
        return {
            "session_id": session_id,
            "status": "ended",
            "message": "Conversation ended successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to end conversation: {str(e)}")

@app.get("/api/conversation/{session_id}/status")
async def get_conversation_status(
    session_id: str,
    api_key: str = Depends(verify_api_key)
):
    """Get conversation status"""
    try:
        # Mock status response
        return {
            "session_id": session_id,
            "status": "active",
            "connected": True,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get conversation status: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
