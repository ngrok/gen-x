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

Prerequisites required:

- [Node 20](https://nodejs.org/en/download)
- [pnpm 9](https://pnpm.io/installation#using-npm)
- [nvm](https://github.com/nvm-sh/nvm)

We use [direnv](https://direnv.net/) to assist you with setting up all of the required tooling.

<details>
  <summary>Prefer to install and manage the tooling yourself?</summary>

1. Install [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) or your node version manager of choice.
2. Ensure that `node 20` is installed. With `nvm`, run `nvm install`.
3. Enable `pnpm` with `corepack`: `corepack enable pnpm`
4. Install `pnpm` with `corepack`: `corepack install`
5. Install project dependencies with `pnpm`: `pnpm install`
</details>

First, install `direnv`:

| OS     | command                 |
| ------ | ----------------------- |
| macOS  | brew install direnv     |
| ubuntu | sudo apt install direnv |

For all other OSes, see the [direnv installation guide](https://direnv.net/docs/installation.html).

Don't forget to [set up direnv integration with your shell](https://direnv.net/docs/hook.html).

Next, clone the repo and move into the directory:

```sh
git clone https://github.com/ngrok-oss/gen-x.git
cd gen-x
```

Next, run:

```sh
direnv allow
```

This will install `nvm` (if not already installed) as well as set the correct `node` and `pnpm` versions for you.
It will also run `pnpm install` at the end to install all `node_modules`.
