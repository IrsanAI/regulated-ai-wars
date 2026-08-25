# Data Sources & Influence Methodology

**Status:** Relative estimates for visualization — **not** precise market shares.

The influence scores in `snapshot.json` are directional signals synthesized from public information. They exist to make competitive positioning legible on the board, not to claim exact percentages of revenue, seats, or spend.

---

## Core principle

| What the numbers are | What they are not |
|----------------------|-------------------|
| Relative presence / momentum within a vertical | Exact market share |
| Informed by public product launches, analyst commentary, and observed enterprise patterns | Audited financials or proprietary win rates |
| Updated when strong public signals appear | Real-time telemetry |

---

## Primary signals used (initial board — 2026-08-25)

### 1. Google Gemini Enterprise industry solutions
- **Signal:** Google launched purpose-built Gemini Enterprise solutions for **Legal** and **Financial Services** (preview), with explicit roadmap mentions of Healthcare, Life Sciences, Professional Services, and Retail.
- **Effect on board:** Elevated Google influence in Legal and Financial Services; pipeline items for the next verticals; higher “hot” status on those territories.
- **Nature:** Direct product announcement (strong signal).

### 2. Microsoft Copilot + Azure enterprise footprint
- **Signal:** Broad horizontal distribution via Microsoft 365 Copilot and Azure in regulated industries; historically strong position in Government, Professional Services, Insurance, and large enterprise accounts.
- **Effect on board:** Microsoft often leads or shares lead in several territories (especially Government, Professional Services, Insurance, and still competitive in Legal/Finance).
- **Nature:** Established platform presence + continuous product expansion (strong structural signal).

### 3. Anthropic enterprise LLM share
- **Signal:** Public analyst commentary (e.g. Menlo Ventures late-2025 reporting) indicated Anthropic holding a large share of enterprise LLM spend relative to other frontier labs.
- **Effect on board:** Solid but secondary presence across multiple regulated verticals; positive momentum tag.
- **Nature:** Aggregated spend / adoption signal (directional).

### 4. OpenAI
- **Signal:** Strong brand and capability, but relatively less emphasis in the same period on deep, governance-heavy industry packaging compared with Microsoft’s distribution and Google’s vertical launches.
- **Effect on board:** Present but lower relative influence in most regulated territories; momentum marked as softer.
- **Nature:** Comparative positioning (directional).

### 5. AWS (Bedrock / industry offerings)
- **Signal:** Major cloud + model-hosting position; relevant in data-sensitive and multi-model enterprise contexts.
- **Effect on board:** Visible in Retail, Insurance, Government and as a secondary player elsewhere.
- **Nature:** Infrastructure + platform signal.

### 6. Vertical specialists (e.g. Harvey in Legal, ambient/clinical tools in Healthcare)
- **Signal:** Category specialists often win trust and workflow depth faster than horizontal platforms in specific regulated niches.
- **Effect on board:** High relative influence in Legal and Healthcare; treated as a distinct player type.
- **Nature:** Observed specialist traction (directional).

### 7. IBM / governance-first players
- **Signal:** Long-standing presence in regulated and public-sector contexts with emphasis on control, auditability, and hybrid deployment.
- **Effect on board:** Notable in Government and Life Sciences; secondary elsewhere.
- **Nature:** Historical + positioning signal.

---

## Geographic dominance (World Map)

Continent colors reflect a simplified view of **where the major regulated-enterprise AI footprint is currently strongest**, not country-level market research.

- **North America / Europe / Oceania:** Microsoft-weighted (Copilot + Azure density in large enterprises).
- **Asia:** Google-weighted (Cloud + regional enterprise activity).
- Intensities are ordinal, not precise.

---

## How scores should be updated

1. Prefer **public, citable signals** (product launches, official blogs, reputable analyst notes, major customer announcements).
2. Change scores **directionally** — avoid false precision.
3. Record the signal in the Event Log and, when useful, in this file or in a future `data/changelog.md`.
4. Use the GitHub issue template **“Data / signal update”** for proposed changes.

---

## Confidence levels (for future updates)

| Level | Meaning |
|-------|--------|
| **High** | Clear public product launch or primary-source announcement |
| **Medium** | Credible secondary reporting or consistent multi-source pattern |
| **Directional** | Informed judgment from positioning and observed behavior |

Most current board values sit between **Medium** and **Directional**, with the Google Legal/FS launch treated as **High** for those two territories.

---

## Disclaimer

This project visualizes power, intent, and control structures in regulated AI verticals.  
The numbers are a lens, not a ledger. Treat them as such.
