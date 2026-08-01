import re
import html
import unicodedata
import hashlib

def normalize_unicode(text: str) -> str:
    """Normalize unicode characters eg. NFKC."""
    if not text:
        return ""
    return unicodedata.normalize("NFKC", text)

def strip_html(text: str) -> str:
    """Remove boilerplate HTML and decode entities."""
    if not text:
        return ""
    text = html.unescape(text)
    # Remove html tags
    clean = re.compile('<.*?>')
    return re.sub(clean, ' ', text)

def collapse_whitespace(text: str) -> str:
    """Collapse multiple spaces and newlines into single spaces."""
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()

def clean_text(raw_body: str) -> str:
    """Run full cleaning pipeline on document body."""
    text = normalize_unicode(raw_body)
    text = strip_html(text)
    text = collapse_whitespace(text)
    return text

def generate_dedupe_hash(source_type: str, cleaned_body: str) -> str:
    """Generate SHA256 string for deduplication."""
    # Using first 500 characters of cleaned body plus source_type
    key = f"{source_type}:{cleaned_body[:500]}"
    return hashlib.sha256(key.encode('utf-8')).hexdigest()
