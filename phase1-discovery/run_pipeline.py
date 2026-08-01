import os
import json
from processing.cleaner import clean_text, generate_dedupe_hash
from processing.nlp_pipeline import filter_language, redact_pii, extract_entities
from processing.embedder import TextEmbedder

RAW_DATA_DIR = "./data/raw"
PROCESSED_DATA_DIR = "./data/processed"

def process_file(filepath: str, embedder: TextEmbedder):
    if not os.path.exists(filepath):
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        docs = json.load(f)

    processed_docs = []
    seen_hashes = set()

    for raw_doc in docs:
        body = raw_doc.get("body", "")
        if not body:
            continue
            
        # 1. Cleaner
        cleaned_body = clean_text(body)
        
        # Deduplication
        dedupe_hash = generate_dedupe_hash(raw_doc["source_type"], cleaned_body)
        if dedupe_hash in seen_hashes:
            continue
        seen_hashes.add(dedupe_hash)
        
        # 2. Language Filter
        if not filter_language(cleaned_body):
            continue
            
        # 3. PII Redactor
        safe_body = redact_pii(cleaned_body)
        
        # 4. Entity Extraction
        entities = extract_entities(safe_body)
        
        # 5. Chunking & Embedding
        chunks = embedder.chunk_text(safe_body)
        embeddings = embedder.embed_chunks(chunks)
        
        # Create Processed Document
        processed_doc = {
            "source_type": raw_doc["source_type"],
            "source_id": raw_doc["source_id"],
            "published_at": raw_doc["published_at"],
            "clean_body": safe_body,
            "dedupe_hash": dedupe_hash,
            "entities": entities
        }
        processed_docs.append(processed_doc)
        
    filename = os.path.basename(filepath).replace("_dataset", "_processed")
    out_path = os.path.join(PROCESSED_DATA_DIR, filename)
    
    if not os.path.exists(PROCESSED_DATA_DIR):
        os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
        
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(processed_docs, f, ensure_ascii=False, indent=2)
        
    print(f"Processed {len(docs)} raw docs into {len(processed_docs)} clean docs: {out_path}")

def main():
    print("Initializing components...")
    embedder = TextEmbedder()
    
    if not os.path.exists(RAW_DATA_DIR):
        print(f"No raw data found in {RAW_DATA_DIR}")
        return
        
    for filename in os.listdir(RAW_DATA_DIR):
        if not filename.endswith(".json"):
            continue
        # Skip merged aggregate files (duplicate content)
        if filename.endswith("_all_dataset.json") or filename == "forums_social_dataset.json":
            print(f"Skipping aggregate file {filename}")
            continue
        filepath = os.path.join(RAW_DATA_DIR, filename)
        print(f"Processing {filepath}...")
        process_file(filepath, embedder)
            
    print("Pipeline run complete.")

if __name__ == "__main__":
    main()
