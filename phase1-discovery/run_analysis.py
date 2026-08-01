import os
import json
from ai_analysis.clusterer import ThemeClusterer
from ai_analysis.research_agent import ResearchAgent

PROCESSED_DATA_DIR = "./data/processed"
HANDOFF_DIR = "./outputs/handoff"

def load_processed_data() -> list[dict]:
    all_docs = []
    if not os.path.exists(PROCESSED_DATA_DIR):
        print(f"No processed data found in {PROCESSED_DATA_DIR}")
        return all_docs
        
    for filename in os.listdir(PROCESSED_DATA_DIR):
        if filename.endswith(".json"):
            filepath = os.path.join(PROCESSED_DATA_DIR, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                docs = json.load(f)
                all_docs.extend(docs)
    return all_docs

def main():
    print("Loading processed documents for Phase 1 AI Analysis...")
    docs = load_processed_data()
    
    if not docs:
        print("No documents to analyze. Run the NLP pipeline first.")
        return
        
    print(f"Loaded {len(docs)} documents.")
    
    print("\n--- 1. Theme Clustering ---")
    clusterer = ThemeClusterer(min_cluster_size=2)
    clusters = clusterer.fit_predict(docs)
    
    for cluster_id, cluster_docs in clusters.items():
        theme = cluster_docs[0].get("theme_label", "Unknown") if cluster_docs else "Unknown"
        print(f"Cluster {cluster_id} [{theme}]: {len(cluster_docs)} docs")

    print("\n--- 2. Research Agent Synthesis ---")
    agent = ResearchAgent(clusters)
    insights = agent.run_synthesis()
    
    for idx, insight in enumerate(insights, 1):
        print(f"Insight {idx} (RQ: {insight['research_question']}): {insight['statement']}")
        
    print("\n--- 3. Exporting Handoff Artifacts ---")
    os.makedirs(HANDOFF_DIR, exist_ok=True)
    
    # Format according to architectural document 
    hypothesis_backlog = {
        "hypotheses": insights
    }
    
    export_path = os.path.join(HANDOFF_DIR, "hypothesis-backlog.json")
    with open(export_path, 'w', encoding='utf-8') as f:
        json.dump(hypothesis_backlog, f, ensure_ascii=False, indent=2)
        
    print(f"Exported hypothesis backlog to {export_path}")

if __name__ == "__main__":
    main()
