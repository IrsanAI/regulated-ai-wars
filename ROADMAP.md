# Roadmap — regulated-ai-wars

Status: **Active prototype / pre-validation** (as of 2026-08-27)

> Structural foundation is in place (multi-view board, i18n, signal pipeline code, schema).  
> External validation is still open: real signal dry-run, contributor path, longer time series.  
> This label is intentional Root-Ascent dogfooding — process maturity ahead of audience proof.

## Immediate (0–4 weeks) — Credibility & validation
- [x] MIT License
- [x] CONTRIBUTING.md (see issue-permissions note)
- [x] .gitignore
- [x] Basic GitHub Issue templates
- [x] Separate data from presentation (`data/snapshot.json`)
- [x] Lightweight CI (HTML validation / JSON check)
- [ ] **Signal pipeline dry-run with a real public signal** (Issue #1)
- [ ] **Document movers + territory promotion methodology** (Issue #2 → `data/SOURCES.md`)
- [ ] Align CONTRIBUTING ↔ repo issue permissions for external contributors

## Short-term (1–3 months)
- [x] Document data sources and update cadence (`data/SOURCES.md`)
- [x] Historical snapshots + simple playback (`data/history/`, selector in UI)
- [x] Improve World Map geometry / readability (immersive theater view)
- [x] Second real snapshot (2026-08-26 D+1)
- [x] Stack placement doc (`STACK.md`) + Universe PROJECT_META
- [x] Doctrine / Why view + cold markets contrast
- [ ] First external contributions
- [ ] Longer time series before heavy “trend theater” claims (>2 snapshots)

## Medium-term (3–6 months)
- [x] Modular structure (assets/map.css + assets/app.js + data/snapshot.json)
- [x] Stronger Human Layer (live metrics bridging board + theater)
- [x] Optional public update pipeline (signal → LLM → draft PR) — see `pipeline/` — **pre-validation until Issue #1 closes**
- [x] Deeper integration into the IrsanAI stack (STACK.md + Universe meta)
- [ ] Richer signal ingest (issues → auto-dispatch, optional X/news hooks)
- [ ] Per-score changelog with date + public source

## Guiding principle
Keep the project legible.  
The map should remain a tool that makes power structures, intent and control visible — not just another dashboard.

**Board evolution rule:** Cold / off-board markets can be **promoted** onto the contested board when public signals show regulated stickiness and player contest — and demoted when contest fades. Every update re-evaluates **all tracked players** (quiet → `stable`, not deleted).

---

This roadmap is intentionally lean. Labels track validation state, not marketing ambition.
