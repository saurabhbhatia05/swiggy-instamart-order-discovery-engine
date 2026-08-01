# Phase 1 — AI-Powered Discovery Engine
## 2-Slide Presentation Summary

**Project:** Swiggy Instamart — New Category Discovery  
**Live demo:** https://swiggy-instamart-order-discovery-en.vercel.app/  
**Deployment:** Next.js on Vercel — https://swiggy-instamart-order-discovery-en.vercel.app/  
**Corpus:** 3,194 reviews · 7 sources · All Q1–Q8 answered with evidence

---

## Slide 1 — Problem, System & Deployment

### Business goal
Instamart users repeat the same categories (groceries, snacks, household) and rarely explore new ones (personal care, pet, baby). **Goal:** increase % of MAC users who buy from **≥1 new category per month**.

### What Phase 1 delivers
An **AI discovery engine** that ingests public feedback at scale, answers **8 research questions** with traceable quotes, and surfaces hypotheses **before** any product build.

| Layer | What it does |
|-------|----------------|
| **Ingest** | Play Store, App Store, Reddit, Forums, Social, Product Reviews, QC Discussions → `fetch_datasets.py` + `derive_sources.py` |
| **Process** | Clean, dedupe, PII redact, entities, embeddings → `run_pipeline.py` |
| **Analyze** | Theme scoring, Q1–Q8 synthesis, hypothesis export → `run_analysis.py` |
| **Explore** | Vercel dashboard: source + question filters, Live Workflow, RAG chat |

**Corpus (3,194 docs):** Reddit 712 · Product Reviews 627 · QC 563 · App Store 418 · Forums 341 · Social 294 · Play Store 239

### Architecture & UI

```
7 Sources → Ingest → ETL → data/processed → AI Analysis → Dashboard (Vercel)
                                              ↓
                              hypothesis-backlog.json (Phase 2 handoff)

https://swiggy-instamart-order-discovery-en.vercel.app/
  Left 35%: corpus totals, source list, data-source dropdown, Q1–Q8 dropdown
  Right 65%: Live Workflow (AI answer + themes + quotes) | Research Chat (RAG)
```

### Deployment (Vercel)
| Item | Detail |
|------|--------|
| **Live URL** | https://swiggy-instamart-order-discovery-en.vercel.app/ |
| **Host** | Vercel — root `phase1-discovery/frontend` |
| **Local** | `npm run dev` → http://localhost:3000 |
| **Optional** | — |
| **Data** | `data/processed/` + `outputs/handoff/` (no DB required) |
| **Stack** | Python ETL · Next.js API · Groq (optional ingestion) |

---

## Slide 2 — Insights, Validation & Next Steps

### Eight research questions — key findings

| Q | Question | Insight (from 3,194 reviews) |
|---|----------|--------------------------------|
| **Q1** | Why repeat same categories? | Reorder convenience + staple grocery lock-in (17%, 558 docs) |
| **Q2** | What blocks exploration? | Trust, price, delivery concerns — not missing categories (35%, 1,111) |
| **Q3** | How do users discover? | Reorder, search, promotions — weak browse UI (12%, 394) |
| **Q4** | Role of habits? | Weekly routine tool; Instamart = replenishment, not exploration (32%, 1,023) |
| **Q5** | Info needed before new category? | Reviews, quality signals, return clarity (46%, 1,475) |
| **Q6** | Recurring frustrations? | Delivery failures, order accuracy, poor support (40%, 1,274) |
| **Q7** | Who experiments more? | Students & occasion buyers; habitual repeaters less (10%, 304) |
| **Q8** | Unmet needs? | Faster support, better quality, curated discovery (13%, 405) |

**Core insight:** Habits lock users into grocery staples. New categories must **interrupt the reorder flow**, not compete with it.

### Top hypotheses → Phase 2 interviews
1. **Trust barriers** (Q2) block fresh produce & electronics exploration — *high confidence, 236 docs*
2. **Reorder autopilot** (Q1) bypasses discovery features — *high confidence, 212 docs*
3. **Parents** rely on direct links for non-grocery items — *medium confidence, 85 docs*

**Validation:** Evidence counts + source-filtered quotes in dashboard; Phase 2 = 5–6 user interviews to confirm/challenge.

### Outcome & roadmap

| Phase 1 done | Next |
|--------------|------|
| 3,194-doc corpus, 7 sources | **Phase 2:** Validate hypotheses via interviews |
| All Q1–Q8 with evidence | **Phase 3:** Problem canvas + PRD lite |
| Vercel dashboard live | **Phase 4:** Smart Category Bridge MVP + A/B test |
| 3 hypotheses exported | **Focus segment:** Habitual grocery repeaters |

**Phase 1 proves we can gather, analyze, and present user voice at scale — before building any product feature.**

---

*Full architecture: [`doc/architecture/phase1-ai-discovery-engine.md`](architecture/phase1-ai-discovery-engine.md)*
