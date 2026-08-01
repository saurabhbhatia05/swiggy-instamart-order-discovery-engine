import random

class ResearchAgent:
    """
    Mock implementation of a LangGraph autonomous research agent for Phase 1.
    In a full deployment, this uses GPT-4 to synthesize the clusters against research questions.
    """
    
    def __init__(self, clusters: dict):
        self.clusters = clusters

    def run_synthesis(self) -> list[dict]:
        """
        Synthesize insights from the clustered data for each Phase 1 Research Question.
        """
        insights = []
        
        # Identify insights for Discovery Barriers (Q2, Q3)
        barrier_docs = [d for docs in self.clusters.values() for d in docs if "barrier" in d.get("clean_body", "").lower() or "trust" in d.get("clean_body", "").lower()]
        if barrier_docs:
            insights.append({
                "statement": "Users exhibit massive trust barriers around fresh produce and electronics, inhibiting exploration behavior.",
                "research_question": "Q2",
                "confidence": "high",
                "evidence_count": len(barrier_docs),
                "sample_quotes": [d["clean_body"][:100] + "..." for d in random.sample(barrier_docs, min(2, len(barrier_docs)))]
            })

        # Identify insights for Habit Loops (Q1, Q4)
        habit_docs = [d for docs in self.clusters.values() for d in docs if "habit" in d.get("clean_body", "").lower() or "autopilot" in d.get("clean_body", "").lower()]
        if habit_docs:
            insights.append({
                "statement": "Grocery essentials trigger a 'reorder autopilot' habit loop, entirely bypassing the app's discovery features.",
                "research_question": "Q1",
                "confidence": "high",
                "evidence_count": len(habit_docs),
                "sample_quotes": [d["clean_body"][:100] + "..." for d in random.sample(habit_docs, min(2, len(habit_docs)))]
            })
            
        # Segment insights (Q7)
        segment_docs = [d for docs in self.clusters.values() for d in docs if "student" in d.get("clean_body", "").lower() or "mom" in d.get("clean_body", "").lower()]
        if segment_docs:
            insights.append({
                "statement": "Specific demographics (like parents) rely exclusively on direct product links for non-grocery item discovery.",
                "research_question": "Q7",
                "confidence": "medium",
                "evidence_count": len(segment_docs),
                "sample_quotes": [d["clean_body"][:100] + "..." for d in random.sample(segment_docs, min(2, len(segment_docs)))]
            })

        return insights
