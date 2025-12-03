# Announcement Generator

Python application that generates 3 announcement variations using OpenRouter API with Gradio UI and REST API.

## Features

- **Gradio UI**: User-friendly interface for generating announcements
- **REST API**: `/api/generate` endpoint for integration with external services (e.g., NestJS backend)
- **Content Moderation**: Basic filtering for inappropriate content
- **JSON Validation**: Strict schema validation using jsonschema
- **Length Enforcement**: Max 300 words per announcement
- **Retry Logic**: Automatically retries once if model output is invalid
- **English-Only**: Enforces English language output

## Requirements

- Python ≥ 3.10
- OpenRouter API key (free tier available)

## Installation

1. Clone or download this project
2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the project root:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
MODEL_ID=meta-llama/llama-3.2-3b-instruct:free
```

Get your free API key at: https://openrouter.ai/

## Usage

### Running the Application

**With Gradio UI + API:**
```bash
python main.py
```

**Standalone API only (FastAPI):**
```bash
python api.py
```

The Gradio application will start on `http://localhost:7860`  
The standalone API will start on `http://localhost:8000`

### Gradio UI

1. Open browser to `http://localhost:7860`
2. Select target audience: students, administrative staff, or both
3. Enter your announcement instruction
4. Click "Generate 3 Announcements"
5. Copy the JSON output

### REST API Endpoint

**Endpoint**: `POST http://localhost:7860/api/generate`

**Request Body**:
```json
{
  "audience": "students",
  "instruction": "Final exams will be held on December 12th",
  "creativity": 0.5
}
```

**Response**:
```json
[
  {
    "title": "Important: Final Exams Schedule",
    "audience": "students",
    "content": "Dear students, this is to inform you that..."
  },
  {
    "title": "Final Exams Announcement",
    "audience": "students",
    "content": "Attention all students! Final examinations..."
  },
  {
    "title": "Exam Day Reminder",
    "audience": "students",
    "content": "Hello everyone, we would like to remind you..."
  }
]
```

### Example: Calling from NestJS

```typescript
const response = await fetch("http://localhost:7860/api/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    audience: "students",
    instruction: "Final exams on Dec 12",
    creativity: 0.5
  })
});

const announcements = await response.json();
console.log(announcements);
```

## Project Structure

```
main.py                 # Main application entry point
llm_client.py          # OpenRouter API client
ai_features.py         # AI generation, validation, moderation
gradio_app.py          # Gradio UI interface
api.py                 # Standalone FastAPI server (optional)
requirements.txt       # Python dependencies
.env                   # Environment variables (create this)
.env.example           # Environment template
README.md              # This file
```

## Functions Overview

### llm_client.py
- `LLMClient`: Main client class for OpenRouter API
  - `get_system_prompt()`: Returns system prompt for AI
  - `build_user_message()`: Constructs user prompt
  - `call_api()`: Makes API call to OpenRouter

### ai_features.py
- `AnnouncementGenerator`: Core announcement generation logic
  - `moderate_text()`: Basic content moderation
  - `enforce_length()`: Limits content to 300 words
  - `parse_and_validate()`: Validates JSON response
  - `generate()`: Main generation with retry logic
  - `generate_json_string()`: Returns formatted JSON string

### gradio_app.py
- `GradioApp`: Gradio interface wrapper
  - `generate_announcements_ui()`: UI handler
  - `create_interface()`: Builds Gradio UI
  - `launch()`: Starts Gradio server

### api.py (Optional)
- Standalone FastAPI server
- `/api/generate`: POST endpoint
- `/health`: Health check endpoint
- OpenAPI documentation at `/docs`

### main.py
- Application entry point
- Initializes all components
- Launches Gradio app

## JSON Schema

Each announcement object must contain:
- `title` (string): Announcement title
- `audience` (string): "students", "administrative staff", or "both"
- `content` (string): Announcement body (≤ 300 words)

## Environment Variables

- `OPENROUTER_API_KEY` (required): Your OpenRouter API key
- `MODEL_ID` (optional): OpenRouter model ID (default: mistralai/mistral-7b-instruct:free)

## Free Models Available

- `mistralai/mistral-7b-instruct:free` (recommended)
- `meta-llama/llama-3.2-1b-instruct:free`

See https://openrouter.ai/models for more options.

## Error Handling

The application returns special objects for errors:

**REFUSED** (moderation triggered):
```json
[{
  "title": "REFUSED",
  "audience": "students",
  "content": "Content moderation: Request contains inappropriate or prohibited content."
}]
```

**ERROR** (generation failed):
```json
[{
  "title": "ERROR",
  "audience": "students",
  "content": "Failed to generate valid announcements after multiple attempts. Please try again."
}]
```

## Notes

- The app uses basic keyword-based moderation
- Retry logic attempts generation twice before failing
- All outputs are validated against the JSON schema
- Content is automatically truncated to 300 words
- The API is accessible via Gradio's built-in FastAPI integration

## License

MIT
