# BLUEPRINT v2 — Elevate regulated-ai-wars

**Audience:** developer implementing the next visual + logic tier  
**Constraint:** keep epistemic honesty (`data/SOURCES.md`) — UI must not pretend hard market share  
**Stack today:** static GitHub Pages, `data/snapshot.json`, vanilla JS, SVG / Natural Earth land

### Implementation status (2026-08-31)

| Phase | Status |
|-------|--------|
| **A** Estimate banners + Demo drift + world HUD date | **Done** |
| **B** Leader / gap / contest meter | **Done** (`assets/board-logic.js`) |
| **C** Trend-only world motion | **Done** |
| **D** Natural Earth–class land geometry | **Shipped / refining** (`assets/world-map.js`) |
| **E** SOURCES + client-derived pressure docs | **Done** |

---

## 1. Design north star

| Layer | Feeling | Not this |
|-------|---------|----------|
| **Risk Board** | War-room tablets: dense, legible, relative | Bloomberg terminal / fake precision |
| **World Map** | Strategic theater — depth, light, motion with meaning | Flat color blobs |
| **Human Layer** | Pulse of the loop | Decorative pink panel |
| **Tone** | Classified briefing + metaphor | Literal “war” celebration |

**Dashboard paradox (fix):** every hard-looking bar needs a soft label nearby  
→ permanent strip: *Relative estimates · not market share · not telemetry*

---

## 2. World Map — aesthetic revolution

### 2.1 Paint model

```text
fill     = player.hex (from geoDominance.dominant)
opacity  = 0.25 + intensity * 0.55
motion   = trend up + high intensity only
```

Land geometry: Natural Earth 110m via CDN (TopoJSON) when available; fallback to stylized SVG blobs in `index.html`.

Color still comes **only** from `geoDominance` — not per-country research.

### 2.2 Files

| File | Role |
|------|------|
| `assets/world-map.js` | Load topo → project → paint theaters |
| `assets/board-logic.js` | Fallback `renderWorld` + board metrics |
| `index.html` | `#worldSvg` host |

---

## 3. Board logic

Client-derived: `leaderGap`, `contestIndex` in `board-logic.js`. Documented in `data/SOURCES.md`.

---

## 4. Epistemic UI

- `assets/estimate.css` + banners in `index.html`
- Demo control labeled **Demo drift**

---

## 5. Acceptance criteria

- [x] User sees “relative estimates” without opening README  
- [x] Board: who leads + gap in <2s  
- [x] Demo ≠ scout merge  
- [x] Motion tied to trend  
- [x] SOURCES documents dashboard paradox + derived metrics  
- [ ] Optional: offline land (commit topo JSON) if CDN blocked  

---

*IrsanAI · regulated-ai-wars · Blueprint for elevation without false precision*
