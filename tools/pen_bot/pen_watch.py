"""Watch Youdao Note folders for NEW notes and exit when one appears.

Usage: pen_watch.py STATE_JSON [INTERVAL_SECONDS] [--absorb]
- No state file yet, or --absorb: records every current note as seen, exits.
- Otherwise polls; on finding unseen notes, prints them as JSON and exits 0.
  The caller adds a note to the state once it has replied (pen_reply.py).

Watched: the dictionary-pen folders (scans and voice notes) plus the root and
我的资源, where notes made in the phone app land.
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
REPLY_PREFIX = "答："  # titles of the reply notes Claude creates itself
READABLE_SUFFIXES = (".txt", ".md", ".note")
FOLDERS = {
    "0": "根目录",
    "SVR737286C20B3F40C2A8E462925025F611": "我的资源",
    "0392A7F1EE0E40399B6A635C2D8CF2CC": "词典笔笔记",
    "C5C516F2779B4C85916159C1A64ADD92": "文档扫描",
    "719FB34FED004B78BCB2BC3496FEE33D": "语音笔记",
}


async def snapshot(seen=None):
    async with sse_client(URL, timeout=30, sse_read_timeout=60) as (r, w):
        async with ClientSession(r, w) as s:
            await s.initialize()
            notes = {}
            for fid, fname in FOLDERS.items():
                res = await s.call_tool("listNotes", {"parentId": fid})
                for e in json.loads(res.content[0].text).get("entries", []):
                    if not e.get("dir"):
                        notes[e["id"]] = {"name": e["name"], "folder": fname, "folder_id": fid}
            if seen is None:
                return notes, [], []
            new = [i for i in notes if i not in seen]
            # Our own reply notes, and voice notes (.audio) or other types the
            # API cannot read, are recorded silently.
            silent = [i for i in new if notes[i]["name"].startswith(REPLY_PREFIX)
                      or not notes[i]["name"].lower().endswith(READABLE_SUFFIXES)]
            new = [i for i in new if i not in silent]
            for i in new:
                res = await s.call_tool("getNoteTextContent", {"fileId": i})
                try:
                    notes[i]["content"] = json.loads(res.content[0].text).get("content")
                except Exception:
                    notes[i]["content"] = res.content[0].text
            # A note that already carries an inline reply was answered before.
            silent += [i for i in new if MARKER in (notes[i].get("content") or "")]
            new = [i for i in new if i not in silent]
            return notes, new, silent


def main():
    state_path = sys.argv[1]
    interval = float(sys.argv[2]) if len(sys.argv) > 2 and not sys.argv[2].startswith("--") else 20
    seen = set(json.load(open(state_path))) if os.path.exists(state_path) else set()
    if not seen or "--absorb" in sys.argv:
        notes, _, _ = asyncio.run(snapshot())
        seen |= set(notes)
        json.dump(sorted(seen), open(state_path, "w"))
        print(f"recorded as seen: {len(seen)} notes")
        return
    while True:
        try:
            notes, new, silent = asyncio.run(snapshot(seen))
            if silent:
                seen.update(silent)
                json.dump(sorted(seen), open(state_path, "w"))
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
