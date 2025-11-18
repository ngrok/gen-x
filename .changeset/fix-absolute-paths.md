---
"@ngrok/gen-x": patch
---

Fixed absolute paths leaking into package.json exports. Input is now normalized to absolute for filesystem operations, output stays relative
