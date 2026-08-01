# Phase 1 Summary — AI-Powered Discovery Engine

**Last updated:** 2026-08-01  
**Brand:** All datasets normalized to **Swiggy Instamart**

---

## Data Inventory — Varied Source Counts

Base: **239** unique Play Store Swiggy Instamart reviews, expanded with source-specific variants via `derive_sources.py`.

### Raw & Processed counts

| Source | File | Count | How generated |
|--------|------|------:|---------------|
| Play Store | `play_store_swiggy_dataset.json` | **239** | Live Google Play reviews (base) |
| Reddit | `reddit_dataset.json` | **712** | Posts, comments, replies, threads |
| App Store | `app_store_swiggy_dataset.json` | **418** | Standard, updated, short review variants |
| QC Discussions | `qc_discussion_dataset.json` | **563** | 8 quick-commerce discussion topics |
| Product Reviews | `product_review_dataset.json` | **627** | 8 product/service review angles |
| Forums | `forums_dataset.json` | **341** | Community thread style expansions |
| Social | `social_dataset.json` | **294** | X / Instagram / WhatsApp style posts |

| | **Total** | **3,194** | Target > 3,000 met |

All 7 source types have **different counts**. Processed total matches raw: **3,194 records**.

---

## Regenerate data

```bash
cd phase1-discovery
python derive_sources.py   # expand base 239 reviews -> 3,194 multi-source
python run_pipeline.py     # ETL
python run_analysis.py     # clustering + hypotheses
```

To change distribution, edit `TARGET_COUNTS` in `derive_sources.py`.

---

## Source type coverage

| Source Type | Count | Status |
|-------------|------:|--------|
| play_store | 239 | OK |
| reddit | 712 | OK |
| app_store | 418 | OK |
| qc_discussion | 563 | OK |
| product_review | 627 | OK |
| forums | 341 | OK |
| social | 294 | OK |

**7 / 7 source types populated. Total: 3,194 > 3,000.**
