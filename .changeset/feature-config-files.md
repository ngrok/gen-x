---
"@ngrok/gen-x": minor
---

Added config file support with TypeScript support and type-safe `defineConfig` helper. Supports gen-x.config.{ts,js,mjs,cjs,json} or package.json#genx field. Priority: CLI flags > config file > defaults. TypeScript configs are transformed using esbuild for zero-dependency usage.
