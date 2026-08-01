"""Local filesystem raw document store."""

import json
from datetime import datetime, timezone
from pathlib import Path

from config.settings import settings


class RawStore:
    def __init__(self, base_dir: Path | None = None):
        self.base_dir = base_dir or settings.raw_data_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save(self, source_type: str, source_id: str, payload: dict) -> str:
        date_prefix = datetime.now(timezone.utc).strftime("%Y/%m/%d")
        dir_path = self.base_dir / source_type / date_prefix
        dir_path.mkdir(parents=True, exist_ok=True)
        file_path = dir_path / f"{source_id}.json"
        record = {
            "saved_at": datetime.now(timezone.utc).isoformat(),
            "source_type": source_type,
            "source_id": source_id,
            "payload": payload,
        }
        file_path.write_text(json.dumps(record, indent=2, default=str), encoding="utf-8")
        return str(file_path.relative_to(self.base_dir.parent))

    def load(self, raw_path: str) -> dict:
        full_path = settings.raw_data_dir.parent / raw_path if not Path(raw_path).is_absolute() else Path(raw_path)
        if not full_path.exists():
            full_path = settings.raw_data_dir / raw_path
        data = json.loads(full_path.read_text(encoding="utf-8"))
        return data.get("payload", data)
