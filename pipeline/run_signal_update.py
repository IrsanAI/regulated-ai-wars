#!/usr/bin/env python3
"""
regulated-ai-wars — signal → draft snapshot via OpenAI-compatible LLM API.

Default provider: Groq (free developer tier, keys often start with gsk_).
Optional: xAI if you have credits (keys often start with xai-).

Env:
  LLM_PROVIDER  (optional) — "groq" (default) | "xai"
  GROQ_API_KEY  (required for groq)
  GROQ_MODEL    (optional) — default llama-3.3-70b-versatile
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
DEFAULT_SOURCES = ROOT / "data" / "SOURCES.md"
DEFAULT_PROMPT = ROOT / "pipeline" / "PROMPT.md"
DEFAULT_OUT = ROOT / "pipeline" / "out"

PROVIDERS = {
    "groq": {
        "api_url": "https://api.groq.com/openai/v1/chat/completions",
        "key_env": "GROQ_API_KEY",
        "model_env": "GROQ_MODEL",
        "default_model": "llama-3.3-70b-versatile",
        "label": "Groq",
    },
    "xai": {
        "api_url": "https://api.x.ai/v1/chat/completions",
        "key_env": "XAI_API_KEY",
        "model_env": "XAI_MODEL",
        "default_model": "grok-4-latest",
        "label": "xAI",
    },
}


def die(msg: str, code: int = 1) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(code)


def load_text(path: Path) -> str:
    if not path.is_file():
        die(f"missing file: {path}")
    return path.read_text(encoding="utf-8")


def load_json(path: Path) -> dict:
    return json.loads(load_text(path))


def rough_validate(snap: dict, previous: dict) -> list[str]:
    """Lightweight structural checks (no external jsonschema dep)."""
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


def extract_blocks(content: str) -> tuple[str, dict]:
    """Extract rationale markdown and JSON snapshot from model response."""
    json_blocks = re.findall(r"```json\s*([\s\S]*?)```", content, flags=re.IGNORECASE)
    md_blocks = re.findall(r"```(?:markdown|md)\s*([\s\S]*?)```", content, flags=re.IGNORECASE)

    rationale = md_blocks[0].strip() if md_blocks else content.split("```json")[0].strip()

    if not json_blocks:
        try:
            return rationale, json.loads(content)
        except json.JSONDecodeError as e:
            die(f"model response contained no parseable JSON: {e}")

    last_err = None
    for block in reversed(json_blocks):
        try:
            return rationale, json.loads(block.strip())
        except json.JSONDecodeError as e:
            last_err = e
    die(f"failed to parse JSON blocks: {last_err}")
    raise AssertionError("unreachable")


def call_chat(api_url: str, label: str, system: str, user: str, model: str, api_key: str) -> str:
    payload = {
        "model": model,
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        api_url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "regulated-ai-wars-pipeline/0.2",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        die(f"{label} HTTP {e.code}: {err_body[:800]}")
    except urllib.error.URLError as e:
        die(f"{label} network error: {e}")

    try:
        return body["choices"][0]["message"]["content"]
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


def main() -> None:
    provider_name, cfg, api_key, model = resolve_provider()

    snapshot_path = Path(os.environ.get("SNAPSHOT_PATH", str(DEFAULT_SNAPSHOT)))
    out_dir = Path(os.environ.get("OUT_DIR", str(DEFAULT_OUT)))
    out_dir.mkdir(parents=True, exist_ok=True)

    signals = os.environ.get("SIGNAL_TEXT", "").strip()
    signal_file = os.environ.get("SIGNAL_FILE", "").strip()
    if signal_file:
        signals = (signals + "\n" + Path(signal_file).read_text(encoding="utf-8")).strip()

    previous = load_json(snapshot_path)
    sources = load_text(DEFAULT_SOURCES)
    sources_head = "\n".join(sources.splitlines()[:80])
    contract = load_text(DEFAULT_PROMPT)

    today = date.today().isoformat()
    system = contract + "\n\n## Methodology excerpt (SOURCES.md)\n\n" + sources_head

    user_parts = [
        f"Today's date: {today}",
        "Current board snapshot (JSON):",
        "```json",
        json.dumps(previous, ensure_ascii=False, indent=2),
        "```",
        "",
        "New public signals to consider:",
        signals
        if signals
        else (
            "(none provided — only propose changes if you have high-confidence "
            "public knowledge; otherwise keep board stable and say so)"
        ),
        "",
        "Produce the next snapshot following the contract.",
    ]
    user = "\n".join(user_parts)

    print(f"Calling {cfg['label']} model={model} …")
    content = call_chat(cfg["api_url"], cfg["label"], system, user, model, api_key)
    (out_dir / "raw_response.md").write_text(content, encoding="utf-8")

    rationale, draft = extract_blocks(content)

    meta = draft.setdefault("meta", {})
    if not meta.get("snapshotDate"):
        meta["snapshotDate"] = today
    if not meta.get("version"):
        meta["version"] = previous.get("meta", {}).get("version", "0.3")

    errors = rough_validate(draft, previous)
    report = {
        "provider": provider_name,
        "model": model,
        "snapshotDate": meta.get("snapshotDate"),
        "validation_errors": errors,
        "ok": len(errors) == 0,
        "had_signals": bool(signals),
    }
    (out_dir / "validation.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    (out_dir / "rationale.md").write_text(rationale + "\n", encoding="utf-8")
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
