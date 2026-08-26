# Signal → Snapshot pipeline

Feeds **public signals** into xAI (Grok), proposes the next board state as JSON, and opens a **draft PR** for human review.

```
Signals (manual / issue / dispatch)
        │
        ▼
run_signal_update.py  +  XAI_API_KEY (GitHub Secret)
        │
        ▼
pipeline/out/draft-snapshot.json
        │
        ▼
Draft PR → you merge → live map + history
```

## Prerequisites

1. Repo secret **`XAI_API_KEY`** (Settings → Secrets → Actions).
2. Never commit the key.

## Manual run (recommended)

1. Actions → **Signal update (xAI)** → **Run workflow**
2. Paste public signals (launches, analyst notes, official blogs).
3. Leave `open_pr` enabled.
4. Review the draft PR → merge if the deltas make sense.

## Local dry-run

```bash
export XAI_API_KEY=...   # from your shell only
export SIGNAL_TEXT="Google announces Gemini Enterprise for Healthcare preview."
python pipeline/run_signal_update.py
# inspect pipeline/out/
```

## Files

| Path | Role |
|------|------|
| `PROMPT.md` | Hard rules for the model |
| `run_signal_update.py` | API call + validation (stdlib only) |
| `out/` | Generated drafts (gitignored except rationale committed from CI) |
| `../data/snapshot.schema.json` | Structural contract |
| `../.github/workflows/signal-update.yml` | Cron + workflow_dispatch |

## Design choices

- **Human gate:** default is draft PR, not silent main writes.
- **Small deltas:** prompt limits ±5 influence unless a major signal.
- **No invented markets:** empty signals → prefer stable board.
- **Relative scores:** visualization lens, not a ledger (`data/SOURCES.md`).
