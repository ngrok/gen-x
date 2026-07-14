#!/usr/bin/env node
// Tiny bootstrap: enable Node's on-disk V8 compile cache (Node >= 22.8) before
// loading the real program, so commander/tinyglobby and our own dist modules
// deserialize from code cache instead of re-parsing on every invocation.
// Default cache dir is os.tmpdir()/node-compile-cache; override with
// NODE_COMPILE_CACHE, disable with NODE_DISABLE_COMPILE_CACHE=1.
// Note: default import + optional call, NOT `import { enableCompileCache }` —
// the named import is a link-time error on Node < 22.8 that try/catch cannot catch.
import module from "node:module";

try {
	module.enableCompileCache?.();
} catch {
	// Never let cache setup break the CLI.
}

await import("./main.js");
