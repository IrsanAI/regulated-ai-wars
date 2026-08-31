#!/usr/bin/env python3
"""
regulated-ai-wars — public signal scout (RSS / Google News).

No API key. Collects recent headlines relevant to regulated AI verticals
and writes a compact SIGNAL_TEXT blob for the LLM board pipeline.

Outputs:
  pipeline/out/scout.json   — structured hits
  pipeline/out/scout.md     — human-readable signal text
  stdout                    — same as scout.md (for GITHUB_OUTPUT)

Env:
  SCOUT_MAX_ITEMS   (default 8)
  SCOUT_OUT_DIR     (default pipeline/out)
  SCOUT_DAYS        (default 10) — soft filter when pubDate parseable
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get("SCOUT_OUT_DIR", str(ROOT / "pipeline" / "out")))
MAX_ITEMS = int(os.environ.get("SCOUT_MAX_ITEMS", "8"))
DAYS = int(os.environ.get("SCOUT_DAYS", "10"))

QUERIES = [
    '"Gemini Enterprise" (Legal OR "Financial Services" OR Healthcare)',
    "Microsoft Copilot (healthcare OR legal OR insurance OR government)",
    "Anthropic enterprise (Claude OR healthcare OR legal)",
    '"Harvey AI" OR "Harvey legal" AI',
    "OpenAI enterprise (healthcare OR regulated OR compliance)",
    "AWS Bedrock (healthcare OR government OR insurance)",
    '"regulated AI" (enterprise OR vertical OR industry)',
    "IBM watsonx (government OR healthcare OR compliance)",
]

UA = "regulated-ai-wars-scout/0.1 (+https://github.com/IrsanAI/regulated-ai-wars)"


def strip_html(s: str) -> str:
    s = unescape(s or "")
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def google_news_rss(query: str) -> str:
    q = urllib.parse.quote_plus(query)
    return (
        "https://news.google.com/rss/search?"
        f"q={q}&hl=en-US&gl=US&ceid=US:en"
    )


def fetch(url: str, timeout: int = 25) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def parse_rss(xml_bytes: bytes, query: str) -> list[dict]:
    out: list[dict] = []
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return out
    channel = root.find("channel")
    if channel is None:
        return out
    cutoff = datetime.now(timezone.utc) - timedelta(days=DAYS)
    for item in channel.findall("item"):
        title = strip_html((item.findtext("title") or "").strip())
        link = (item.findtext("link") or "").strip()
        pub_raw = (item.findtext("pubDate") or "").strip()
        pub_iso = ""
        if pub_raw:
            try:
                dt = parsedate_to_datetime(pub_raw)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                if dt < cutoff:
                    continue
                pub_iso = dt.astimezone(timezone.utc).strftime("%Y-%m-%d")
            except (TypeError, ValueError, IndexError):
                pub_iso = ""
        if not title:
            continue
        # Prefer short source token from "Title - Source" pattern; drop mega redirect URLs
        source = ""
        if " - " in title:
            maybe = title.rsplit(" - ", 1)
            if len(maybe) == 2 and len(maybe[1]) < 60:
                source = maybe[1].strip()
        out.append(
            {
                "title": title[:180],
                "source": source,
                "link": link[:120] if link else "",
                "published": pub_iso,
                "query": query,
            }
        )
    return out


def dedupe(items: list[dict]) -> list[dict]:
    seen: set[str] = set()
    result: list[dict] = []
    for it in items:
        key = re.sub(r"\W+", "", it["title"].lower())[:80]
        if key in seen:
            continue
        seen.add(key)
        result.append(it)
    return result


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    collected: list[dict] = []
    errors: list[str] = []

    for q in QUERIES:
        url = google_news_rss(q)
        try:
            raw = fetch(url)
            hits = parse_rss(raw, q)
            collected.extend(hits[:4])
            print(f"scout: query ok ({len(hits)} raw) — {q[:60]}", file=sys.stderr)
        except Exception as e:  # noqa: BLE001
            errors.append(f"{q[:40]}: {e}")
            print(f"scout: query fail — {q[:50]}: {e}", file=sys.stderr)

    items = dedupe(collected)[:MAX_ITEMS]

    report = {
        "scoutedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "queryCount": len(QUERIES),
        "hitCount": len(items),
        "errors": errors,
        "items": items,
    }
    (OUT / "scout.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    if not items:
        md = (
            "(scout: no recent public headlines matched regulated-vertical queries "
            f"in the last ~{DAYS} days)\n"
        )
        (OUT / "scout.md").write_text(md, encoding="utf-8")
        print(md, end="")
        print("scout: 0 hits", file=sys.stderr)
        return

    lines = [
        "## Scouted public signals (Google News RSS)",
        "Candidate headlines only — prefer primary product launches over rumor.",
        "",
    ]
    for i, it in enumerate(items, 1):
        when = f" [{it['published']}]" if it.get("published") else ""
        src = f" ({it['source']})" if it.get("source") else ""
        lines.append(f"{i}. {it['title']}{when}{src}")

    md = "\n".join(lines).rstrip() + "\n"
    (OUT / "scout.md").write_text(md, encoding="utf-8")
    print(md, end="")
    print(f"scout: {len(items)} hits written", file=sys.stderr)


if __name__ == "__main__":
    main()
