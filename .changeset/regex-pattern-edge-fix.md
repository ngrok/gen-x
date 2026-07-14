---
"@ngrok/gen-x": patch
---

Fix `--replace` regex parsing corrupting patterns with escaped slashes at the edges: `/\/foo\//` was double-stripped into `/foo/` instead of matching a slash-delimited `foo`. The capture between the outer delimiters is now used as-is.
