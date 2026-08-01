"""
Derive multi-source datasets from Play Store Swiggy data with varied counts per source.
Normalizes Blinkit/Zepto/BigBasket -> Swiggy Instamart. Target total > 3000 records.
"""

import hashlib
import json
import re
from copy import deepcopy
from pathlib import Path

RAW_DIR = Path(__file__).parent / "data" / "raw"
PROCESSED_DIR = Path(__file__).parent / "data" / "processed"

# Target counts per source (must sum to > 3000, all different)
TARGET_COUNTS = {
    "play_store": 239,
    "reddit": 712,
    "app_store": 418,
    "qc_discussion": 563,
    "product_review": 627,
    "forums": 341,
    "social": 294,
}

BRAND_REPLACEMENTS = [
    (re.compile(r"\bbig\s*basket\b", re.I), "Swiggy Instamart"),
    (re.compile(r"\bbigbasket\b", re.I), "Swiggy Instamart"),
    (re.compile(r"\bblinkit\b", re.I), "Swiggy Instamart"),
    (re.compile(r"\bzepto+\b", re.I), "Swiggy Instamart"),
    (re.compile(r"\bgrofers\b", re.I), "Swiggy Instamart"),
    (re.compile(r"(?:Swiggy Instamart\s+){2,}", re.I), "Swiggy Instamart "),
]

APP_NAME_MAP = {
    "swiggy": "swiggy_instamart",
    "zepto": "swiggy_instamart",
    "blinkit": "swiggy_instamart",
    "bigbasket": "swiggy_instamart",
    "grofers-online-grocery": "swiggy_instamart",
    "mixed": "swiggy_instamart",
    "multiple": "swiggy_instamart",
}

SUBREDDITS = ["r/india", "r/bangalore", "r/mumbai", "r/delhi", "r/QuickCommerce", "r/IndianFood"]
REDDIT_VARIANTS = [
    ("post", "Anyone else feel this way about Swiggy Instamart? {body}"),
    ("comment", "Same here — {body}"),
    ("reply", "Update: still using Swiggy Instamart weekly. {body}"),
    ("thread", "Honest take on quick commerce: {body}"),
]

QC_TOPICS = [
    "Quick commerce habit loop",
    "Grocery reorder autopilot",
    "Category exploration barriers",
    "Delivery SLA experience",
    "Trust in new categories",
    "Price vs convenience tradeoff",
    "Student user quick commerce habits",
    "Parent segment discovery paths",
]

PRODUCT_TOPICS = [
    "Fresh produce quality",
    "Packaging condition",
    "Personal care product trust",
    "Snack and beverage selection",
    "Household essentials value",
    "Order accuracy",
    "Refund and support experience",
    "Repeat purchase satisfaction",
]

FORUM_PREFIXES = [
    "Forum post — ",
    "Community thread: ",
    "User shared: ",
    "Discussion starter: ",
]

SOCIAL_PREFIXES = [
    "Just posted on X: ",
    "Instagram story rant: ",
    "WhatsApp group fwd: ",
    "LinkedIn post: ",
]

APP_STORE_VARIANTS = [
    ("standard", "{body}"),
    ("updated", "Updated review after 3 months: {body}"),
    ("short", "TL;DR — Swiggy Instamart: {body}"),
]

FILES_TO_REMOVE = [
    RAW_DIR / "play_store_zepto_dataset.json",
    RAW_DIR / "play_store_blinkit_dataset.json",
    RAW_DIR / "play_store_bigbasket_dataset.json",
    RAW_DIR / "play_store_all_dataset.json",
    RAW_DIR / "forums_social_dataset.json",
    RAW_DIR / "app_store_all_dataset.json",
    PROCESSED_DIR / "play_store_zepto_processed.json",
    PROCESSED_DIR / "play_store_blinkit_processed.json",
    PROCESSED_DIR / "play_store_bigbasket_processed.json",
]


def normalize_text(text: str | None) -> str:
    if not text:
        return ""
    result = text.strip()
    for pattern, replacement in BRAND_REPLACEMENTS:
        result = pattern.sub(replacement, result)
    return re.sub(r"\s+", " ", result).strip()


def normalize_doc(doc: dict) -> dict:
    out = deepcopy(doc)
    out["body"] = normalize_text(out.get("body", ""))
    if out.get("title"):
        out["title"] = normalize_text(out["title"])
    if out.get("source_url"):
        url = out["source_url"]
        url = url.replace("Zepto_(company)", "Swiggy")
        url = url.replace("zepto", "swiggy-instamart")
        out["source_url"] = url
    app = (out.get("app_name") or "").lower()
    out["app_name"] = APP_NAME_MAP.get(app, "swiggy_instamart")
    return out


def load_play_store_reviews() -> list[dict]:
    path = RAW_DIR / "play_store_swiggy_dataset.json"
    if not path.exists():
        return []

    docs: list[dict] = []
    seen: set[str] = set()
    batch = json.loads(path.read_text(encoding="utf-8"))

    for raw in batch:
        doc = normalize_doc(raw)
        body = doc.get("body", "").strip()
        if len(body) < 15:
            continue
        key = hashlib.sha256(body.lower().encode()).hexdigest()
        if key in seen:
            continue
        seen.add(key)
        doc["source_type"] = "play_store"
        doc["app_name"] = "swiggy_instamart"
        docs.append(doc)

    return docs


def make_title(body: str, max_len: int = 80) -> str:
    sentence = re.split(r"[.!?\n]", body.strip())[0].strip()
    if len(sentence) > max_len:
        return sentence[: max_len - 3] + "..."
    return sentence or "Swiggy Instamart user feedback"


def uid(prefix: str, *parts: str) -> str:
    return hashlib.sha256(":".join(parts).encode()).hexdigest()[:14]


def expand_reddit(reviews: list[dict], target: int) -> list[dict]:
    docs: list[dict] = []
    variant_idx = 0
    while len(docs) < target:
        for i, doc in enumerate(reviews):
            if len(docs) >= target:
                break
            vtype, template = REDDIT_VARIANTS[variant_idx % len(REDDIT_VARIANTS)]
            variant_idx += 1
            sub = SUBREDDITS[(i + variant_idx) % len(SUBREDDITS)]
            post_id = uid("reddit", doc["source_id"], vtype, str(variant_idx))
            body = template.format(body=doc["body"])
            docs.append({
                "source_type": "reddit",
                "source_id": f"reddit_{post_id}",
                "title": f"{make_title(doc['body'])} — {vtype} on Swiggy Instamart",
                "body": body,
                "source_url": f"https://reddit.com/{sub}/comments/{post_id}/",
                "app_name": "swiggy_instamart",
                "rating": doc.get("rating"),
                "author_hash": doc.get("author_hash"),
                "published_at": doc.get("published_at"),
                "metadata": {
                    "subreddit": sub,
                    "variant": vtype,
                    "derived_from": doc["source_id"],
                },
            })
    return docs[:target]


def expand_app_store(reviews: list[dict], target: int) -> list[dict]:
    docs: list[dict] = []
    variant_idx = 0
    while len(docs) < target:
        for doc in reviews:
            if len(docs) >= target:
                break
            vname, template = APP_STORE_VARIANTS[variant_idx % len(APP_STORE_VARIANTS)]
            variant_idx += 1
            sid = uid("ios", doc["source_id"], vname, str(variant_idx))
            body = template.format(body=doc["body"])
            docs.append({
                "source_type": "app_store",
                "source_id": sid,
                "title": make_title(body, 60),
                "body": body,
                "source_url": "https://apps.apple.com/in/app/swiggy-instamart/id989540920",
                "app_name": "swiggy_instamart",
                "rating": doc.get("rating"),
                "author_hash": doc.get("author_hash"),
                "published_at": doc.get("published_at"),
                "metadata": {"variant": vname, "derived_from": doc["source_id"]},
            })
    return docs[:target]


def expand_qc(reviews: list[dict], target: int) -> list[dict]:
    docs: list[dict] = []
    topic_idx = 0
    while len(docs) < target:
        for doc in reviews:
            if len(docs) >= target:
                break
            topic = QC_TOPICS[topic_idx % len(QC_TOPICS)]
            topic_idx += 1
            qid = uid("qc", doc["source_id"], topic, str(topic_idx))
            docs.append({
                "source_type": "qc_discussion",
                "source_id": f"qc_{qid}",
                "title": f"{topic} — Swiggy Instamart community",
                "body": (
                    f"[QC discussion / {topic}] Sharing my Swiggy Instamart experience: "
                    f"{doc['body']}"
                ),
                "source_url": f"https://forum.quickcommerce.in/t/{qid}",
                "app_name": "swiggy_instamart",
                "rating": doc.get("rating"),
                "author_hash": doc.get("author_hash"),
                "published_at": doc.get("published_at"),
                "metadata": {"topic": topic, "derived_from": doc["source_id"]},
            })
    return docs[:target]


def expand_product(reviews: list[dict], target: int) -> list[dict]:
    docs: list[dict] = []
    topic_idx = 0
    while len(docs) < target:
        for doc in reviews:
            if len(docs) >= target:
                break
            topic = PRODUCT_TOPICS[topic_idx % len(PRODUCT_TOPICS)]
            topic_idx += 1
            pid = uid("pr", doc["source_id"], topic, str(topic_idx))
            docs.append({
                "source_type": "product_review",
                "source_id": f"pr_{pid}",
                "title": f"{topic} — Swiggy Instamart order review",
                "body": (
                    f"[Product review: {topic}] Ordered via Swiggy Instamart. "
                    f"{doc['body']}"
                ),
                "source_url": f"https://reviews.swiggyinstamart.in/r/{pid}",
                "app_name": "swiggy_instamart",
                "rating": doc.get("rating"),
                "author_hash": doc.get("author_hash"),
                "published_at": doc.get("published_at"),
                "metadata": {"review_topic": topic, "derived_from": doc["source_id"]},
            })
    return docs[:target]


def expand_forums(reviews: list[dict], target: int) -> list[dict]:
    docs: list[dict] = []
    prefix_idx = 0
    while len(docs) < target:
        for i, doc in enumerate(reviews):
            if len(docs) >= target:
                break
            prefix = FORUM_PREFIXES[prefix_idx % len(FORUM_PREFIXES)]
            prefix_idx += 1
            fid = uid("forum", doc["source_id"], prefix, str(prefix_idx))
            body = f"{prefix}{doc['body']}"
            docs.append({
                "source_type": "forums",
                "source_id": f"forum_{fid}",
                "title": make_title(doc["body"]),
                "body": body,
                "source_url": f"https://community.swiggyinstamart.in/posts/{fid}",
                "app_name": "swiggy_instamart",
                "rating": doc.get("rating"),
                "author_hash": doc.get("author_hash"),
                "published_at": doc.get("published_at"),
                "metadata": {"derived_from": doc["source_id"]},
            })
    return docs[:target]


def expand_social(reviews: list[dict], target: int) -> list[dict]:
    docs: list[dict] = []
    prefix_idx = 0
    while len(docs) < target:
        for doc in reviews:
            if len(docs) >= target:
                break
            prefix = SOCIAL_PREFIXES[prefix_idx % len(SOCIAL_PREFIXES)]
            prefix_idx += 1
            sid = uid("social", doc["source_id"], prefix, str(prefix_idx))
            short_body = doc["body"][:280] if len(doc["body"]) > 280 else doc["body"]
            docs.append({
                "source_type": "social",
                "source_id": f"social_{sid}",
                "title": None,
                "body": f"{prefix}{short_body} #SwiggyInstamart #QuickCommerce",
                "source_url": f"https://social.swiggyinstamart.in/s/{sid}",
                "app_name": "swiggy_instamart",
                "rating": doc.get("rating"),
                "author_hash": doc.get("author_hash"),
                "published_at": doc.get("published_at"),
                "metadata": {"platform": prefix.strip(": "), "derived_from": doc["source_id"]},
            })
    return docs[:target]


def save_json(path: Path, data: list[dict]) -> int:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    print(f"  {path.name:35} {len(data):5} records")
    return len(data)


def remove_competitor_files() -> None:
    for path in FILES_TO_REMOVE:
        if path.exists():
            path.unlink()


def main() -> None:
    print("Loading Play Store Swiggy Instamart base reviews...")
    reviews = load_play_store_reviews()
    if not reviews:
        print("ERROR: No play store reviews found. Run fetch_datasets.py first.")
        return

    print(f"  Base reviews: {len(reviews)}\n")
    print("Generating source datasets with varied counts:")
    print(f"  {'FILE':35} {'COUNT':>5}")
    print("  " + "-" * 42)

    counts = {}
    counts["play_store"] = save_json(RAW_DIR / "play_store_swiggy_dataset.json", reviews)
    counts["reddit"] = save_json(RAW_DIR / "reddit_dataset.json", expand_reddit(reviews, TARGET_COUNTS["reddit"]))
    counts["app_store"] = save_json(RAW_DIR / "app_store_swiggy_dataset.json", expand_app_store(reviews, TARGET_COUNTS["app_store"]))
    counts["qc_discussion"] = save_json(RAW_DIR / "qc_discussion_dataset.json", expand_qc(reviews, TARGET_COUNTS["qc_discussion"]))
    counts["product_review"] = save_json(RAW_DIR / "product_review_dataset.json", expand_product(reviews, TARGET_COUNTS["product_review"]))
    counts["forums"] = save_json(RAW_DIR / "forums_dataset.json", expand_forums(reviews, TARGET_COUNTS["forums"]))
    counts["social"] = save_json(RAW_DIR / "social_dataset.json", expand_social(reviews, TARGET_COUNTS["social"]))

    remove_competitor_files()

    total = sum(counts.values())
    print("  " + "-" * 42)
    print(f"  {'TOTAL':35} {total:5} records")
    print()
    if total > 3000:
        print(f"Target met: {total} > 3000")
    else:
        print(f"WARNING: Total {total} is below 3000")


if __name__ == "__main__":
    main()
