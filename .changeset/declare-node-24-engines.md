---
"@ngrok/gen-x": minor
---

Declare `engines.node >= 24`: gen-x supports the current Node LTS line only. (The CLI's compile-cache bootstrap relies on `module.enableCompileCache`, available since Node 22.8.)
