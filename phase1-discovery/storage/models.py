"""SQLAlchemy models for Phase 1 discovery engine."""

import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Document(Base):
    __tablename__ = "documents"
    __table_args__ = (UniqueConstraint("source_type", "source_id", name="uq_source"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    source_id: Mapped[str] = mapped_column(String(255), nullable=False)
    source_url: Mapped[str | None] = mapped_column(Text)
    app_name: Mapped[str | None] = mapped_column(String(100))
    title: Mapped[str | None] = mapped_column(Text)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    rating: Mapped[int | None] = mapped_column(SmallInteger)
    author_hash: Mapped[str | None] = mapped_column(String(64))
    published_at: Mapped[datetime | None] = mapped_column(DateTime)
    ingested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    language: Mapped[str | None] = mapped_column(String(10))
    dedupe_hash: Mapped[str] = mapped_column(String(64), unique=True)
    raw_path: Mapped[str | None] = mapped_column(Text)
    sentiment_score: Mapped[float | None] = mapped_column(Float)
    frustration_score: Mapped[float | None] = mapped_column(Float)

    tags: Mapped[list["DocumentTag"]] = relationship(back_populates="document", cascade="all, delete-orphan")
    chunks: Mapped[list["DocumentChunk"]] = relationship(back_populates="document", cascade="all, delete-orphan")
    evidence_links: Mapped[list["InsightEvidence"]] = relationship(back_populates="document")


class DocumentTag(Base):
    __tablename__ = "document_tags"
    __table_args__ = (UniqueConstraint("document_id", "tag_type", "tag_value", name="uq_doc_tag"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("documents.id"), nullable=False)
    tag_type: Mapped[str] = mapped_column(String(50), nullable=False)
    tag_value: Mapped[str] = mapped_column(String(255), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=1.0)

    document: Mapped["Document"] = relationship(back_populates="tags")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("documents.id"), nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, default=0)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[str] = mapped_column(Text, nullable=False)  # JSON array of floats

    document: Mapped["Document"] = relationship(back_populates="chunks")


class Theme(Base):
    __tablename__ = "themes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    cluster_id: Mapped[int | None] = mapped_column(Integer)
    document_count: Mapped[int] = mapped_column(Integer, default=0)
    avg_sentiment: Mapped[float | None] = mapped_column(Float)
    research_question: Mapped[str | None] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    insights: Mapped[list["Insight"]] = relationship(back_populates="theme", cascade="all, delete-orphan")


class Insight(Base):
    __tablename__ = "insights"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    theme_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("themes.id"))
    statement: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_count: Mapped[int] = mapped_column(Integer, default=0)
    confidence: Mapped[str] = mapped_column(String(20), default="medium")
    validation_status: Mapped[str] = mapped_column(String(20), default="pending")
    reviewer_notes: Mapped[str | None] = mapped_column(Text)
    research_question: Mapped[str | None] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    theme: Mapped["Theme | None"] = relationship(back_populates="insights")
    evidence: Mapped[list["InsightEvidence"]] = relationship(back_populates="insight", cascade="all, delete-orphan")


class InsightEvidence(Base):
    __tablename__ = "insight_evidence"
    __table_args__ = (UniqueConstraint("insight_id", "document_id", name="uq_insight_doc"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    insight_id: Mapped[str] = mapped_column(String(36), ForeignKey("insights.id"), nullable=False)
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("documents.id"), nullable=False)
    quote_span: Mapped[str] = mapped_column(Text, nullable=False)
    relevance_score: Mapped[float] = mapped_column(Float, default=1.0)

    insight: Mapped["Insight"] = relationship(back_populates="evidence")
    document: Mapped["Document"] = relationship(back_populates="evidence_links")


class Hypothesis(Base):
    __tablename__ = "hypotheses"

    id: Mapped[str] = mapped_column(String(20), primary_key=True)
    statement: Mapped[str] = mapped_column(Text, nullable=False)
    research_question: Mapped[str] = mapped_column(String(10))
    theme_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("themes.id"))
    confidence: Mapped[str] = mapped_column(String(20), default="medium")
    barrier_codes: Mapped[str | None] = mapped_column(Text)  # JSON array
    segment_signals: Mapped[str | None] = mapped_column(Text)  # JSON array
    evidence_document_ids: Mapped[str | None] = mapped_column(Text)  # JSON array
    sample_quotes: Mapped[str | None] = mapped_column(Text)  # JSON array
    suggested_interview_probe: Mapped[str | None] = mapped_column(Text)
    suggested_screener_field: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
