---
"@ngrok/gen-x": minor
---

Performance: skip the package.json write entirely when the generated output is byte-identical (saves the ~5ms atomic-write/fsync path and keeps package.json's mtime stable so build-system caches aren't invalidated by no-op runs); sort gathered file paths with the default UTF-16 code-unit comparator instead of `localeCompare` (avoids ~6ms of ICU collator init per invocation and makes the emitted exports order deterministic across machines/locales — key order in generated exports may change once on repos with mixed-case filenames); compute export paths with a prefix slice instead of per-file `path.relative` (~10% faster end-to-end at 2000 files); enable Node's on-disk V8 compile cache in the CLI bootstrap (~2-2.5ms per warm invocation, disable with `NODE_DISABLE_COMPILE_CACHE=1`); remove the unused `@commander-js/extra-typings` dependency.
