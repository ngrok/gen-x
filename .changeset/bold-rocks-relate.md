---
"@ngrok/gen-x": minor
---

Added `--watch` / `-w` flag to watch the input directory for file changes and automatically regenerate `package.json#exports`. Config is loaded once at startup, and writes are skipped when exports are unchanged, making it efficient for use across many packages in a monorepo.
