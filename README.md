# @ngrok/gen-x

Generate package.json#exports from src

Automatically generate package.json exports from your source files with support for TypeScript, JavaScript, JSX/TSX, and CSS. Features include index file flattening, custom transform modes, and monorepo live types support.

## Installation

Install `@ngrok/gen-x` to your `devDependencies` with your preferred package manager:

| package manager | command                      |
| --------------- | ---------------------------- |
| npm             | npm install -DE @ngrok/gen-x |
| yarn            | yarn add -DE @ngrok/gen-x    |
| pnpm            | pnpm add -DE @ngrok/gen-x    |
| bun             | bun add -DE @ngrok/gen-x     |

## Quick Start

```bash
# Generate exports from src/ to dist/
npx gen-x

# Preview changes without writing
npx gen-x --dry-run
```

This will scan your `src/` directory and generate package.json exports like:

```json
{
	"exports": {
		"./package.json": "./package.json",
		".": {
			"import": "./dist/index.js",
			"types": "./dist/index.d.ts"
		},
		"./utils": {
			"import": "./dist/utils.js",
			"types": "./dist/utils.d.ts"
		}
	}
}
```

## Features

- ✅ **Index file flattening** - `index.ts` → `"."`, `lib/index.ts` → `"./lib"`
- ✅ **CSS support** - Preserves extensions for assets, no types field
- ✅ **Multiple file types** - .ts, .tsx, .js, .jsx, .mjs, .cjs, .css
- ✅ **Transform modes** - camelCase, kebab-case, PascalCase, snake_case
- ✅ **Replace patterns** - Rename exports with regex or string patterns
- ✅ **Custom conditions** - For monorepo live types
- ✅ **Config files** - gen-x.config.{ts,js,json} with type-safe `defineConfig`
- ✅ **Watch mode** - Automatically regenerate exports on file changes
- ✅ **Source-only mode** - Emit plain source file paths without import/types conditions
- ✅ **Cross-platform** - Always generates POSIX paths for package.json
- ✅ **Collision detection** - Errors on duplicate export keys

## Configuration

### Config File (Recommended)

Create a `gen-x.config.ts` file for type-safe configuration:

```typescript
import { defineConfig } from "@ngrok/gen-x";

export default defineConfig({
	input: "src",
	output: "dist",
	mode: "camelCase",
	customCondition: "@my-package/source",
	include: ["**/*.{ts,tsx,js,jsx,css}"],
	exclude: ["**/*.test.*", "**/*.d.ts"],
});
```

Or use `gen-x.config.json`:

```json
{
	"mode": "camelCase",
	"customCondition": "@my-package/source"
}
```

Or add to `package.json`:

```json
{
	"genx": {
		"mode": "camelCase"
	}
}
```

**Priority:** CLI flags > config file > defaults

### CLI Options

```bash
Options:
  -V, --version                      output the version number
  --dry-run, --dryRun               Preview changes to stdout
  --exclude <exclude...>            Globs to exclude (default: ["**/*.d.ts","**/*.test.*","**/*.spec.*","**/__tests__/**"])
  --include <include...>            Globs to include (default: ["**/*.{ts,tsx,cts,mts,js,jsx,mjs,cjs,css}"])
  -i, --input <input>               Input directory (default: "src")
  -m, --mode <mode>                 Transform mode: passthrough|camelCase|kebab-case|PascalCase|snake_case (default: "passthrough")
  --customCondition <condition>     Custom condition for monorepo live types
  -o, --output <output>             Output directory (default: "dist")
  -p, --package <package>           Path to package.json (default: "package.json")
  -r, --replace <pattern:=>replacement...>  Replace export keys
  --sourceOnly                      Only emit plain source file paths in exports
  -w, --watch                       Watch the input directory for changes and regenerate exports
  -h, --help                        display help for command
```

## Examples

### Basic Usage

```bash
npx gen-x
```

### Transform Export Names

```bash
# Transform to camelCase
npx gen-x --mode camelCase
# hello-world.ts → ./helloWorld

# Transform to kebab-case
npx gen-x --mode kebab-case
# HelloWorld.ts → ./hello-world
```

### Replace Patterns

```bash
# Remove _pb suffix from protobuf files
npx gen-x --replace "/_pb/:=>"
# user_pb.ts → ./user (but still imports from user_pb.js)

# Multiple replacements
npx gen-x --replace "/_pb/:=>" --replace "/^api-/:=>api/"
```

### Monorepo Live Types

For consuming packages in the same monorepo to use source TypeScript files:

```typescript
// gen-x.config.ts
export default {
	customCondition: "@my-org/my-package/source",
};
```

Generates:

```json
{
	"exports": {
		".": {
			"@my-org/my-package/source": "./src/index.ts",
			"import": "./dist/index.js",
			"types": "./dist/index.d.ts"
		}
	}
}
```

See [Live Types in TypeScript Monorepo](https://colinhacks.com/essays/live-types-typescript-monorepo) for more info.

### CSS and Asset Files

CSS files automatically preserve their extensions:

```bash
# src/styles/theme.css → ./styles/theme.css
npx gen-x
```

Output:

```json
{
	"./styles/theme.css": {
		"import": "./dist/styles/theme.css"
	}
}
```

### Custom Include/Exclude

```bash
# Include only TypeScript files
npx gen-x --include "**/*.ts" --include "**/*.tsx"

# Exclude internal files
npx gen-x --exclude "**/internal/**" --exclude "**/*.test.*"
```

### Watch Mode

Automatically regenerate exports when files are added, deleted, or renamed:

```bash
npx gen-x --watch
```

Config is loaded once at startup and reused on every regeneration, so there is no repeated overhead from esbuild transforms. Writes are skipped when exports haven't changed, avoiding unnecessary downstream rebuilds in tools like Turborepo.

## API Usage

```typescript
import { generateExports } from "@ngrok/gen-x";

const exports = await generateExports({
	input: "src",
	output: "dist",
	mode: "camelCase",
});

console.log(exports);
```

## Development

We use [mise](https://mise.jdx.dev/) to manage the toolchain (Node.js and pnpm). Versions are pinned in `.nvmrc` (Node) and `package.json#packageManager` (pnpm), and locked in the committed `mise.lock`.

First, install `mise` (or run `./scripts/install-mise` to install the pinned version):

| OS    | command                     |
| ----- | --------------------------- |
| macOS | brew install mise           |
| other | curl https://mise.run \| sh |

For all other install methods, see the [mise installation guide](https://mise.jdx.dev/getting-started.html).

Don't forget to [activate mise in your shell](https://mise.jdx.dev/getting-started.html#activate-mise).

Next, clone the repo and move into the directory:

```sh
git clone https://github.com/ngrok-oss/gen-x.git
cd gen-x
```

Next, run:

```sh
mise trust
mise install
mise run setup
```

This installs the pinned `node` and `pnpm` versions and then runs `pnpm install --frozen-lockfile` to install all `node_modules`.

Useful mise tasks:

- `mise run doctor` — verify the active tools match the committed pins
- `mise run relock` — refresh `mise.lock` after bumping `.nvmrc` or `package.json#packageManager` (then run `mise install` and commit both)

<details>
  <summary>Prefer to install and manage the tooling yourself?</summary>

1. Install the `node` version pinned in `.nvmrc` with your node version manager of choice.
2. Enable `pnpm` with `corepack`: `corepack enable pnpm`
3. Install `pnpm` with `corepack`: `corepack install`
4. Install project dependencies with `pnpm`: `pnpm install`

</details>
