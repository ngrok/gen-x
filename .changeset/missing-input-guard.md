---
"@ngrok/gen-x": minor
---

Fail loudly instead of silently wiping exports: a missing or non-directory input now exits with an error instead of replacing the entire exports map with just `./package.json` (watch mode validates before its first destructive write too), and a run whose include/exclude globs match zero files prints a warning before writing.
