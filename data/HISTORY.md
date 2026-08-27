# Snapshot history

Board state over time. Each file in `history/` is a full snapshot compatible with `snapshot.json`.

| Date | File | Label |
|------|------|--------|
| 2026-08-25 | [`history/2026-08-25.json`](./history/2026-08-25.json) | Initial board — Gemini Enterprise Legal & FS launch |
| 2026-08-26 | [`history/2026-08-26.json`](./history/2026-08-26.json) | D+1 — Legal gap closes; Healthcare goes HOT |
| 2026-08-27 | [`history/2026-08-27.json`](./history/2026-08-27.json) | D+2 — Launch customer & connector confirmation (pipeline dry-run validated) |

**Current live board:** [`snapshot.json`](./snapshot.json) (should match the latest history entry unless a draft is in progress).

## How to add a snapshot

1. Copy `snapshot.json` → `history/YYYY-MM-DD.json`
2. Update scores / events / pipeline as needed
3. Append an entry to `history/index.json`
4. Point `snapshot.json` at the new state (or replace it)
5. Prefer citing signals in [`SOURCES.md`](./SOURCES.md) or the Event Log

Influence values remain relative estimates for visualization.
