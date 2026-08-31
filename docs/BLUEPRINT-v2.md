# BLUEPRINT v2 — Elevate regulated-ai-wars

**Audience:** developer implementing the next visual + logic tier  
**Constraint:** keep epistemic honesty (`data/SOURCES.md`) — UI must not pretend hard market share  
**Stack today:** static GitHub Pages, `data/snapshot.json`, vanilla JS, SVG continents

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

### 2.1 Current state
- 6 hand-drawn SVG blobs + fill opacity from `geoDominance.intensity`
- Beacon rings on centroids
- Light grid + scanline

### 2.2 Target state (visual)

1. **Base map**  
   - Prefer **TopoJSON/GeoJSON** world land (`world-atlas` / Natural Earth 110m) rendered once to SVG or Canvas.  
   - Fallback: refined SVG paths (current) if bundle size is a concern.

2. **Projection**  
   - Equal-earth or natural earth projection (d3-geo) for less “gamey” distortion than pure decorative blobs.

3. **Paint model (per region or country-group)**  
   ```text
   fill     = player.hex
   opacity  = 0.25 + intensity * 0.55
   stroke   = intensity > 0.7 ? white@0.35 : white@0.12
   glow     = intensity > 0.75 ? soft drop-shadow(player.hex) : none
   ```

4. **Second channel: vertical pressure (optional overlay)**  
   - Small arc or glyph near centroid: top 1–2 verticals from board that are `hot` and dominated by that theater’s player.  
   - Example: NA beacon tooltip → “MS · Healthcare · Legal”.

5. **Motion with meaning**  
   - Only animate **trend === 'up'|'down'** (not idle pulse on everything).  
   - Up: slow outer ring expand; Down: ring contracts / desaturates.  
   - Avoid constant scanline if it reads as “live telemetry” — optional, default off or very subtle.

6. **HUD**  
   - Keep theater + footprint tags.  
   - Add: `Last board: {snapshotDate}` pulled from `meta.snapshotDate` (same as header).

### 2.3 Implementation sketch (developer)

```text
assets/
  world/
    land-110m.json          # or pre-simplified SVG paths
  world-map.js              # renderWorld(geoDominance, players)
map.css                     # .theater-glow, .trend-up-ring, .estimate-chip
```

**Minimal path (no d3):**  
Keep current SVG ids `na|sa|eu|af|as|oc`, improve paths + lighting only.

**Full path (recommended if shipping “premium”):**
```js
// world-map.js (concept)
import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

export function renderWorld(svg, landTopo, geoDominance, PLAYERS) {
  const projection = geoEqualEarth().fitSize([1000, 520], land);
  const path = geoPath(projection);
  // map each feature to a theater id via centroid lookup table
  // apply fill/opacity from geoDominance[theater]
}
```

Static site: either bundle with esbuild, or **pre-render paths offline** and commit pure SVG (no runtime d3).

### 2.4 Interaction
- Hover continent → panel or modal (existing `showGeoDetail`).
- Click → pin “theater card” with dominant, intensity bar, trend, focus verticals.
- Keyboard: focusable regions (`tabindex="0"`, `aria-label`).

---

## 3. Board logic — elevate beyond “colored bars”

### 3.1 Current model
Per territory: `influence[player]`, `trend[player]`, `status`.

### 3.2 Target model (still relative, still honest)

Keep scores relative. Add **explicit structure** so the board feels like a system, not a scoreboard:

```json
{
  "id": "legal",
  "status": "hot",
  "influence": { "google": 37, "microsoft": 30, "specialist": 23 },
  "trend": { "google": "up", "specialist": "down" },
  "pressure": {
    "contestIndex": 0.72,
    "leaderGap": 7,
    "humanLoop": "high"
  },
  "whyHere": "contracts + research + compliance lock-in"
}
```

| Field | Role |
|-------|------|
| `contestIndex` | 0–1 from leaderGap + # of players within 10 pts (derived client-side if missing) |
| `leaderGap` | top − second (derived) |
| `humanLoop` | qualitative: low/mid/high — ties to Human Layer |
| `whyHere` | one line; Doctrine already explains “why these markets” |

**Derive on client if pipeline omits:**
```js
function contestIndex(influence) {
  const vals = Object.values(influence).sort((a,b)=>b-a);
  if (vals.length < 2) return 0;
  const gap = vals[0] - vals[1];
  const pack = vals.filter(v => vals[0] - v <= 10).length;
  return Math.min(1, (pack / 4) * 0.6 + (1 - Math.min(gap, 30) / 30) * 0.4);
}
```

### 3.3 Board UX changes
1. **Territory card**  
   - Top: name + status.  
   - Mid: stacked bar (existing).  
   - Bottom: **leader name + gap** (`G 37 · MS 30 · gap 7`) in muted mono.  
   - Corner: contest ring (thin arc = contestIndex).

2. **No fake decimals**  
   - Integers only on influence.

3. **Simulate button**  
   - Label as “Demo drift” not “Update” so it never competes with real scout merges.

4. **What-changed panel**  
   - Already exists; ensure it prefers `meta.note` + movers over noise.

### 3.4 Pipeline rules (PROMPT / scout)
- Full player coverage each cycle (already).  
- Prefer small deltas (±1…5).  
- Refuse to invent launches.  
- Optional: emit `contestIndex` server-side later; not required for v2 UI.

---

## 4. Epistemic UI (must ship with any “premium” look)

```html
<div class="estimate-banner" role="note">
  Relative estimates · not market share · not live telemetry
</div>
```

- Board header, World HUD, Movers panel: same message (short form).  
- Modal footer: link to `data/SOURCES.md`.

---

## 5. Suggested implementation order

| Phase | Work | Effort |
|-------|------|--------|
| **A** | Estimate banners + rename sim to “Demo drift” + last snapshot in world HUD | 0.5 d |
| **B** | Territory cards: leader/gap + contest arc (derived) | 1 d |
| **C** | World SVG polish: better paths, trend-only motion, lighting | 1–2 d |
| **D** | Optional: TopoJSON world + projection (or pre-baked SVG) | 2–3 d |
| **E** | Snapshot fields `pressure` / `whyHere` in pipeline + merge | 1 d |

---

## 6. Code touch map

| File | Change |
|------|--------|
| `index.html` | estimate banner; world HUD date slot |
| `assets/map.css` | banner, contest arc, world glow, demo-drift button |
| `assets/app.js` | `contestIndex`, leader/gap render, i18n, demo label |
| `assets/world-map.js` | *(new)* optional map renderer |
| `pipeline/PROMPT.md` | optional pressure fields |
| `data/SOURCES.md` | one paragraph: visual authority vs estimate |

---

## 7. Acceptance criteria

- [ ] User sees “relative estimates” without opening README  
- [ ] World map: hover/click theater is obvious; motion only on trend  
- [ ] Board: can answer “who leads + by how much” in <2s per territory  
- [ ] Demo control cannot be confused with scout merge  
- [ ] No invented % impact; SOURCES discipline intact  
- [ ] Mobile: board 2-col; world scrollable; banners wrap  

---

## 8. Aesthetic reference (words, not assets)

- **Light:** cool navy voids, single accent specular on hot theaters  
- **Type:** system UI, tabular numbers, sparse uppercase labels  
- **Sound:** none by default  
- **Metaphor:** briefing room glass, not shooter HUD  

---

*IrsanAI · regulated-ai-wars · Blueprint for elevation without false precision*
