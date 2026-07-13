---
"@ngrok/gen-x": patch
---

Write package.json atomically (write to a temp file, then rename) instead of truncating it in place. Previously a concurrent reader — e.g. a bundler resolving the package mid-build, or a build tool capturing task outputs — could observe an empty or partially-written package.json. The write resolves symlinks so a symlinked package.json is still written through to its target, preserves the original file's permissions, and cleans up its temp file on failure.
