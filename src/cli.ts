#!/usr/bin/env node
// Tiny bootstrap: enable Node's on-disk V8 compile cache before loading the
// real program, so commander/tinyglobby and our own dist modules deserialize
// from code cache instead of re-parsing on every invocation. It never throws:
// if the cache dir is unavailable, caching is silently disabled.
// Default cache dir is os.tmpdir()/node-compile-cache; override with
// NODE_COMPILE_CACHE, disable with NODE_DISABLE_COMPILE_CACHE=1.
import { enableCompileCache } from "node:module";

enableCompileCache();

await import("./main.js");
