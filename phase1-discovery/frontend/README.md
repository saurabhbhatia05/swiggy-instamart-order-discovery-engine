# Phase 1 Discovery — Next.js Frontend

Next.js dashboard for the Phase 1 AI Discovery Engine. Designed to embed inside the Streamlit shell via iframe.

## Features

- **Left sidebar** — total reviews in corpus + per-source breakdown (click to filter)
- **Live Workflow** — dropdowns for data source + research question (Q1–Q8); shows one answer at a time
- **Research Chat (RAG)** — data source dropdown + keyword search

## Quick start (local)

```bash
# Terminal 1 — Next.js
cd phase1-discovery/frontend
npm install
npm run dev

# Terminal 2 — Streamlit (embeds Next.js)
cd phase1-discovery
pip install streamlit
streamlit run dashboard/app.py
```

Open Streamlit at **http://localhost:8501** — it embeds Next.js from **http://localhost:3000**.

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXTJS_DASHBOARD_URL` | `http://localhost:3000` | URL for Streamlit iframe |
| `STREAMLIT_USE_NEXTJS` | `true` | Embed Next.js vs native Streamlit |

Copy `dashboard/.env.example` or set env vars before running Streamlit.

## Deploy

### Next.js (Vercel / Node)

```bash
cd frontend
npm run build
npm start
```

Set `NEXTJS_DASHBOARD_URL` in Streamlit to your deployed URL (e.g. `https://your-app.vercel.app`).

### Streamlit Cloud

1. Deploy Next.js to Vercel
2. Deploy Streamlit with `dashboard/app.py` as entry point
3. Add secrets: `NEXTJS_DASHBOARD_URL=https://your-nextjs.vercel.app`

## API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/stats` | GET | Corpus statistics |
| `/api/insights` | GET | Hypothesis backlog |
| `/api/corpus` | GET | Sample documents |
| `/api/research-questions` | GET | Q1–Q8 answers with themes, sources, quotes |
| `/api/rag` | POST | Keyword search + mock answer |

Data is read from `../data/processed/` and `../outputs/handoff/` at runtime.
