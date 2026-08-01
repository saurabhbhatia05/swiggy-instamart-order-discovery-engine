import re

try:
    from langdetect import detect, DetectorFactory
    DetectorFactory.seed = 0
    LANGDETECT_AVAILABLE = True
except ImportError:
    LANGDETECT_AVAILABLE = False


def detect_language(text: str) -> str:
    """Detect language of the text. Returns ISO code like 'en', 'hi'."""
    if not text or len(text.strip()) < 10:
        return "unknown"
    if not LANGDETECT_AVAILABLE:
        return "en" # Fallback if library missing
    
    try:
        lang = detect(text)
        return lang
    except Exception:
        return "unknown"

def filter_language(text: str, allowed: list[str] = None) -> bool:
    """Returns True if the language is within the allowed list (default 'en' and 'hi')."""
    if allowed is None:
        allowed = ["en", "hi", "unknown"]
    lang = detect_language(text)
    return lang in allowed

def redact_pii(text: str) -> str:
    """Redact Emails and Phone Numbers from text."""
    if not text:
        return ""
    
    # Simple email regex
    email_regex = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    text = re.sub(email_regex, "[EMAIL_REMOVED]", text)
    
    # Simple Indian phone number regex
    phone_regex = r"(?:\+91|91)?(?:[\s.-]*\d){10}"
    # to avoid redacting random 10 digit numbers like order IDs, we might be cautious.
    # We will use a stricter match for standard formats
    phone_regex_strict = r"(?:\+91[-.\s]?)?[789]\d{9}"
    text = re.sub(phone_regex_strict, "[PHONE_REMOVED]", text)
    
    return text

def extract_entities(text: str) -> dict:
    """Keyword-based entity extraction for categories and brand mentions."""
    text_lower = text.lower()

    categories = []
    for cat in ["groceries", "fruits", "vegetables", "personal care", "pet supplies", "snacks", "electronics"]:
        if cat in text_lower:
            categories.append(cat)

    brand_mentions = []
    if any(k in text_lower for k in ["swiggy", "instamart", "zepto", "blinkit", "bigbasket", "grofers"]):
        brand_mentions.append("swiggy_instamart")

    return {
        "brand": brand_mentions,
        "categories": categories,
    }
