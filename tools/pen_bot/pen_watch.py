"""Watch the dictionary-pen folders for NEW notes and exit when one appears.

Usage: pen_watch.py STATE_JSON [INTERVAL_SECONDS]
- First run (no state file): records every existing note as already seen.
- Later: polls; on finding unseen notes, prints them as JSON and exits 0.
Seen IDs are added to the state by the caller after replying (see --mark).
"""
import asyncio
import json
import os
import sys
import time

from mcp import ClientSession
from mcp.client.sse import sse_client

URL = "https://open.mail.163.com/api/ynote/mcp/sse"
MARKER = "—— Claude 回复 ——"
TEXT_SUFFIXES = (".txt", ".md")
FOLDERS = {
    "0392A7F1EE0E40399B6A635C2D8CF2CC": "词典笔笔记",
    "C5C516F2779B4C85916159C1A64ADD92": "文档扫描",
    "719FB34FED004B78BCB2BC3496FEE33D": "语音笔记",
}


async def snapshot(with_content_for=None):
    async with sse_client(URL, timeout=30, sse_read_timeout=60) as (r, w):
        async with ClientSession(r, w) as s:
            await s.initialize()
            notes = {}
            for fid, fname in FOLDERS.items():
                res = await s.call_tool("listNotes", {"parentId": fid})
                for e in json.loads(res.content[0].text).get("entries", []):
                    if not e.get("dir"):
                        notes[e["id"]] = {"name": e["name"], "folder": fname, "version": e.get("version")}
            new = [i for i in notes if with_content_for is not None and i not in with_content_for]
            for i in new:
                res = await s.call_tool("getNoteTextContent", {"fileId": i})
                try:
                    notes[i]["content"] = json.loads(res.content[0].text).get("content")
                except Exception:
                    notes[i]["content"] = res.content[0].text
            return notes, new


def main():
    state_path = sys.argv[1]
    interval = float(sys.argv[2]) if len(sys.argv) > 2 else 20
    seen = set(json.load(open(state_path))) if os.path.exists(state_path) else None
    if seen is None:
        notes, _ = asyncio.run(snapshot())
        json.dump(sorted(notes), open(state_path, "w"))
        print(f"baseline recorded: {len(notes)} notes")
        return
    while True:
        try:
            notes, new = asyncio.run(snapshot(with_content_for=seen))
            # A note that already carries a reply was answered before (e.g. the
            # state file was lost): remember it silently instead of re-answering.
            answered = [i for i in new if MARKER in (notes[i].get("content") or "")]
            # Voice notes (.audio) and other non-text types cannot be read or
            # written through the API; skip them without waking anyone.
            unsupported = [i for i in new if not notes[i]["name"].lower().endswith(TEXT_SUFFIXES)]
            if answered or unsupported:
                seen.update(answered + unsupported)
                json.dump(sorted(seen), open(state_path, "w"))
                if unsupported:
                    with open(state_path + ".log", "a") as f:
                        for i in unsupported:
                            f.write(f"{time.strftime('%H:%M:%S')} skipped unsupported note type: {notes[i]['folder']}\n")
            new = [i for i in new if i not in answered and i not in unsupported]
            if new:
                print(json.dumps({i: notes[i] for i in new}, ensure_ascii=False, indent=1))
                return
        except BaseException as e:  # network drops are common; keep polling
            if isinstance(e, KeyboardInterrupt):
                raise
            with open(state_path + ".log", "a") as f:
                f.write(f"{time.strftime('%H:%M:%S')} poll error: {type(e).__name__}\n")
        time.sleep(interval)


if __name__ == "__main__":
    main()
