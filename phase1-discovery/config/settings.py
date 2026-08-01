"""Application configuration."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = f"sqlite:///{PROJECT_ROOT / 'data' / 'discovery.db'}"
    raw_data_dir: Path = PROJECT_ROOT / "data" / "raw"
    outputs_dir: Path = PROJECT_ROOT / "outputs"
    handoff_dir: Path = PROJECT_ROOT / "outputs" / "handoff"

    embedding_model: str = "all-MiniLM-L6-v2"
    use_openai_embeddings: bool = False
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    use_llm: bool = True

    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    reddit_user_agent: str = "SwiggyDiscoveryBot/1.0"

    apify_api_token: str = ""

    min_evidence_per_insight: int = 3
    rag_top_k: int = 20
    cluster_min_size: int = 5

    supported_languages: tuple[str, ...] = ("en", "hi")

    def ensure_dirs(self) -> None:
        self.raw_data_dir.mkdir(parents=True, exist_ok=True)
        self.outputs_dir.mkdir(parents=True, exist_ok=True)
        self.handoff_dir.mkdir(parents=True, exist_ok=True)
        (PROJECT_ROOT / "data").mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.ensure_dirs()
