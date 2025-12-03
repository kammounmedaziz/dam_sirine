"""
Main Application Entry Point
Announcement Generator - Gradio UI + REST API
"""

import os
from llm_client import LLMClient
from ai_features import AnnouncementGenerator
from gradio_app import GradioApp


def main():
    """Main application entry point"""
    
    # Check for API key
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("⚠️  ERROR: OPENROUTER_API_KEY not found in environment variables")
        print("Please create a .env file with your OpenRouter API key:")
        print("OPENROUTER_API_KEY=your_key_here")
        exit(1)
    
    # Initialize components
    llm_client = LLMClient()
    generator = AnnouncementGenerator(llm_client)
    app = GradioApp(generator)
    
    # Display startup info
    print(f"🚀 Starting Announcement Generator")
    print(f"📡 Using model: {llm_client.model_id}")
    print(f"🌐 UI will be available at: http://localhost:7860")
    print(f"🔌 API endpoint: http://localhost:7860/api/generate")
    
    # Launch application
    app.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False
    )


if __name__ == "__main__":
    main()
