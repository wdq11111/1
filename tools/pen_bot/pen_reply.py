"""Append a reply under a pen note's original text.

Usage: pen_reply.py FILE_ID REPLY_TEXT_FILE STATE_JSON
Only .md notes can be updated through the API, so a non-.md note is renamed to
.md, updated, and renamed back. Each step is retried on dropped connections, and
the final title and content are read back to verify. On success the note is
marked as seen in STATE_JSON.
"""
import asyncio
import json
import sys

from mcp import ClientSession
from mcp.client.sse import sse_client

URL = "https://open.mail.163.com/api/ynote/mcp/sse"


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


def main():
    fid, reply_path, state_path = sys.argv[1], sys.argv[2], sys.argv[3]
    reply = open(reply_path, encoding="utf-8").read().strip()
    info = json.loads(call("getNoteTextContent", {"fileId": fid}))
    title, original = info["title"], (info.get("content") or "").rstrip()
    new_content = f"{original}\n\n—— Claude 回复 ——\n{reply}\n"
    is_md = title.lower().endswith(".md")
    if not is_md:
        stem = title.rsplit(".", 1)[0]
        call("renameNote", {"fileId": fid, "newTitle": stem + ".md"})
    try:
        call("updateMarkdownNote", {"fileId": fid, "content": new_content})
    finally:
        if not is_md:
            call("renameNote", {"fileId": fid, "newTitle": title})
    check = json.loads(call("getNoteTextContent", {"fileId": fid}))
    ok = check["title"] == title and check.get("content", "").strip() == new_content.strip()
    print(f"title: {check['title']} | verified: {ok}")
    if ok:
        seen = set(json.load(open(state_path)))
        seen.add(fid)
        json.dump(sorted(seen), open(state_path, "w"))
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
