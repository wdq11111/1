"""Reply to a question note.

Usage: pen_reply.py FILE_ID REPLY_TEXT_FILE STATE_JSON [FOLDER_ID]

- .txt / .md notes (pen scans): the reply is appended under the original text.
  Only .md notes can be updated through the API, so a .txt note is renamed to
  .md, updated and renamed back; the title is re-checked a few seconds later
  because the API has been seen to report the old title right after a rename.
- .note notes (made in the phone app): rewriting their rich-text body could
  damage them, so a separate reply note titled "答：<question>" is created in
  FOLDER_ID (the question's folder) instead.

Each API step is retried on dropped connections. On success the question note
(and any new reply note) is recorded as seen in STATE_JSON.
"""
import asyncio
import json
import re
import sys
import time

from mcp import ClientSession
from mcp.client.sse import sse_client

URL = "https://open.mail.163.com/api/ynote/mcp/sse"
MARKER = "—— Claude 回复 ——"
REPLY_PREFIX = "答："


async def _call(tool, args):
    async with sse_client(URL, timeout=30, sse_read_timeout=60) as (r, w):
        async with ClientSession(r, w) as s:
            await s.initialize()
            res = await s.call_tool(tool, args)
            return res.isError, res.content[0].text


def call(tool, args, tries=4):
    last = None
    for _ in range(tries):
        try:
            err, text = asyncio.run(_call(tool, args))
            if err:
                raise RuntimeError(f"{tool} failed: {text[:200]}")
            return text
        except RuntimeError:
            raise
        except BaseException as e:
            if isinstance(e, KeyboardInterrupt):
                raise
            last = e
    raise RuntimeError(f"{tool}: connection kept failing ({type(last).__name__})")


def mark_seen(state_path, *ids):
    seen = set(json.load(open(state_path)))
    seen.update(i for i in ids if i)
    json.dump(sorted(seen), open(state_path, "w"))


def reply_inline(fid, title, original, reply):
    new_content = f"{original}\n\n{MARKER}\n{reply}\n"
    is_md = title.lower().endswith(".md")
    if not is_md:
        call("renameNote", {"fileId": fid, "newTitle": title.rsplit(".", 1)[0] + ".md"})
    try:
        call("updateMarkdownNote", {"fileId": fid, "content": new_content})
    finally:
        if not is_md:
            call("renameNote", {"fileId": fid, "newTitle": title})
    for attempt in range(4):
        time.sleep(3)
        check = json.loads(call("getNoteTextContent", {"fileId": fid}))
        if check["title"] == title:
            break
        call("renameNote", {"fileId": fid, "newTitle": title})
    ok = check["title"] == title and check.get("content", "").strip() == new_content.strip()
    print(f"title: {check['title']} | verified: {ok}")
    return ok


def reply_as_new_note(original, reply, folder_id):
    question = re.sub(r"[\\/:*?\"<>|\s]+", " ", original).strip()[:30] or "你的笔记"
    title = f"{REPLY_PREFIX}{question}"
    body = f"# {title}\n\n{reply}\n"
    text = None
    if folder_id and folder_id != "0":
        try:
            text = call("createAnyNote", {"title": title + ".md", "content": body,
                                          "type": "md", "parentId": folder_id})
        except RuntimeError:
            text = None
    if text is None:  # createAnyNote refuses the root folder; plain note instead
        text = call("createNote", {"title": title, "content": reply, "parentId": folder_id or "0"})
    m = re.search(r"[0-9A-Za-z]{20,}", text)
    print(f"created reply note {title!r}: {text[:80]}")
    return m.group(0) if m else None


def main():
    fid, reply_path, state_path = sys.argv[1], sys.argv[2], sys.argv[3]
    folder_id = sys.argv[4] if len(sys.argv) > 4 else None
    reply = open(reply_path, encoding="utf-8").read().strip()
    info = json.loads(call("getNoteTextContent", {"fileId": fid}))
    title, original = info["title"], (info.get("content") or "").rstrip()
    low = title.lower()
    if low.endswith((".txt", ".md")):
        if not reply_inline(fid, title, original, reply):
            sys.exit(1)
        mark_seen(state_path, fid)
    elif low.endswith(".note"):
        mark_seen(state_path, fid, reply_as_new_note(original, reply, folder_id))
    else:
        sys.exit(f"refusing to touch {title!r}: unsupported note type")


if __name__ == "__main__":
    main()
