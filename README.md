# Swiggy Instamart Order Discovery Engine

AI-powered review analysis system for Swiggy Instamart — Phase 1 Discovery Engine.

Analyzes 3,000+ multi-source public reviews to understand category repetition, exploration barriers, and discovery behavior.

## Live demo

**https://swiggy-instamart-order-discovery-en.vercel.app/**

## Structure

```
doc/                    Architecture & presentation docs
phase1-discovery/       Ingestion, ETL, analysis, data
  frontend/             Next.js dashboard (Vercel deployment)
  data/                 Raw & processed corpus
  outputs/handoff/      Hypotheses & Phase 1 summary
```

## Quick start

```bash
# Phase 1 pipeline
cd phase1-discovery
cp .env.example .env   # add GROQ_API_KEY if using AI scraper
python derive_sources.py
python run_pipeline.py
python run_analysis.py

# Dashboard — local
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

## Documentation

- [Frontend README & Vercel deploy](phase1-discovery/frontend/README.md)
- [Phase-wise architecture](doc/phaseWiseArchitecture.md)
- [Phase 1 detailed architecture](doc/architecture/phase1-ai-discovery-engine.md)

## Deployment

**Live app:** https://swiggy-instamart-order-discovery-en.vercel.app/

Import repo on Vercel with root directory `phase1-discovery/frontend`. See [frontend README](phase1-discovery/frontend/README.md).
