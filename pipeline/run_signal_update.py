#!/usr/bin/env python3
"""
regulated-ai-wars — signal → draft snapshot via OpenAI-compatible LLM API.

Default provider: Groq (free developer tier, keys often start with gsk_).
Optional: xAI if you have credits (keys often start with xai-).

Env:
  LLM_PROVIDER  (optional) — "groq" (default) | "xai"
  GROQ_API_KEY  (required for groq)
  GROQ_MODEL    (optional) — default openai/gpt-oss-120b
  XAI_API_KEY   (required for xai)
  XAI_MODEL     (optional) — default grok-4-latest
  SIGNAL_TEXT   (optional)
  SIGNAL_FILE   (optional)
  SNAPSHOT_PATH (optional)
  OUT_DIR       (optional)
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SNAPSHOT = ROOT / "data" / "snapshot.json"
DEFAULT_OUT = ROOT / "pipeline" / "out"

PROVIDERS = {
    "groq": {
        "api_url": "https://api.groq.com/openai/v1/chat/completions",
        "key_env": "GROQ_API_KEY",
        "model_env": "GROQ_MODEL",
        "default_model": "openai/gpt-oss-120b",
        "label": "Groq",
        "json_mode": True,
        # Free on_demand TPM for this model is tight (~8k); keep requests small.
        "max_tokens": 4096,
    },
    "xai": {
        "api_url": "https://api.x.ai/v1/chat/completions",
        "key_env": "XAI_API_KEY",
        "model_env": "XAI_MODEL",
        "default_model": "grok-4-latest",
        "label": "xAI",
        "json_mode": True,
        "max_tokens": 8192,
    },
}

COMPACT_SYSTEM = """You update the regulated-ai-wars board (Risk-style map of regulated AI verticals).
Return ONE JSON object only (no markdown). Keys required:
meta, players, territories, geoDominance, events, pipeline, movers.

Rules:
- Relative influence only; per territory influence values should sum ~100 (85–115 ok).
- status: hot | contested | normal | cold
- trend per player on a territory: up | stable | down when signal is material
- Evaluate ALL known players; do not invent product launches
- Prefer primary public signals (press / product) over rumor
- meta.snapshotDate = today (YYYY-MM-DD); meta.note = short English summary of changes
- Keep territory ids and player ids from the current board; do not invent new territory ids
- events: short list (max 5) of {time, text}; pipeline: string list of upcoming verticals
- movers: optional list of {player, territory, trend, delta, label}
"""


def die(msg: str, code: int = 1) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(code)


def load_text(path: Path) -> str:
    if not path.is_file():
        die(f"missing file: {path}")
    return path.read_text(encoding="utf-8")


def load_json(path: Path) -> dict:
    return json.loads(load_text(path))


def slim_board(snap: dict) -> dict:
    """Shrink snapshot for free-tier TPM limits while keeping ids/structure."""
    players = {}
    for k, v in (snap.get("players") or {}).items():
        if not isinstance(v, dict):
            continue
        players[k] = {
            "id": v.get("id", k),
            "name": v.get("name", k),
            "momentum": v.get("momentum", "stable"),
        }
    territories = []
    for t in snap.get("territories") or []:
        if not isinstance(t, dict):
            continue
        territories.append(
            {
                "id": t.get("id"),
                "name": t.get("name"),
                "status": t.get("status"),
                "influence": t.get("influence") or {},
                "trend": t.get("trend") or {},
            }
        )
    geo = {}
    for k, v in (snap.get("geoDominance") or {}).items():
        if not isinstance(v, dict):
            continue
        geo[k] = {
            "dominant": v.get("dominant"),
            "intensity": v.get("intensity"),
            "trend": v.get("trend", "stable"),
        }
    return {
        "meta": {
            "snapshotDate": (snap.get("meta") or {}).get("snapshotDate"),
            "version": (snap.get("meta") or {}).get("version", "0.3"),
        },
        "players": players,
        "territories": territories,
        "geoDominance": geo,
        "pipeline": (snap.get("pipeline") or [])[:6],
        "events": (snap.get("events") or [])[:2],
        "movers": (snap.get("movers") or [])[:5],
    }


def merge_draft(previous: dict, draft: dict) -> dict:
    """Fill missing presentation fields from previous board when model omits them."""
    out = dict(draft)
    # players: restore role/hex/short if model dropped them
    prev_p = previous.get("players") or {}
    new_p = out.get("players") or {}
    merged_p = {}
    for k, base in prev_p.items():
        merged = dict(base) if isinstance(base, dict) else {"id": k}
        if k in new_p and isinstance(new_p[k], dict):
            merged.update({kk: vv for kk, vv in new_p[k].items() if vv is not None})
        merged_p[k] = merged
    for k, v in new_p.items():
        if k not in merged_p:
            merged_p[k] = v
    out["players"] = merged_p

    # territories: restore meta/note if missing
    prev_t = {t.get("id"): t for t in previous.get("territories") or [] if isinstance(t, dict)}
    merged_t = []
    for t in out.get("territories") or []:
        if not isinstance(t, dict):
            continue
        tid = t.get("id")
        base = dict(prev_t.get(tid) or {})
        base.update({kk: vv for kk, vv in t.items() if vv is not None})
        if "meta" not in base and tid in prev_t:
            base["meta"] = prev_t[tid].get("meta", "")
        if "note" not in base and tid in prev_t:
            base["note"] = prev_t[tid].get("note", "")
        merged_t.append(base)
    out["territories"] = merged_t

    # geo: restore note/focus
    prev_g = previous.get("geoDominance") or {}
    new_g = out.get("geoDominance") or {}
    merged_g = {}
    for k, base in prev_g.items():
        merged = dict(base) if isinstance(base, dict) else {}
        if k in new_g and isinstance(new_g[k], dict):
            merged.update({kk: vv for kk, vv in new_g[k].items() if vv is not None})
        merged_g[k] = merged
    out["geoDominance"] = merged_g

    if "pipeline" not in out:
        out["pipeline"] = previous.get("pipeline") or []
    if "events" not in out:
        out["events"] = previous.get("events") or []
    if "movers" not in out:
        out["movers"] = previous.get("movers") or []
    return out


def rough_validate(snap: dict, previous: dict) -> list[str]:
    errs: list[str] = []
    for key in ("meta", "players", "territories", "geoDominance", "events", "pipeline"):
        if key not in snap:
            errs.append(f"missing top-level key: {key}")
    if "meta" in snap:
        meta = snap["meta"]
        if not isinstance(meta.get("snapshotDate"), str):
            errs.append("meta.snapshotDate must be string YYYY-MM-DD")
        if not meta.get("note"):
            errs.append("meta.note required")
    if "territories" in snap:
        if not isinstance(snap["territories"], list) or not snap["territories"]:
            errs.append("territories must be non-empty list")
        else:
            prev_ids = {t.get("id") for t in previous.get("territories", [])}
            for t in snap["territories"]:
                tid = t.get("id")
                if tid not in prev_ids:
                    errs.append(f"unknown territory id (structure change): {tid}")
                status = t.get("status")
                if status not in ("hot", "contested", "normal", "cold"):
                    errs.append(f"invalid status for {tid}: {status}")
                inf = t.get("influence") or {}
                if not isinstance(inf, dict) or not inf:
                    errs.append(f"influence missing for {tid}")
                else:
                    total = sum(float(v) for v in inf.values())
                    if total < 85 or total > 115:
                        errs.append(f"influence sum out of range for {tid}: {total:.1f}")
                    for k, v in inf.items():
                        try:
                            fv = float(v)
                        except (TypeError, ValueError):
                            errs.append(f"non-numeric influence {tid}.{k}")
                            continue
                        if fv < 0 or fv > 100:
                            errs.append(f"influence out of bounds {tid}.{k}={fv}")
    if "geoDominance" in snap:
        for region in ("na", "sa", "eu", "af", "as", "oc"):
            if region not in snap["geoDominance"]:
                errs.append(f"geoDominance missing region: {region}")
    return errs


def extract_json_object(text: str) -> dict | None:
    if not text or not text.strip():
        return None
    text = text.strip()

    fenced = re.findall(r"```json\s*([\s\S]*?)```", text, flags=re.IGNORECASE)
    for block in reversed(fenced):
        try:
            return json.loads(block.strip())
        except json.JSONDecodeError:
            continue

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    start = text.find("{")
    if start < 0:
        return None
    depth = 0
    in_str = False
    esc = False
    for i in range(start, len(text)):
        ch = text[i]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start : i + 1])
                except json.JSONDecodeError:
                    return None
    return None


def extract_blocks(content: str) -> tuple[str, dict]:
    md_blocks = re.findall(r"```(?:markdown|md)\s*([\s\S]*?)```", content, flags=re.IGNORECASE)
    rationale = md_blocks[0].strip() if md_blocks else content.split("```json")[0].strip()
    if len(rationale) > 2000:
        rationale = rationale[:2000] + "\n…"

    draft = extract_json_object(content)
    if draft is None:
        die(
            "model response contained no parseable JSON "
            f"(len={len(content or '')}, head={repr((content or '')[:200])})"
        )
    return rationale, draft


def call_chat(
    api_url: str,
    label: str,
    system: str,
    user: str,
    model: str,
    api_key: str,
    *,
    json_mode: bool = False,
    max_tokens: int = 4096,
    out_dir: Path | None = None,
) -> str:
    payload: dict = {
        "model": model,
        "temperature": 0.2,
        "max_tokens": max_tokens,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        api_url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "regulated-ai-wars-pipeline/0.4",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        if json_mode and e.code in (400, 422) and "response_format" in err_body.lower():
            print(f"{label}: response_format not accepted — retry plain", file=sys.stderr)
            return call_chat(
                api_url, label, system, user, model, api_key,
                json_mode=False, max_tokens=max_tokens, out_dir=out_dir,
            )
        die(f"{label} HTTP {e.code}: {err_body[:800]}")
    except urllib.error.URLError as e:
        die(f"{label} network error: {e}")

    if out_dir is not None:
        (out_dir / "api_response.json").write_text(
            json.dumps(body, indent=2, ensure_ascii=False)[:200000] + "\n",
            encoding="utf-8",
        )

    try:
        msg = body["choices"][0]["message"]
        content = msg.get("content")
        if content is None or (isinstance(content, str) and not content.strip()):
            alt = msg.get("reasoning") or msg.get("reasoning_content") or ""
            if isinstance(alt, str) and alt.strip():
                content = alt
            else:
                die(
                    f"empty model content from {label}. "
                    f"finish_reason={body['choices'][0].get('finish_reason')}; "
                    f"message_keys={list(msg.keys())}"
                )
        if isinstance(content, list):
            content = "".join(
                p.get("text", "") if isinstance(p, dict) else str(p) for p in content
            )
        return str(content)
    except (KeyError, IndexError, TypeError):
        die(f"unexpected {label} response shape: {json.dumps(body)[:500]}")
    raise AssertionError("unreachable")


def resolve_provider() -> tuple[str, dict, str, str]:
    name = os.environ.get("LLM_PROVIDER", "groq").strip().lower()
    if name not in PROVIDERS:
        die(f"unknown LLM_PROVIDER={name!r}; use: {', '.join(PROVIDERS)}")
    cfg = PROVIDERS[name]
    api_key = os.environ.get(cfg["key_env"], "").strip()
    if not api_key:
        die(
            f"{cfg['key_env']} is not set. "
            f"For free tier use Groq (console.groq.com) and set GROQ_API_KEY."
        )
    model = os.environ.get(cfg["model_env"], cfg["default_model"]).strip()
    return name, cfg, api_key, model


def compact_signals(text: str, max_chars: int = 1800) -> str:
    text = (text or "").strip()
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rsplit("\n", 1)[0] + "\n…(signals truncated)\n"


def main() -> None:
    provider_name, cfg, api_key, model = resolve_provider()

    snapshot_path = Path(os.environ.get("SNAPSHOT_PATH", str(DEFAULT_SNAPSHOT)))
    out_dir = Path(os.environ.get("OUT_DIR", str(DEFAULT_OUT)))
    out_dir.mkdir(parents=True, exist_ok=True)

    signals = os.environ.get("SIGNAL_TEXT", "").strip()
    signal_file = os.environ.get("SIGNAL_FILE", "").strip()
    if signal_file:
        signals = (signals + "\n" + Path(signal_file).read_text(encoding="utf-8")).strip()
    signals = compact_signals(signals)

    previous = load_json(snapshot_path)
    slim = slim_board(previous)
    board_json = json.dumps(slim, ensure_ascii=False, separators=(",", ":"))

    today = date.today().isoformat()
    system = COMPACT_SYSTEM
    user = "\n".join(
        [
            f"Today: {today}",
            "Current board (slim JSON):",
            board_json,
            "",
            "Public signals:",
            signals if signals else "(none — keep board stable; say so in meta.note)",
            "",
            "Return the next full snapshot JSON object only.",
        ]
    )

    approx_chars = len(system) + len(user)
    print(
        f"Calling {cfg['label']} model={model} (prompt≈{approx_chars} chars) …",
        flush=True,
    )
    content = call_chat(
        cfg["api_url"],
        cfg["label"],
        system,
        user,
        model,
        api_key,
        json_mode=bool(cfg.get("json_mode")),
        max_tokens=int(cfg.get("max_tokens", 4096)),
        out_dir=out_dir,
    )
    (out_dir / "raw_response.md").write_text(content or "", encoding="utf-8")

    rationale, draft = extract_blocks(content)
    draft = merge_draft(previous, draft)

    meta = draft.setdefault("meta", {})
    if not meta.get("snapshotDate"):
        meta["snapshotDate"] = today
    if not meta.get("version"):
        meta["version"] = previous.get("meta", {}).get("version", "0.3")
    if not meta.get("note"):
        meta["note"] = "Signal draft (auto)"

    errors = rough_validate(draft, previous)
    report = {
        "provider": provider_name,
        "model": model,
        "snapshotDate": meta.get("snapshotDate"),
        "validation_errors": errors,
        "ok": len(errors) == 0,
        "had_signals": bool(signals),
        "prompt_chars": approx_chars,
    }
    (out_dir / "validation.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    (out_dir / "rationale.md").write_text((rationale or meta.get("note", "")) + "\n", encoding="utf-8")
    (out_dir / "draft-snapshot.json").write_text(
        json.dumps(draft, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    print(json.dumps(report, indent=2))
    if errors:
        print("Validation failed:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(2)

    print(f"Draft written to {out_dir / 'draft-snapshot.json'}")


if __name__ == "__main__":
    main()
