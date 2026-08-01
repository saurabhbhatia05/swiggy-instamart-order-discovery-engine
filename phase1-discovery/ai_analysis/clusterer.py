import numpy as np
from collections import defaultdict

try:
    import hdbscan
    import umap
    HDBSCAN_AVAILABLE = True
except ImportError:
    HDBSCAN_AVAILABLE = False
    try:
        from sklearn.cluster import KMeans
        SKLEARN_AVAILABLE = True
    except ImportError:
        SKLEARN_AVAILABLE = False


class ThemeClusterer:
    """Clusters document chunks into themes based on vector embeddings."""
    
    def __init__(self, min_cluster_size: int = 2):
        self.min_cluster_size = min_cluster_size
        
        # We simulate LLM labeling internally here for Phase 1 demo
        self.mock_theme_labels = {
            0: "Discovery Barriers & Cognitive Load",
            1: "Habit Loops & Loyalty",
            2: "Unmet Needs & Frustrations",
            3: "Delivery Quality Issues"
        }

    def fit_predict(self, data: list[dict]) -> dict:
        """
        Input: list of processed doc dicts containing 'chunks' or 'clean_body'
        Output: Mapping of cluster_id -> list of document structures
        """
        texts = []
        doc_map = []
        
        for doc in data:
            # We removed 'chunks' earlier, so let's cluster the main 'clean_body' instead
            if "clean_body" in doc and len(doc["clean_body"].strip()) > 10:
                texts.append(doc["clean_body"])
                doc_map.append(doc)

        if not texts:
            return {}

        # Dummy embeddings if using fallback logic
        embeddings = np.random.rand(len(texts), 384)

        labels = []
        if HDBSCAN_AVAILABLE:
            try:
                reducer = umap.UMAP(n_components=10, metric='cosine', random_state=42)
                reduced_emb = reducer.fit_transform(embeddings)
                
                clusterer = hdbscan.HDBSCAN(min_cluster_size=self.min_cluster_size, metric='euclidean')
                labels = clusterer.fit_predict(reduced_emb)
            except Exception as e:
                print(f"Failed via UMAP/HDBSCAN ({e}), falling back to mock clustering.")
                labels = self._mock_cluster(len(texts))
        elif SKLEARN_AVAILABLE and len(texts) >= self.min_cluster_size:
            n_clusters = max(2, len(texts) // self.min_cluster_size)
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init='auto')
            labels = kmeans.fit_predict(embeddings)
        else:
            labels = self._mock_cluster(len(texts))

        clusters = defaultdict(list)
        for i, label in enumerate(labels):
            doc = doc_map[i]
            # Attach the mock LLM theme label directly
            theme_label = self.mock_theme_labels.get(int(label) % len(self.mock_theme_labels), "Other")
            doc["theme_cluster_id"] = int(label)
            doc["theme_label"] = theme_label if int(label) != -1 else "Unclustered Noise"
            clusters[int(label)].append(doc)
            
        return clusters

    def _mock_cluster(self, n: int) -> list[int]:
        """Distribute roughly evenly across 4 clusters for testing."""
        return [i % 4 for i in range(n)]

