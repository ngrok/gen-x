---
"@ngrok/gen-x": minor
---

Remove config-file support and the esbuild dependency. gen-x no longer loads `gen-x.config.{ts,js,mjs,cjs,json}` or `package.json#genx`, and no longer exports `defineConfig` — CLI flags are the only configuration source. The programmatic `generateExports(config)` API and all CLI flags are unchanged. Dropping esbuild removes gen-x's only heavyweight dependency (a ~10MB platform binary) and shaves module-load time off every CLI invocation.
