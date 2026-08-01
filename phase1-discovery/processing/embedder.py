try:
    from sentence_transformers import SentenceTransformer
    MODEL_AVAILABLE = True
except ImportError:
    MODEL_AVAILABLE = False


class TextEmbedder:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        self.model_name = model_name
        self.model = None
        if MODEL_AVAILABLE:
            try:
                self.model = SentenceTransformer(self.model_name)
            except Exception as e:
                print(f"Warning: Failed to load SentenceTransformer: {e}")

    def chunk_text(self, text: str, max_words: int = 250, overlap: int = 50) -> list[str]:
        """Simple word-based chunking."""
        words = text.split()
        if len(words) <= max_words:
            return [text]
            
        chunks = []
        i = 0
        while i < len(words):
            chunk = " ".join(words[i:i + max_words])
            chunks.append(chunk)
            # Move forward by max_words - overlap
            i += (max_words - overlap)
            
        return chunks

    def embed_chunks(self, chunks: list[str]) -> list[list[float]]:
        """Generate dense embeddings for a list of text chunks."""
        if not self.model:
            # Return dummy embeddings for offline execution mode
            print("Warning: SentenceTransformer missing, returning zero-vector embeddings.")
            return [[0.0] * 384 for _ in chunks]
            
        embeddings = self.model.encode(chunks)
        return embeddings.tolist()
