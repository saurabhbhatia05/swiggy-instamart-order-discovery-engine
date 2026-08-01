import os
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(
    page_title="Phase 1 — AI Discovery Engine",
    page_icon="🛒",
    layout="wide",
    initial_sidebar_state="expanded",
)

NEXTJS_URL = os.getenv("NEXTJS_DASHBOARD_URL", "http://localhost:3000")
USE_IFRAME = os.getenv("STREAMLIT_USE_NEXTJS", "true").lower() in ("1", "true", "yes")

st.sidebar.title("Phase 1 Discovery")
st.sidebar.markdown(
    """
    **Swiggy Instamart**  
    AI-powered discovery engine for new category exploration.
    """
)
st.sidebar.markdown("---")
st.sidebar.markdown("### Run locally")
st.sidebar.code(
    "cd frontend\nnpm install\nnpm run dev",
    language="bash",
)
st.sidebar.code(
    "streamlit run dashboard/app.py",
    language="bash",
)
st.sidebar.markdown("---")
st.sidebar.markdown(f"**Next.js URL:** `{NEXTJS_URL}`")

view_mode = st.sidebar.radio(
    "View mode",
    ["Next.js Dashboard (embedded)", "Streamlit native (fallback)"],
    index=0 if USE_IFRAME else 1,
)

if view_mode.startswith("Next.js"):
    st.title("Phase 1 — AI Discovery Engine")
    st.caption("Next.js dashboard embedded in Streamlit")

    try:
        components.iframe(NEXTJS_URL, height=920, scrolling=True)
    except Exception as exc:
        st.error(f"Could not embed Next.js app: {exc}")
        st.info(
            f"Start the Next.js server first:\n\n"
            f"`cd frontend && npm run dev`\n\n"
            f"Then set `NEXTJS_DASHBOARD_URL={NEXTJS_URL}`"
        )
else:
    # Fallback: native Streamlit dashboard
    import json
    import pandas as pd

    PROCESSED_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "processed")
    HANDOFF_FILE = os.path.join(os.path.dirname(__file__), "..", "outputs", "handoff", "hypothesis-backlog.json")

    @st.cache_data
    def load_processed_data():
        all_docs = []
        if os.path.exists(PROCESSED_DATA_DIR):
            for filename in os.listdir(PROCESSED_DATA_DIR):
                if filename.endswith(".json"):
                    with open(os.path.join(PROCESSED_DATA_DIR, filename), encoding="utf-8") as f:
                        all_docs.extend(json.load(f))
        return all_docs

    @st.cache_data
    def load_handoff_data():
        if os.path.exists(HANDOFF_FILE):
            with open(HANDOFF_FILE, encoding="utf-8") as f:
                return json.load(f)
        return {"hypotheses": []}

    st.title("QC AI Discovery Engine — Streamlit Native")
    docs = load_processed_data()
    insights = load_handoff_data().get("hypotheses", [])

    tab1, tab2 = st.tabs(["Corpus", "Insights"])
    with tab1:
        st.metric("Documents", len(docs))
        if docs:
            sources = pd.Series([d.get("source_type", "unknown") for d in docs])
            st.bar_chart(sources.value_counts())
    with tab2:
        for h in insights:
            st.expander(h.get("statement", "")).write(h)
