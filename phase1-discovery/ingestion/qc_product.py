"""Product reviews and QC discussion ingestion via Reddit public search + Groq AI fallback."""

from ingestion.base import BaseConnector, RawDocument
from ingestion.reddit import RedditPublicConnector

QC_QUERIES = [
    "blinkit vs zepto vs instamart",
    "quick commerce delivery experience india",
    "grocery app habit reorder",
    "instamart personal care pet supplies",
]

PRODUCT_REVIEW_QUERIES = [
    "instamart product quality review",
    "zepto fresh vegetables quality",
    "blinkit delivery review india",
    "swiggy instamart rating experience",
]

QC_URLS = [
    "https://en.wikipedia.org/wiki/Quick_commerce",
    "https://en.wikipedia.org/wiki/Blinkit",
]

PRODUCT_URLS = [
    "https://en.wikipedia.org/wiki/Swiggy",
]


class QCDiscussionConnector(BaseConnector):
    source_type = "qc_discussion"

    def __init__(self):
        self.public = RedditPublicConnector()

    def fetch(self, limit: int = 80) -> list[RawDocument]:
        docs: list[RawDocument] = []
        seen: set[str] = set()
        per_query = max(20, limit // len(QC_QUERIES))

        for query in QC_QUERIES:
            if len(docs) >= limit:
                break
            batch = self.public.search(query, limit=per_query, source_type=self.source_type)
            for doc in batch:
                if doc.source_id not in seen:
                    seen.add(doc.source_id)
                    docs.append(doc)

        if len(docs) < limit // 2:
            docs.extend(self._groq_fallback(limit - len(docs), seen))

        return docs[:limit]

    def _groq_fallback(self, limit: int, seen: set[str]) -> list[RawDocument]:
        from ingestion.ai_scraper import GroqAIScraper

        try:
            scraper = GroqAIScraper()
        except Exception:
            return []

        docs = []
        for url in QC_URLS:
            if len(docs) >= limit:
                break
            text = scraper.fetch_url_text(url)
            if not text:
                continue
            extracted = scraper.extract_discussions(text, source_url=url, limit=limit - len(docs))
            for doc in extracted:
                doc.source_type = self.source_type
                key = doc.source_id
                if key not in seen:
                    seen.add(key)
                    docs.append(doc)
        return docs


class ProductReviewConnector(BaseConnector):
    source_type = "product_review"

    def __init__(self):
        self.public = RedditPublicConnector()

    def fetch(self, limit: int = 80) -> list[RawDocument]:
        docs: list[RawDocument] = []
        seen: set[str] = set()
        per_query = max(20, limit // len(PRODUCT_REVIEW_QUERIES))

        for query in PRODUCT_REVIEW_QUERIES:
            if len(docs) >= limit:
                break
            batch = self.public.search(query, limit=per_query, source_type=self.source_type)
            for doc in batch:
                if doc.source_id not in seen:
                    seen.add(doc.source_id)
                    docs.append(doc)

        if len(docs) < limit // 2:
            docs.extend(self._groq_fallback(limit - len(docs), seen))

        return docs[:limit]

    def _groq_fallback(self, limit: int, seen: set[str]) -> list[RawDocument]:
        from ingestion.ai_scraper import GroqAIScraper

        try:
            scraper = GroqAIScraper()
        except Exception:
            return []

        docs = []
        for url in PRODUCT_URLS:
            if len(docs) >= limit:
                break
            text = scraper.fetch_url_text(url)
            if not text:
                continue
            extracted = scraper.extract_discussions(text, source_url=url, limit=limit - len(docs))
            for doc in extracted:
                doc.source_type = self.source_type
                key = doc.source_id
                if key not in seen:
                    seen.add(key)
                    docs.append(doc)
        return docs
