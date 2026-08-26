# Stack placement — regulated-ai-wars

**Role in the IrsanAI Universe:** strategy-sensing / visualization layer  
**Category:** tool  
**Canonical hub:** [IrsanAI-Universe](https://github.com/IrsanAI/IrsanAI-Universe) · [Live constellation](https://irsanai.github.io/IrsanAI-Universe/)

---

## What this node does

`regulated-ai-wars` makes **power structures in regulated AI markets legible**.

It is not a protocol (like LRP / NTF / PDP).  
It is not an epistemic engine (like VERA).  
It is a **strategic observation surface**: territories, players, geographic dominance, and the human feedback loop that feeds platform learning.

| Layer | What it shows |
|-------|----------------|
| Risk Board | Who holds relative influence in each regulated vertical |
| World Map | Where that influence is dense (theater intensity) |
| Human Layer | Why the board moves — humans as reward / feedback engine |

---

## How it connects

```
root-ascent-method     →  diagnoses systemic causes (why a board state exists)
regulated-ai-wars      →  visualizes the contested surface (what is happening)
VERA                   →  can challenge claims with evidence chains
IrsanAI-Universe       →  registers the node in the constellation
```

Suggested reading order for a new contributor:

1. This repo’s [README](./README.md) and [Live Map](https://irsanai.github.io/regulated-ai-wars/)
2. [`data/SOURCES.md`](./data/SOURCES.md) — how influence is scored
3. [root-ascent-method](https://github.com/IrsanAI/root-ascent-method) — how we reason about levers
4. [IrsanAI-Universe](https://irsanai.github.io/IrsanAI-Universe/) — where the node sits among siblings

---

## Manifest metadata (for Universe sync)

When `scripts/generate_manifest.py` runs in **IrsanAI-Universe**, this project should appear with:

| Field | Value |
|-------|--------|
| category | `tool` |
| layer | `strategy-sensing` |
| role | Strategic map of regulated AI territorial contest |
| homepage | https://irsanai.github.io/regulated-ai-wars/ |

Until the next Universe manifest regeneration, the node may show as `category: other` / `layer: unmapped`. That is expected; the PROJECT_META entry in Universe is the fix.

---

## Guiding principle

Keep the map a tool that makes **power, intent, and control** visible — not another dashboard.
