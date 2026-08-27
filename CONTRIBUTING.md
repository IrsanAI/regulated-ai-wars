# Contributing to regulated-ai-wars

Thank you for your interest in contributing.

This project visualizes the competitive landscape of regulated AI verticals and the deeper human feedback loop that powers it. It is part of the [IrsanAI](https://github.com/IrsanAI) Human-AI stack.

**Status:** Active prototype — signal pipeline validated (see [ROADMAP.md](./ROADMAP.md)).

## Quick start for first-time contributors

1. **Look around**  
   Open the live map and read the short methodology in [`data/SOURCES.md`](./data/SOURCES.md).

2. **Choose the lightest path**  
   - Just a question or idea? → [Discussions](https://github.com/IrsanAI/regulated-ai-wars/discussions)  
   - Concrete data/signal change? → Open a **Data / signal update** issue (template is ready)  
   - Bug or UI improvement? → Use the Bug or Feature template

3. **Keep it small**  
   One clear concern per issue or PR. Reference a public source whenever you propose a board change.

4. **Human gate**  
   All board updates go through review. The signal pipeline produces draft PRs only — nothing lands on `main` without a human merge.

That’s it. You do not need to understand the whole stack to help.

## How to contribute (detailed)

### 1. Issues first
- Prefer an issue before larger changes.
- Use clear titles and describe the intent.
- For data updates (influence scores, new players, events, territory promotion): reference public sources where possible.
- Use the **Data / signal update** template — it guides you through the required fields.

**Issue permissions:** Issue creation is open to **All users**.  
If this ever changes, you can still contribute via:
1. A **pull request** with a clear description and linked public sources, or
2. Opening a discussion on the PR itself, or
3. Contact via the [IrsanAI](https://github.com/IrsanAI) profile.

### 2. Small, focused pull requests
- One concern per PR.
- Keep the visual language and layer structure (Risk Board / World Map / Human Layer / Why) coherent.
- Prefer clarity over cleverness.

### 3. Code & content guidelines
- Core UI is static (`index.html` + `assets/` + `data/`) — no build step required for the map.
- If you add structure (JSON data, modules, etc.), document it in the PR.
- Influence numbers are **relative estimates** for visualization — not precise market shares. Treat them accordingly.
- Keep the bilingual spirit (English + German) where it makes sense (READMEs, key docs).
- **All tracked players** should be considered on each snapshot update (including quiet ones → `stable`).
- **Territories** may move between cold / pipeline / board when public signals justify promotion or demotion — see `data/SOURCES.md`.

### 4. What we especially welcome
- Better data hygiene (separating data from presentation)
- Clearer sourcing of signals
- Improvements to the Human Layer narrative
- Accessibility and performance
- Documentation and examples
- Validated signal pipeline runs

### 5. What to avoid
- Adding heavy frameworks without discussion
- Treating the influence scores as hard facts
- Inventing movement without a public signal
- Breaking the intentional “conquest / power structure” framing without discussion

## Development notes
- Open `index.html` directly in a browser, or use GitHub Pages.
- Signal pipeline: `pipeline/` (draft PR only — human merge gate).

## License
By contributing you agree that your contributions will be licensed under the MIT License (see `LICENSE`).

---

Questions? Open an issue, start a Discussion, or open a small PR.  
Part of the IrsanAI Universe · steered with [Root-Ascent](https://github.com/IrsanAI/root-ascent-method).
