from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatMessage, AIAnalysisResponse
import google.generativeai as genai
import json
import os

router = APIRouter()

# Initialize Gemini with the provided API Key
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyBzMLxU5OTUJy0SPTtU4ZyQB73N3vlwccU")
genai.configure(api_key=GEMINI_API_KEY)

# Use the recommended model
model = genai.GenerativeModel('gemini-pro')

@router.post("/analyze", response_model=AIAnalysisResponse)
async def analyze_symptoms(message: ChatMessage):
    prompt = f"""
    You are Shustota AI, an expert medical assistant.
    Analyze the following message from a user describing their health symptoms.
    Language: {message.language}
    
    IMPORTANT: DO NOT use any em dash characters ('—') in your response. Use standard hyphens ('-') or colons instead.
    
    You MUST respond with ONLY a JSON object matching this exact schema:
    {{
      "title": "String summarizing the issue",
      "severity": "String: 'low', 'moderate', or 'critical'",
      "description": "String with detailed analysis in the user's language",
      "symptoms": [
        {{ "name": "String", "duration": "String", "status": "String" }}
      ],
      "actionPlan": [
        {{ "text": "String action", "priority": "String: 'normal' or 'critical'" }}
      ]
    }}
    
    User's message: "{message.text}"
    """
    
    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Remove potential markdown JSON wrapping
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        result_text = result_text.strip()
        
        # Parse the JSON response
        data = json.loads(result_text)
        return AIAnalysisResponse(**data)
    except Exception as e:
        print("Gemini Error:", e)
        raise HTTPException(status_code=500, detail="Failed to analyze symptoms using AI.")
