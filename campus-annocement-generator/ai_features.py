"""
AI Features Module
Handles announcement generation, validation, moderation, and processing
"""

import json
import re
from typing import Dict, List, Any, Optional
from jsonschema import validate, ValidationError
from llm_client import LLMClient

# JSON Schema for validation
ANNOUNCEMENT_SCHEMA = {
    "type": "array",
    "minItems": 3,
    "maxItems": 3,
    "items": {
        "type": "object",
        "required": ["title", "audience", "content"],
        "properties": {
            "title": {"type": "string", "minLength": 1},
            "audience": {"type": "string", "enum": ["students", "administrative staff", "both"]},
            "content": {"type": "string", "minLength": 1}
        },
        "additionalProperties": False
    }
}

# Moderation keywords (basic implementation)
MODERATION_KEYWORDS = [
    "kill", "murder", "violence", "sexual", "porn", "drug", "illegal", 
    "weapon", "bomb", "terrorist", "suicide", "abuse", "assault"
]


class AnnouncementGenerator:
    """Main class for generating and processing announcements"""
    
    def __init__(self, llm_client: LLMClient = None):
        """
        Initialize announcement generator.
        
        Args:
            llm_client: LLM client instance (creates new one if not provided)
        """
        self.llm_client = llm_client or LLMClient()
    
    @staticmethod
    def moderate_text(text: str) -> bool:
        """
        Basic moderation check for inappropriate content.
        
        Args:
            text: Input text to moderate
            
        Returns:
            True if content is safe, False if it should be refused
        """
        text_lower = text.lower()
        for keyword in MODERATION_KEYWORDS:
            if keyword in text_lower:
                return False
        return True
    
    @staticmethod
    def enforce_length(content: str, max_words: int = 300) -> str:
        """
        Enforce maximum word count on content.
        
        Args:
            content: Text content to limit
            max_words: Maximum number of words allowed
            
        Returns:
            Truncated content if necessary
        """
        words = content.split()
        if len(words) > max_words:
            return " ".join(words[:max_words]) + "..."
        return content
    
    def parse_and_validate(self, response_text: str) -> Optional[List[Dict[str, Any]]]:
        """
        Parse and validate JSON response from the model.
        
        Args:
            response_text: Raw text response from API
            
        Returns:
            Validated list of announcement objects or None if invalid
        """
        if not response_text:
            return None
        
        # Try to extract JSON from response (handle markdown code blocks)
        json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(1)
        else:
            # Try to find JSON array in the text
            json_match = re.search(r'\[\s*\{.*?\}\s*\]', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(0)
        
        try:
            # Parse JSON
            data = json.loads(response_text.strip())
            
            # Validate against schema
            validate(instance=data, schema=ANNOUNCEMENT_SCHEMA)
            
            # Enforce length on each announcement
            for announcement in data:
                announcement["content"] = self.enforce_length(announcement["content"], max_words=300)
            
            return data
            
        except json.JSONDecodeError as e:
            print(f"JSON Parse Error: {e}")
            return None
        except ValidationError as e:
            print(f"Schema Validation Error: {e}")
            return None
        except Exception as e:
            print(f"Validation Error: {e}")
            return None
    
    def generate(
        self, 
        audience: str, 
        instruction: str, 
        creativity: float = 0.4,
        max_retries: int = 1
    ) -> List[Dict[str, Any]]:
        """
        Generate announcements with moderation, validation, and retry logic.
        
        Args:
            audience: Target audience
            instruction: Announcement instruction
            creativity: Temperature parameter
            max_retries: Number of retry attempts for invalid responses
            
        Returns:
            List of 3 announcement objects or REFUSED/ERROR object
        """
        # Moderation check
        if not self.moderate_text(instruction):
            return [{
                "title": "REFUSED",
                "audience": audience,
                "language": "en",
                "content": "Content moderation: Request contains inappropriate or prohibited content."
            }]
        
        # Validate input
        if not instruction or instruction.strip() == "":
            return [{
                "title": "ERROR",
                "audience": audience or "both",
                "language": "en",
                "content": "Instruction cannot be empty"
            }]
        
        # Try to generate with retry logic
        for attempt in range(max_retries + 1):
            response_text = self.llm_client.call_api(audience, instruction, creativity)
            
            if response_text:
                announcements = self.parse_and_validate(response_text)
                
                if announcements:
                    return announcements
                
                print(f"Attempt {attempt + 1}/{max_retries + 1}: Invalid response format")
            else:
                print(f"Attempt {attempt + 1}/{max_retries + 1}: API call failed")
        
        # Return error object if all attempts failed
        return [{
            "title": "ERROR",
            "audience": audience,
            "language": "en",
            "content": "Failed to generate valid announcements after multiple attempts. Please try again."
        }]
    
    def generate_json_string(
        self, 
        audience: str, 
        instruction: str, 
        creativity: float = 0.4
    ) -> str:
        """
        Generate announcements and return as pretty-printed JSON string.
        
        Args:
            audience: Target audience
            instruction: Announcement instruction
            creativity: Temperature parameter
            
        Returns:
            Pretty-printed JSON string
        """
        announcements = self.generate(audience, instruction, creativity)
        return json.dumps(announcements, indent=2, ensure_ascii=False)
