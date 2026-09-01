# Map v2 preview

Parallel node-based world board (signal nodes, confidence glyphs, scan sweep).
Does **not** replace the live continent map until you switch permanently.

## Open

```
https://irsanai.github.io/regulated-ai-wars/?preview=map2
```

Then open **World Map**. You should see:

- Dot-matrix land
- Nodes sized by footprint intensity
- Solid / faded / dashed = high / medium / directional confidence
- Split ring on NA/EU when mid-intensity (contested heuristic)
- Tap detail + event ticker

## Files

| Path | Role |
|------|------|
| `assets/shared/players.js` | Shared palette |
| `assets/map2.js` | Preview renderer |
| `assets/map2.css` | Preview styles |

## Disable

Remove `?preview=map2` from the URL (or clear `localStorage.raw_map2`).

## Next

1. Collect feedback on glyphs
2. Optional: promote Map v2 as default World view
3. Later: signal event log + decay (see redesign blueprint)
