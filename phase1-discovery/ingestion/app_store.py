"""App Store and Play Store Ingestion Connectors."""

import hashlib
import time
from datetime import datetime

from google_play_scraper import Sort, reviews
from app_store_scraper import AppStore

from ingestion.base import BaseConnector, RawDocument


def hash_username(username: str) -> str:
    return hashlib.sha256(username.encode("utf-8")).hexdigest()


# Quick-commerce apps per architecture spec
PLAY_STORE_APPS = [
    {"app_id": "in.swiggy.android", "app_name": "swiggy"},
    {"app_id": "com.zeptoconsumerapp", "app_name": "zepto"},
    {"app_id": "com.grofers.customerapp", "app_name": "blinkit"},
    {"app_id": "com.bigbasket.mobileapp", "app_name": "bigbasket"},
]

APP_STORE_APPS = [
    {"app_name": "swiggy", "app_id": 989540920},
    {"app_name": "zepto", "app_id": 1640907654},
    {"app_name": "grofers-online-grocery", "app_id": 960335206},
    {"app_name": "bigbasket", "app_id": 660683603},
]


class PlayStoreConnector(BaseConnector):
    source_type = "play_store"

    def __init__(self, app_id: str, app_name: str, lang: str = "en", country: str = "in"):
        self.app_id = app_id
        self.app_name = app_name
        self.lang = lang
        self.country = country

    def fetch(self, limit: int = 100) -> list[RawDocument]:
        docs: list[RawDocument] = []
        continuation_token = None

        while len(docs) < limit:
            batch_size = min(100, limit - len(docs))
            kwargs = {
                "lang": self.lang,
                "country": self.country,
                "sort": Sort.NEWEST,
                "count": batch_size,
            }
            if continuation_token:
                kwargs["continuation_token"] = continuation_token

            result, continuation_token = reviews(self.app_id, **kwargs)
            if not result:
                break

            for r in result:
                if len(docs) >= limit:
                    break
                author_hash = hash_username(r["userName"]) if r.get("userName") else None
                docs.append(
                    RawDocument(
                        source_type=self.source_type,
                        source_id=r["reviewId"],
                        body=r["content"],
                        title=None,
                        app_name=self.app_name,
                        rating=r["score"],
                        author_hash=author_hash,
                        published_at=r["at"],
                    )
                )

            if not continuation_token:
                break
            time.sleep(0.5)

        return docs


class AppleAppStoreConnector(BaseConnector):
    source_type = "app_store"

    def __init__(self, app_name: str, app_id: int, country: str = "in"):
        self.app_name = app_name
        self.app_id = app_id
        self.country = country

    def fetch(self, limit: int = 100) -> list[RawDocument]:
        app = AppStore(country=self.country, app_name=self.app_name, app_id=self.app_id)
        app.review(how_many=limit)

        docs = []
        for r in app.reviews[:limit]:
            username = r.get("userName", "unknown")
            author_hash = hash_username(username)
            source_id = hashlib.sha256(
                (username + str(r["date"])[:19] + r.get("review", "")[:50]).encode("utf-8")
            ).hexdigest()
            docs.append(
                RawDocument(
                    source_type=self.source_type,
                    source_id=source_id,
                    body=r["review"],
                    title=r.get("title"),
                    app_name=self.app_name,
                    rating=r.get("rating"),
                    author_hash=author_hash,
                    published_at=r["date"],
                )
            )
        return docs
