"""
LLM Client Module
Handles all communication with OpenRouter API
"""

import os
import json
import requests
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL_ID = os.getenv("MODEL_ID", "mistralai/mistral-7b-instruct:free")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"


class LLMClient:
    """Client for interacting with OpenRouter API"""
    
    def __init__(self, api_key: str = None, model_id: str = None):
        """
        Initialize LLM client.
        
        Args:
            api_key: OpenRouter API key (defaults to env variable)
            model_id: Model ID to use (defaults to env variable or free Llama)
        """
        self.api_key = api_key or OPENROUTER_API_KEY
        self.model_id = model_id or MODEL_ID
        
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY not set in environment variables")
    
    def get_system_prompt(self) -> str:
        """
        Get the system prompt for announcement generation.
        
        Returns:
            System prompt string
        """
        return """You are an expert announcement writer. You MUST respond with ONLY valid JSON.
Your response must be a JSON array containing exactly 3 announcement objects.
Each object must have: title (string), audience (string), content (string).
Do not include any explanation, markdown formatting, or text outside the JSON array.
All content must be in English only. Be professional and clear."""
    
    def build_user_message(self, audience: str, instruction: str) -> str:
        """
        Build the user message for the API request.
        
        Args:
            audience: Target audience for announcements
            instruction: User's announcement instruction
            
        Returns:
            Formatted user message
        """
        return f"""Generate exactly 3 different announcement variations for the following:

Audience: {audience}
Instruction: {instruction}

Requirements:
- Create 3 unique variations of the same announcement
- Each must have a catchy title
- Content should be clear and professional
- Keep each announcement under 300 words
- Language must be English only

Return ONLY a valid JSON array with exactly 3 objects, no other text."""
    
    def call_api(
        self, 
        audience: str, 
        instruction: str, 
        creativity: float = 0.4
    ) -> Optional[str]:
        """
        Call OpenRouter API to generate announcements.
        
        Args:
            audience: Target audience
            instruction: Announcement instruction
            creativity: Temperature parameter (0.0 - 1.0)
            
        Returns:
            Raw API response text or None on error
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model_id,
            "messages": [
                {"role": "system", "content": self.get_system_prompt()},
                {"role": "user", "content": self.build_user_message(audience, instruction)}
            ],
            "temperature": creativity
        }
        
        try:
            response = requests.post(
                OPENROUTER_API_URL, 
                headers=headers, 
                data=json.dumps(payload), 
                timeout=30
            )
            print(f"Response Status: {response.status_code}")
            print(f"Response Text: {response.text[:500]}")  # Debug info
            response.raise_for_status()
            data = response.json()
            
            if "choices" in data and len(data["choices"]) > 0:
                return data["choices"][0]["message"]["content"]
            return None
            
        except requests.exceptions.RequestException as e:
            print(f"API Request Error: {e}")
            return None
        except Exception as e:
            print(f"Unexpected Error: {e}")
            return None
