import json
import logging
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from openai import OpenAI
from pydantic import ValidationError

from ingestion.base import RawDocument
from config.settings import settings

logger = logging.getLogger(__name__)

class GroqAIScraper:
    def __init__(self):
        self.client = None
        if not settings.groq_api_key:
            logger.warning("GROQ_API_KEY is not set! AI Extraction will be bypassed.")
        else:
            # Initialize Groq client using OpenAI package wrapper
            self.client = OpenAI(
                api_key=settings.groq_api_key,
                base_url="https://api.groq.com/openai/v1"
            )
        self.model_name = settings.groq_model or "llama-3.3-70b-versatile"

    def fetch_url_text(self, url: str) -> str:
        """Download and extract raw text from a webpage."""
        logger.info(f"Downloading from {url}...")
        try:
            # Provide a valid identifiable User-Agent as required by many sites (like Wikimedia)
            headers = {
                "User-Agent": "SwiggyDiscoveryBot/1.0 (contact@swiggy.com) python-httpx/0.28"
            }
            response = httpx.get(url, headers=headers, timeout=15.0)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Remove scripts, styles
            for script in soup(["script", "style"]):
                script.decompose()
                
            text = soup.get_text(separator=" ", strip=True)
            # truncation just in case it's massive
            return text[:100000]
        except Exception as e:
            logger.error(f"Failed to fetch {url}: {e}")
            return ""

    def extract_discussions(self, text: str, source_url: str, limit: int = 5) -> list[RawDocument]:
        """Use LLM to extract forum posts/comments from raw page text."""
        if not text:
            return []
            
        if not self.client:
            logger.warning("No LLM client initialized. Returning fallback mock data.")
            return [RawDocument(
                source_type="forums",
                source_id="mock_ai_post",
                title="AI Scraper Mock Post",
                body="This is a mock post because the GROQ_API_KEY was not configured properly. " + text[:100],
                source_url=source_url,
                app_name="mixed",
                author_hash="mock",
                published_at=datetime.utcnow()
            )]

        prompt = (
            "You are an AI data extraction scraper. I will give you the raw text of a webpage discussing quick-commerce apps like Swiggy Instamart, Zepto, or Blinkit.\n"
            f"Extract up to {limit} user comments, reviews, or forum posts discussing their experiences, problems, or habits.\n"
            "Format the output strictly as a JSON array of objects with the following keys:\n"
            "- id: (string, short unique ID like 'post1')\n"
            "- title: (string, a short summary of the comment/post)\n"
            "- body: (string, the actual text of the comment/post)\n"
            "- author: (string, author name or 'anonymous')\n\n"
            "Output ONLY valid JSON array. No markdown blocks, no other text."
        )

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": text[:30000]} # fit into context window
                ],
                temperature=0.0
            )
            
            content = response.choices[0].message.content.strip()
            # Clean up markdown formatting if present
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
                
            data = json.loads(content)
            
            docs = []
            for item in data:
                doc = RawDocument(
                    source_type="forums",
                    source_id=item.get("id", "unknown_id"),
                    title=item.get("title", ""),
                    body=item.get("body", ""),
                    source_url=source_url,
                    app_name="mixed",
                    author_hash=item.get("author", "anonymous"),
                    published_at=datetime.utcnow(),
                    metadata={"ai_extracted": True}
                )
                docs.append(doc)
            return docs
            
        except Exception as e:
            logger.error(f"Failed to extract info via Groq: {e}")
            return []
