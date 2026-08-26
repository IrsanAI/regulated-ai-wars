# Signal → Snapshot pipeline

Feeds **public signals** into an OpenAI-compatible LLM, proposes the next board state as JSON, and optionally opens a **draft PR** for human review.

**Default provider: [Groq](https://console.groq.com)** (free developer tier — keys usually start with `gsk_`).  
xAI/Grok remains optional if you have paid credits (`xai-…` keys).

```
Signals (manual / issue / dispatch)
        │
        ▼
run_signal_update.py  +  GROQ_API_KEY (GitHub Secret)
        │
        ▼
pipeline/out/draft-snapshot.json
        │
        ▼
Draft PR → you merge → live map + history
```

## Prerequisites

1. Free key: [console.groq.com/keys](https://console.groq.com/keys)
2. Repo secret **`GROQ_API_KEY`** (Settings → Secrets → Actions)
3. Never commit the key

Optional: `XAI_API_KEY` only if you switch provider to `xai` (paid).

## Manual run

1. Actions → **Signal update (LLM)** → **Run workflow**
2. Provider: **groq**
3. Model: `llama-3.3-70b-versatile` (default)
4. Paste public signals
5. Review draft PR (or disable PR and only fetch artifacts)

## Local dry-run

```bash
export GROQ_API_KEY=gsk_...   # shell only
export LLM_PROVIDER=groq
export SIGNAL_TEXT="Google announces Gemini Enterprise for Healthcare preview."
python pipeline/run_signal_update.py
# inspect pipeline/out/
```

## Provider note

| Name | Free tier | Key prefix | Default model |
|------|-----------|------------|---------------|
| **Groq** | yes | `gsk_` | `llama-3.3-70b-versatile` |
| xAI (Grok) | typically paid credits | `xai-` | `grok-4-latest` |

Groq ≠ Grok. Groq is a fast inference host for open models; Grok is xAI’s model family.

## Design choices

- **Human gate:** default is draft PR, not silent main writes
- **Small deltas** in the prompt contract
- **Relative scores** — visualization lens (`data/SOURCES.md`)
