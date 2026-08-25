import logging
import os
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from backend import config

logger = logging.getLogger(__name__)

class ArticleIntel(BaseModel):
    summary: str = Field(description="A brief 2-3 sentence TL;DR of the security incident or vulnerability.")
    mitigation: str = Field(description="The recommended mitigation, patch, or workaround. If none, state 'No known mitigation'.")
    attack_vector: str = Field(description="How the vulnerability is exploited (e.g., 'Phishing', 'Remote Code Execution via SMB', 'SQL Injection').")
    shodan_dork: str = Field(description="A hypothetical or actual Shodan dork to find affected systems, e.g. 'Server: Apache/2.4.49' or 'port:3389'. Leave blank if inapplicable.")

def analyze_article(text: str) -> dict | None:
    api_key = config.GEMINI_API_KEY
    if not api_key or api_key == "your_gemini_api_key_here":
        logger.warning("GEMINI_API_KEY is not set or using placeholder. Skipping AI analysis.")
        return None

    try:
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are a highly skilled Threat Intelligence Analyst. 
        Analyze the following security news article and extract the requested fields in JSON.
        Keep your answers concise and actionable for a security team.

        Article Text:
        {text[:4000]} # Truncate to avoid massive payloads just in case
        """

        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ArticleIntel,
            ),
        )
        
        # Pydantic schema validation is built-in via the new SDK's response_schema
        # The response.text is guaranteed to be a JSON string matching the schema
        import json
        if not response.text:
            return None
        return json.loads(response.text)

    except Exception as e:
        logger.error(f"Failed to analyze article with Gemini: {e}")
        return None
