# @ngrok/gen-x

## 0.5.0

### Minor Changes

- [#32](https://github.com/ngrok/gen-x/pull/32) [`65f197f`](https://github.com/ngrok/gen-x/commit/65f197f0c653cd31c9e1b0c0d878e20f968c7645) Thanks [@cody-dot-js](https://github.com/cody-dot-js)! - Declare `engines.node >= 24`: gen-x supports the current Node LTS line only. (The CLI's compile-cache bootstrap relies on `module.enableCompileCache`, available since Node 22.8.)

- [#32](https://github.com/ngrok/gen-x/pull/32) [`65f197f`](https://github.com/ngrok/gen-x/commit/65f197f0c653cd31c9e1b0c0d878e20f968c7645) Thanks [@cody-dot-js](https://github.com/cody-dot-js)! - Fail loudly instead of silently wiping exports: a missing or non-directory input now exits with an error instead of replacing the entire exports map with just `./package.json` (watch mode validates before its first destructive write too), and a run whose include/exclude globs match zero files prints a warning before writing.

- [#32](https://github.com/ngrok/gen-x/pull/32) [`65f197f`](https://github.com/ngrok/gen-x/commit/65f197f0c653cd31c9e1b0c0d878e20f968c7645) Thanks [@cody-dot-js](https://github.com/cody-dot-js)! - Performance: skip the package.json write entirely when the generated output is byte-identical (saves the ~5ms atomic-write/fsync path and keeps package.json's mtime stable so build-system caches aren't invalidated by no-op runs); sort gathered file paths with the default UTF-16 code-unit comparator instead of `localeCompare` (avoids ~6ms of ICU collator init per invocation and makes the emitted exports order deterministic across machines/locales — key order in generated exports may change once on repos with mixed-case filenames); compute export paths with a prefix slice instead of per-file `path.relative` (~10% faster end-to-end at 2000 files); enable Node's on-disk V8 compile cache in the CLI bootstrap (~2-2.5ms per warm invocation, disable with `NODE_DISABLE_COMPILE_CACHE=1`); remove the unused `@commander-js/extra-typings` dependency.

- [#32](https://github.com/ngrok/gen-x/pull/32) [`65f197f`](https://github.com/ngrok/gen-x/commit/65f197f0c653cd31c9e1b0c0d878e20f968c7645) Thanks [@cody-dot-js](https://github.com/cody-dot-js)! - Remove config-file support and the esbuild dependency. gen-x no longer loads `gen-x.config.{ts,js,mjs,cjs,json}` or `package.json#genx`, and no longer exports `defineConfig` — CLI flags are the only configuration source. The programmatic `generateExports(config)` API and all CLI flags are unchanged. Dropping esbuild removes gen-x's only heavyweight dependency (a ~10MB platform binary) and shaves module-load time off every CLI invocation.

### Patch Changes

- [#32](https://github.com/ngrok/gen-x/pull/32) [`65f197f`](https://github.com/ngrok/gen-x/commit/65f197f0c653cd31c9e1b0c0d878e20f968c7645) Thanks [@cody-dot-js](https://github.com/cody-dot-js)! - Emit customCondition/sourceOnly source paths relative to the target package.json's directory instead of the process cwd. Previously, running gen-x from outside the package directory (e.g. `gen-x -p packages/foo/package.json` from a monorepo root) produced source paths that neither Node nor TypeScript could resolve. `generateExports` gains an optional second `packageJsonPath` argument (defaults to `"package.json"`, preserving existing behavior for cwd-based calls).

- [#32](https://github.com/ngrok/gen-x/pull/32) [`65f197f`](https://github.com/ngrok/gen-x/commit/65f197f0c653cd31c9e1b0c0d878e20f968c7645) Thanks [@cody-dot-js](https://github.com/cody-dot-js)! - Fix `--replace` regex parsing corrupting patterns with escaped slashes at the edges: `/\/foo\//` was double-stripped into `/foo/` instead of matching a slash-delimited `foo`. The capture between the outer delimiters is now used as-is.

## 0.4.2

### Patch Changes

- [#29](https://github.com/ngrok/gen-x/pull/29) [`0b1bb32`](https://github.com/ngrok/gen-x/commit/0b1bb32451e65aecffa7aa60da7ff79456c83312) Thanks [@cody-dot-js](https://github.com/cody-dot-js)! - Write package.json atomically (write to a temp file, then rename) instead of truncating it in place. Previously a concurrent reader — e.g. a bundler resolving the package mid-build, or a build tool capturing task outputs — could observe an empty or partially-written package.json. The write resolves symlinks so a symlinked package.json is still written through to its target, preserves the original file's permissions, and cleans up its temp file on failure.

- [#31](https://github.com/ngrok/gen-x/pull/31) [`7408e84`](https://github.com/ngrok/gen-x/commit/7408e8494f6ac982d46c40ef08008505dde18ba8) Thanks [@cody-dot-js](https://github.com/cody-dot-js)! - Update runtime dependencies to their latest versions: commander 15, @commander-js/extra-typings 15, esbuild 0.28.1, and tinyglobby 0.2.17. Also migrates the toolchain to TypeScript 7, oxlint 1.73, oxfmt 0.58, vitest 4.1, and pnpm 11, and switches local tooling management from direnv/fnm to mise.

## 0.4.1

### Patch Changes

- [#27](https://github.com/ngrok/gen-x/pull/27) [`ad8b4b1`](https://github.com/ngrok/gen-x/commit/ad8b4b1a27530490b6c4065ca023e789815aacf5) Thanks [@cody-dot-js](https://github.com/cody-dot-js)! - Preserve `exports` key position when updating `package.json`. Previously, gen-x always deleted and re-appended the `exports` field, moving it to the end of the file on every run. Now, if `exports` already exists, it is updated in-place so its position relative to other keys is unchanged.

## 0.4.0

### Minor Changes

- [#24](https://github.com/ngrok/gen-x/pull/24) [`36cbeb4`](https://github.com/ngrok/gen-x/commit/36cbeb402ce527feae3490f3bb9387e0dd4b3fd3) Thanks [@cody-dot-js](https://github.com/cody-dot-js)! - Added `--watch` / `-w` flag to watch the input directory for file changes and automatically regenerate `package.json#exports`. Config is loaded once at startup, and writes are skipped when exports are unchanged, making it efficient for use across many packages in a monorepo.

## 0.3.0

### Minor Changes

- [#22](https://github.com/ngrok/gen-x/pull/22) [`fdb1104`](https://github.com/ngrok/gen-x/commit/fdb1104c52d0d91d3258a13e2f325d3965bb82ba) Thanks [@cody-dot-js](https://github.com/cody-dot-js)! - Add `--sourceOnly` option that emits plain source file paths in the exports map, omitting `import`, `types`, and custom condition entries.

## 0.2.1

### Patch Changes

- [#19](https://github.com/ngrok/gen-x/pull/19) [`57457e0`](https://github.com/ngrok/gen-x/commit/57457e0f51ad85975d09a2bf35321e88cf57b8de) Thanks [@cody-dot-js](https://github.com/cody-dot-js)! - Fixed mode transforms incorrectly converting multi-part extensions like `.module.css` to `-module.css`. Export keys now preserve the full extension while transforming only the basename (e.g., `FancyButton.module.css` → `./fancy-button.module.css` with kebab-case mode)

## 0.2.0

### Minor Changes

- [#15](https://github.com/ngrok/gen-x/pull/15) [`16b342b`](https://github.com/ngrok/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Improved default include/exclude patterns - now includes CSS, excludes declaration files and common test patterns

- [#15](https://github.com/ngrok/gen-x/pull/15) [`16b342b`](https://github.com/ngrok/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Added config file support with TypeScript support and type-safe `defineConfig` helper. Supports gen-x.config.{ts,js,mjs,cjs,json} or package.json#genx field. Priority: CLI flags > config file > defaults. TypeScript configs are transformed using esbuild for zero-dependency usage.

- [#15](https://github.com/ngrok/gen-x/pull/15) [`16b342b`](https://github.com/ngrok/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Added support for CSS files - extensions are preserved in export keys and no types field is generated for asset files

- [#15](https://github.com/ngrok/gen-x/pull/15) [`16b342b`](https://github.com/ngrok/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Index files now automatically flatten to their directory path (e.g., index.ts → ".", lib/index.ts → "./lib")

### Patch Changes

- [#15](https://github.com/ngrok/gen-x/pull/15) [`16b342b`](https://github.com/ngrok/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Added esbuild as a dependency for TypeScript config file transformation

- [#15](https://github.com/ngrok/gen-x/pull/15) [`16b342b`](https://github.com/ngrok/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Fixed absolute paths leaking into package.json exports. Input is now normalized to absolute for filesystem operations, output stays relative

- [#15](https://github.com/ngrok/gen-x/pull/15) [`16b342b`](https://github.com/ngrok/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Fixed CLI vs programmatic API defaults inconsistency for better predictable behavior

- [#15](https://github.com/ngrok/gen-x/pull/15) [`16b342b`](https://github.com/ngrok/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Added collision detection for duplicate export keys with helpful error messages showing conflicting files

- [#15](https://github.com/ngrok/gen-x/pull/15) [`16b342b`](https://github.com/ngrok/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Fixed double globbing performance issue - now uses single glob call with ignore option for better performance

- [#15](https://github.com/ngrok/gen-x/pull/15) [`16b342b`](https://github.com/ngrok/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Fixed dry-run output to use JSON.stringify for better readability

- [#15](https://github.com/ngrok/gen-x/pull/15) [`16b342b`](https://github.com/ngrok/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Fixed potential duplicate "./" in source paths when srcDir is "."

- [#15](https://github.com/ngrok/gen-x/pull/15) [`16b342b`](https://github.com/ngrok/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Added proper error handling for package.json read/parse/write operations with clear error messages

- [#15](https://github.com/ngrok/gen-x/pull/15) [`16b342b`](https://github.com/ngrok/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Fixed shared mutable baseExports object causing state leakage across function calls in long-lived processes

- [#15](https://github.com/ngrok/gen-x/pull/15) [`16b342b`](https://github.com/ngrok/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Fixed OS-dependent path separators - package.json exports now always use POSIX forward slashes on all platforms
