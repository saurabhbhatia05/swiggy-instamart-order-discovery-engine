"""
Multi-source ingestion for Phase 1 discovery engine.

Targets ≥500 documents across 7 source types per architecture spec.
"""

import json
import os
from dataclasses import asdict
from datetime import datetime

from dotenv import load_dotenv

from ingestion.app_store import (
    APP_STORE_APPS,
    PLAY_STORE_APPS,
    AppleAppStoreConnector,
    PlayStoreConnector,
)
from ingestion.forums import ForumsConnector, SocialConnector
from ingestion.qc_product import ProductReviewConnector, QCDiscussionConnector
from ingestion.reddit import RedditConnector

load_dotenv()

RAW_DATA_DIR = "./data/raw"

# Per architecture: enough reviews per app to exceed 500 total with all sources
PLAY_STORE_LIMIT = 130
APP_STORE_LIMIT = 50
REDDIT_LIMIT = 100
FORUMS_LIMIT = 30
SOCIAL_LIMIT = 20
QC_LIMIT = 80
PRODUCT_REVIEW_LIMIT = 80


def json_serial(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


def save_dataset(source_name: str, docs: list) -> int:
    os.makedirs(RAW_DATA_DIR, exist_ok=True)
    filepath = os.path.join(RAW_DATA_DIR, f"{source_name}_dataset.json")
    docs_dict = [asdict(doc) for doc in docs]
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(docs_dict, f, ensure_ascii=False, indent=2, default=json_serial)
    print(f"  Saved {len(docs)} records -> {filepath}")
    return len(docs)


def fetch_play_store() -> list:
    all_docs = []
    for app in PLAY_STORE_APPS:
        name = app["app_name"]
        print(f"Play Store: {name} ({app['app_id']})...")
        try:
            connector = PlayStoreConnector(app_id=app["app_id"], app_name=name)
            docs = connector.fetch(limit=PLAY_STORE_LIMIT)
            save_dataset(f"play_store_{name}", docs)
            all_docs.extend(docs)
            print(f"  OK {len(docs)} reviews")
        except Exception as exc:
            print(f"  FAIL {name}: {exc}")
    save_dataset("play_store_all", all_docs)
    return all_docs


def fetch_app_store() -> list:
    all_docs = []
    for app in APP_STORE_APPS:
        name = app["app_name"]
        print(f"App Store: {name} (id={app['app_id']})...")
        try:
            connector = AppleAppStoreConnector(app_name=name, app_id=app["app_id"])
            docs = connector.fetch(limit=APP_STORE_LIMIT)
            save_dataset(f"app_store_{name}", docs)
            all_docs.extend(docs)
            print(f"  OK {len(docs)} reviews")
        except Exception as exc:
            print(f"  FAIL {name}: {exc}")
    save_dataset("app_store_all", all_docs)
    return all_docs


def fetch_reddit() -> list:
    print("Reddit...")
    docs = RedditConnector().fetch(limit=REDDIT_LIMIT)
    save_dataset("reddit", docs)
    print(f"  OK {len(docs)} posts")
    return docs


def fetch_forums_social() -> tuple[list, list]:
    print("Forums (Groq AI scraper)...")
    forums = ForumsConnector().fetch(limit=FORUMS_LIMIT)
    save_dataset("forums", forums)
    print(f"  OK {len(forums)} forum posts")

    print("Social (Groq AI scraper)...")
    social = SocialConnector().fetch(limit=SOCIAL_LIMIT)
    save_dataset("social", social)
    print(f"  OK {len(social)} social posts")

    combined = forums + social
    save_dataset("forums_social", combined)
    return forums, social


def fetch_qc_and_product() -> tuple[list, list]:
    print("QC discussions (Reddit search)...")
    qc = QCDiscussionConnector().fetch(limit=QC_LIMIT)
    save_dataset("qc_discussion", qc)
    print(f"  OK {len(qc)} posts")

    print("Product reviews (Reddit search)...")
    product = ProductReviewConnector().fetch(limit=PRODUCT_REVIEW_LIMIT)
    save_dataset("product_review", product)
    print(f"  OK {len(product)} posts")

    return qc, product


def print_summary(counts: dict[str, int]) -> None:
    total = sum(counts.values())
    print("\n" + "=" * 50)
    print("INGESTION SUMMARY")
    print("=" * 50)
    for source, count in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"  {source:25} {count:4}")
    print("-" * 50)
    print(f"  {'TOTAL':25} {total:4}")
    print("=" * 50)
    if total >= 500:
        print("Target of 500+ documents reached!")
    else:
        print(f"Below 500 target ({500 - total} short). Re-run or increase limits.")


def main():
    print("Phase 1 — Multi-source ingestion\n")

    counts = {}

    play = fetch_play_store()
    counts["play_store"] = len(play)

    app = fetch_app_store()
    counts["app_store"] = len(app)

    reddit = fetch_reddit()
    counts["reddit"] = len(reddit)

    forums, social = fetch_forums_social()
    counts["forums"] = len(forums)
    counts["social"] = len(social)

    qc, product = fetch_qc_and_product()
    counts["qc_discussion"] = len(qc)
    counts["product_review"] = len(product)

    print_summary(counts)


if __name__ == "__main__":
    main()
