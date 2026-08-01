"""Base ingestion connector."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class RawDocument:
    source_type: str
    source_id: str
    body: str
    title: str | None = None
    source_url: str | None = None
    app_name: str | None = None
    rating: int | None = None
    author_hash: str | None = None
    published_at: datetime | None = None
    metadata: dict = field(default_factory=dict)


class BaseConnector(ABC):
    source_type: str

    @abstractmethod
    def fetch(self, limit: int | None = None) -> list[RawDocument]:
        """Fetch documents from the source."""

    @property
    def is_configured(self) -> bool:
        return True
