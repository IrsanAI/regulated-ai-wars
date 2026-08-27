# Roadmap — regulated-ai-wars

Status: **Active prototype — pipeline validated** (as of 2026-08-27)

> Structural foundation is in place (multi-view board, i18n, signal pipeline code, schema).  
> Real-world dry-run completed and promoted (Issue #1 closed).  
> External validation path and longer time series remain the next focus.

## Immediate (0–4 weeks) — Credibility & validation
- [x] MIT License
- [x] CONTRIBUTING.md (issue-permissions aligned)
- [x] .gitignore
- [x] Basic GitHub Issue templates
- [x] Separate data from presentation (`data/snapshot.json`)
- [x] Lightweight CI (HTML validation / JSON check)
- [x] **Signal pipeline dry-run with a real public signal** (Issue #1) — completed 2026-08-27
- [x] **Document movers + territory promotion methodology** (Issue #2 → `data/SOURCES.md`) — concrete D+2 example added
- [x] Align CONTRIBUTING ↔ repo issue permissions for external contributors

## Short-term (1–3 months)
- [x] Document data sources and update cadence (`data/SOURCES.md`)
- [x] Historical snapshots + simple playback (`data/history/`, selector in UI)
- [x] Improve World Map geometry / readability (immersive theater view)
- [x] Second real snapshot (2026-08-26 D+1)
- [x] Stack placement doc (`STACK.md`) + Universe PROJECT_META
- [x] Doctrine / Why view + cold markets contrast
- [ ] First external contributions
- [ ] Longer time series before heavy “trend theater” claims (>3 snapshots preferred)

## Medium-term (3–6 months)
- [x] Modular structure (assets/map.css + assets/app.js + data/snapshot.json)
- [x] Stronger Human Layer (live metrics bridging board + theater)
- [x] Optional public update pipeline (signal → LLM → draft PR) — see `pipeline/` — **now validated**
- [x] Deeper integration into the IrsanAI stack (STACK.md + Universe meta)
- [ ] Richer signal ingest (issues → auto-dispatch, optional X/news hooks)
- [ ] Per-score changelog with date + public source

## Guiding principle
Keep the project legible.  
The map should remain a tool that makes power structures, intent and control visible — not just another dashboard.

**Board evolution rule:** Cold / off-board markets can be **promoted** onto the contested board when public signals show regulated stickiness and player contest — and demoted when contest fades. Every update re-evaluates **all tracked players** (quiet → `stable`, not deleted).

---

This roadmap is intentionally lean. Labels track validation state, not marketing ambition.
