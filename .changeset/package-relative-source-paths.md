---
"@ngrok/gen-x": patch
---

Emit customCondition/sourceOnly source paths relative to the target package.json's directory instead of the process cwd. Previously, running gen-x from outside the package directory (e.g. `gen-x -p packages/foo/package.json` from a monorepo root) produced source paths that neither Node nor TypeScript could resolve. `generateExports` gains an optional second `packageJsonPath` argument (defaults to `"package.json"`, preserving existing behavior for cwd-based calls).
