"""Community forums and social ingestion via Groq AI web scraper."""

import hashlib
from datetime import datetime

from ingestion.base import BaseConnector, RawDocument


def hash_author(username: str) -> str:
    return hashlib.sha256(username.encode("utf-8")).hexdigest()


FORUM_URLS = [
    "https://en.wikipedia.org/wiki/Swiggy",
    "https://en.wikipedia.org/wiki/Quick_commerce",
    "https://en.wikipedia.org/wiki/Blinkit",
]

SOCIAL_URLS = [
    "https://en.wikipedia.org/wiki/Zepto_(company)",
]


class ForumsConnector(BaseConnector):
    source_type = "forums"

    def fetch(self, limit: int = 30) -> list[RawDocument]:
        from ingestion.ai_scraper import GroqAIScraper

        try:
            scraper = GroqAIScraper()
        except Exception as exc:
            print(f"Failed to init GroqAIScraper: {exc}")
            return []

        docs: list[RawDocument] = []
        for url in FORUM_URLS:
            if len(docs) >= limit:
                break
            text = scraper.fetch_url_text(url)
            if not text:
                continue
            print(f"  Forums: scraped {url}, extracting with Groq...")
            extracted = scraper.extract_discussions(text, source_url=url, limit=limit - len(docs))
            for doc in extracted:
                doc.source_type = self.source_type
                docs.append(doc)

        return docs[:limit]


class SocialConnector(BaseConnector):
    source_type = "social"

    def fetch(self, limit: int = 20) -> list[RawDocument]:
        from ingestion.ai_scraper import GroqAIScraper

        try:
            scraper = GroqAIScraper()
        except Exception as exc:
            print(f"Failed to init GroqAIScraper: {exc}")
            return []

        docs: list[RawDocument] = []
        for url in SOCIAL_URLS:
            if len(docs) >= limit:
                break
            text = scraper.fetch_url_text(url)
            if not text:
                continue
            print(f"  Social: scraped {url}, extracting with Groq...")
            extracted = scraper.extract_discussions(text, source_url=url, limit=limit - len(docs))
            for doc in extracted:
                doc.source_type = self.source_type
                docs.append(doc)

        return docs[:limit]
