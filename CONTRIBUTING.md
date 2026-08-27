# Contributing to regulated-ai-wars

Thank you for your interest in contributing.

This project visualizes the competitive landscape of regulated AI verticals and the deeper human feedback loop that powers it. It is part of the [IrsanAI](https://github.com/IrsanAI) Human-AI stack.

**Status:** Active prototype / pre-validation — see [ROADMAP.md](./ROADMAP.md).

## How to contribute

### 1. Issues first (when available)
- Prefer an issue before larger changes.
- Use clear titles and describe the intent.
- For data updates (influence scores, new players, events, territory promotion): reference public sources where possible.

**Issue permissions note:** If GitHub settings temporarily restrict issue creation (anti-spam / early phase), you can still contribute via:
1. A **pull request** with a clear description and linked public sources, or
2. Opening a discussion on the PR itself, or
3. Contact via the [IrsanAI](https://github.com/IrsanAI) org profile.

When issues are open to the public, use the **Data / signal update** template for board changes.

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
- Validated signal pipeline dry-runs

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

Questions? Open an issue when available, or a small PR.  
Part of the IrsanAI Universe · steered with [Root-Ascent](https://github.com/IrsanAI/root-ascent-method).
