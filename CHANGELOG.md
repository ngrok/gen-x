# @ngrok/gen-x

## 0.2.1

### Patch Changes

- [#19](https://github.com/ngrok-oss/gen-x/pull/19) [`57457e0`](https://github.com/ngrok-oss/gen-x/commit/57457e0f51ad85975d09a2bf35321e88cf57b8de) Thanks [@cody-dot-js](https://github.com/cody-dot-js)! - Fixed mode transforms incorrectly converting multi-part extensions like `.module.css` to `-module.css`. Export keys now preserve the full extension while transforming only the basename (e.g., `FancyButton.module.css` → `./fancy-button.module.css` with kebab-case mode)

## 0.2.0

### Minor Changes

- [#15](https://github.com/ngrok-oss/gen-x/pull/15) [`16b342b`](https://github.com/ngrok-oss/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Improved default include/exclude patterns - now includes CSS, excludes declaration files and common test patterns

- [#15](https://github.com/ngrok-oss/gen-x/pull/15) [`16b342b`](https://github.com/ngrok-oss/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Added config file support with TypeScript support and type-safe `defineConfig` helper. Supports gen-x.config.{ts,js,mjs,cjs,json} or package.json#genx field. Priority: CLI flags > config file > defaults. TypeScript configs are transformed using esbuild for zero-dependency usage.

- [#15](https://github.com/ngrok-oss/gen-x/pull/15) [`16b342b`](https://github.com/ngrok-oss/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Added support for CSS files - extensions are preserved in export keys and no types field is generated for asset files

- [#15](https://github.com/ngrok-oss/gen-x/pull/15) [`16b342b`](https://github.com/ngrok-oss/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Index files now automatically flatten to their directory path (e.g., index.ts → ".", lib/index.ts → "./lib")

### Patch Changes

- [#15](https://github.com/ngrok-oss/gen-x/pull/15) [`16b342b`](https://github.com/ngrok-oss/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Added esbuild as a dependency for TypeScript config file transformation

- [#15](https://github.com/ngrok-oss/gen-x/pull/15) [`16b342b`](https://github.com/ngrok-oss/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Fixed absolute paths leaking into package.json exports. Input is now normalized to absolute for filesystem operations, output stays relative

- [#15](https://github.com/ngrok-oss/gen-x/pull/15) [`16b342b`](https://github.com/ngrok-oss/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Fixed CLI vs programmatic API defaults inconsistency for better predictable behavior

- [#15](https://github.com/ngrok-oss/gen-x/pull/15) [`16b342b`](https://github.com/ngrok-oss/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Added collision detection for duplicate export keys with helpful error messages showing conflicting files

- [#15](https://github.com/ngrok-oss/gen-x/pull/15) [`16b342b`](https://github.com/ngrok-oss/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Fixed double globbing performance issue - now uses single glob call with ignore option for better performance

- [#15](https://github.com/ngrok-oss/gen-x/pull/15) [`16b342b`](https://github.com/ngrok-oss/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Fixed dry-run output to use JSON.stringify for better readability

- [#15](https://github.com/ngrok-oss/gen-x/pull/15) [`16b342b`](https://github.com/ngrok-oss/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Fixed potential duplicate "./" in source paths when srcDir is "."

- [#15](https://github.com/ngrok-oss/gen-x/pull/15) [`16b342b`](https://github.com/ngrok-oss/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Added proper error handling for package.json read/parse/write operations with clear error messages

- [#15](https://github.com/ngrok-oss/gen-x/pull/15) [`16b342b`](https://github.com/ngrok-oss/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Fixed shared mutable baseExports object causing state leakage across function calls in long-lived processes

- [#15](https://github.com/ngrok-oss/gen-x/pull/15) [`16b342b`](https://github.com/ngrok-oss/gen-x/commit/16b342bcb17b6f405c9dc4560e799998c012cb36) Thanks [@dependabot](https://github.com/apps/dependabot)! - Fixed OS-dependent path separators - package.json exports now always use POSIX forward slashes on all platforms
