"""Reddit ingestion — PRAW, public JSON API, and Groq AI fallback."""

import hashlib
import os
import time
from datetime import datetime
from urllib.parse import quote_plus

import httpx

from ingestion.base import BaseConnector, RawDocument

try:
    import praw

    PRAW_AVAILABLE = True
except ImportError:
    PRAW_AVAILABLE = False

REDDIT_HEADERS = {
    "User-Agent": "SwiggyDiscoveryBot/1.0 (Phase1 Research; contact@example.com)",
}


def hash_author(username: str) -> str:
    return hashlib.sha256(username.encode("utf-8")).hexdigest()


class RedditPublicConnector:
    """No-auth Reddit search via public JSON endpoints."""

    def search(self, query: str, limit: int = 100, source_type: str = "reddit") -> list[RawDocument]:
        docs: list[RawDocument] = []
        after = None
        per_page = min(100, limit)

        while len(docs) < limit:
            url = (
                f"https://old.reddit.com/search.json?q={quote_plus(query)}"
                f"&limit={per_page}&sort=new&type=link"
            )
            if after:
                url += f"&after={after}"

            try:
                response = httpx.get(url, headers=REDDIT_HEADERS, timeout=20.0, follow_redirects=True)
                if response.status_code == 429:
                    time.sleep(3)
                    continue
                response.raise_for_status()
                payload = response.json()
            except Exception as exc:
                print(f"  Reddit public API error for '{query}': {exc}")
                break

            children = payload.get("data", {}).get("children", [])
            if not children:
                break

            for post in children:
                if len(docs) >= limit:
                    break
                data = post.get("data", {})
                post_id = data.get("id")
                if not post_id:
                    continue
                title = data.get("title", "")
                body = data.get("selftext") or title
                if len(body.strip()) < 20:
                    continue

                docs.append(
                    RawDocument(
                        source_type=source_type,
                        source_id=post_id,
                        title=title,
                        body=body,
                        source_url=f"https://reddit.com{data.get('permalink', '')}",
                        app_name="multiple",
                        author_hash=hash_author(data.get("author", "unknown")),
                        published_at=datetime.utcfromtimestamp(data.get("created_utc", 0)),
                        metadata={
                            "score": data.get("score"),
                            "num_comments": data.get("num_comments"),
                            "subreddit": data.get("subreddit"),
                            "query": query,
                        },
                    )
                )

            after = payload.get("data", {}).get("after")
            if not after:
                break
            time.sleep(1.2)

        return docs


class RedditConnector(BaseConnector):
    source_type = "reddit"

    def __init__(
        self,
        platform_query: str = "instamart OR zepto OR blinkit",
        subreddits: list[str] | None = None,
    ):
        self.platform_query = platform_query
        self.subreddits = subreddits or ["india", "bangalore", "mumbai", "delhi"]
        self.client_id = os.getenv("REDDIT_CLIENT_ID", "")
        self.client_secret = os.getenv("REDDIT_CLIENT_SECRET", "")
        self.user_agent = os.getenv("REDDIT_USER_AGENT", "SwiggyDiscoveryBot/1.0")
        self.reddit = None

        if PRAW_AVAILABLE and self.client_id and self.client_secret:
            try:
                self.reddit = praw.Reddit(
                    client_id=self.client_id,
                    client_secret=self.client_secret,
                    user_agent=self.user_agent,
                )
            except Exception as exc:
                print(f"Warning: Failed to initialize PRAW: {exc}")

        self.public = RedditPublicConnector()

    def fetch(self, limit: int = 50) -> list[RawDocument]:
        if self.reddit:
            docs = self._fetch_praw(limit)
            if docs:
                return docs

        print("  Using Reddit public JSON API (no OAuth keys required)...")
        queries = [
            "instamart grocery habit",
            "zepto blinkit quick commerce",
            "swiggy instamart reorder",
            "quick commerce category discovery",
        ]
        docs: list[RawDocument] = []
        seen: set[str] = set()
        per_query = max(25, limit // len(queries))

        for query in queries:
            if len(docs) >= limit:
                break
            batch = self.public.search(query, limit=per_query, source_type=self.source_type)
            for doc in batch:
                if doc.source_id not in seen:
                    seen.add(doc.source_id)
                    docs.append(doc)

        if docs:
            return docs[:limit]

        return self._generate_ai_fallback(limit)

    def _fetch_praw(self, limit: int) -> list[RawDocument]:
        docs = []
        subreddit_str = "+".join(self.subreddits)
        try:
            sub = self.reddit.subreddit(subreddit_str)
            for submission in sub.search(self.platform_query, limit=limit):
                author_name = submission.author.name if submission.author else "unknown"
                docs.append(
                    RawDocument(
                        source_type=self.source_type,
                        source_id=submission.id,
                        title=submission.title,
                        body=submission.selftext or submission.title,
                        source_url=f"https://reddit.com{submission.permalink}",
                        app_name="multiple",
                        author_hash=hash_author(author_name),
                        published_at=datetime.utcfromtimestamp(submission.created_utc),
                        metadata={
                            "score": submission.score,
                            "num_comments": submission.num_comments,
                        },
                    )
                )
        except Exception as exc:
            print(f"Error calling Reddit API: {exc}")
        return docs

    def _generate_ai_fallback(self, limit: int) -> list[RawDocument]:
        from ingestion.ai_scraper import GroqAIScraper

        try:
            scraper = GroqAIScraper()
        except Exception:
            return []

        target_urls = [
            "https://en.wikipedia.org/wiki/Swiggy",
            "https://en.wikipedia.org/wiki/Quick_commerce",
        ]
        docs = []
        for url in target_urls:
            if len(docs) >= limit:
                break
            text = scraper.fetch_url_text(url)
            if text:
                extracted = scraper.extract_discussions(text, source_url=url, limit=limit - len(docs))
                for doc in extracted:
                    doc.source_type = self.source_type
                    docs.append(doc)
        return docs[:limit]
