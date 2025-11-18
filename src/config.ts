import fs from "node:fs/promises";
import path from "node:path";
import { transformSync } from "esbuild";
import type { ReplaceTuples } from "./replace.js";
import type { TransformMode } from "./transforms/mode.js";

export type Config = {
	/**
	 * The input directory to gather file paths from.
	 * @default "src"
	 */
	input?: string;
	/**
	 * The output directory for the package export files.
	 * @default "dist"
	 */
	output?: string;
	/**
	 * A list of globs to include file paths from.
	 * @default ["**\/*.{ts,tsx,cts,mts,js,jsx,mjs,cjs,css}"]
	 */
	include?: string[];
	/**
	 * A list of globs to exclude file paths from.
	 * @default ["**\/*.d.ts", "**\/*.test.*", "**\/*.spec.*", "**\/__tests__/**"]
	 */
	exclude?: string[];
	/**
	 * The mode to transform filepath segments.
	 * - `"passthrough"` - No transformation (default)
	 * - `"camelCase"` - Transform to camelCase
	 * - `"kebab-case"` - Transform to kebab-case
	 * - `"PascalCase"` - Transform to PascalCase
	 * - `"snake_case"` - Transform to snake_case
	 * @default "passthrough"
	 */
	mode?: TransformMode;
	/**
	 * Add a unique custom condition to the package.json exports for supporting live types in a monorepo.
	 * Example: "@my-package/source"
	 * @see https://colinhacks.com/essays/live-types-typescript-monorepo
	 * @default undefined
	 */
	customCondition?: string | null;
	/**
	 * Replace export keys, a way to rename exports.
	 * Array of tuples: [pattern, replacement]
	 * Pattern can be a string or RegExp.
	 * @example [["/_pb/", ""]] // Remove _pb suffix from protobuf files
	 * @default []
	 */
	replace?: ReplaceTuples;
};

/**
 * Load config from gen-x.config.{ts,js,mjs,cjs,json} or package.json#genx
 * Priority: gen-x.config.* > package.json#genx
 */
export async function loadConfig(cwd: string = process.cwd()): Promise<Config | null> {
	// Try gen-x.config.{ts,js,mjs,cjs,json} in priority order
	for (const ext of ["ts", "js", "mjs", "cjs", "json"]) {
		const configPath = path.join(cwd, `gen-x.config.${ext}`);
		try {
			await fs.access(configPath);
			if (ext === "json") {
				const content = await fs.readFile(configPath, "utf8");
				return JSON.parse(content) as Config;
			} else if (ext === "ts") {
				// For TypeScript configs, strip imports and defineConfig wrapper before transformation
				// defineConfig is just an identity function, so we can safely remove it
				let content = await fs.readFile(configPath, "utf8");
				content = content
					.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, "") // Remove imports
					.replace(/defineConfig\s*\(\s*\{/g, "{") // Remove defineConfig( wrapper
					.replace(/\}\s*\)/g, "}"); // Remove closing )

				const result = transformSync(content, {
					loader: "ts",
					format: "esm",
					target: "node22",
				});

				const dataUrl = `data:text/javascript;base64,${Buffer.from(result.code).toString("base64")}`;
				const module = await import(dataUrl);
				return (module.default || module) as Config;
			} else {
				// Import JS config
				const fileUrl = `file://${configPath}`;
				const module = await import(fileUrl);
				return (module.default || module) as Config;
			}
		} catch {
			// File doesn't exist or failed to load, try next
		}
	}

	// Try package.json#genx
	try {
		const pkgPath = path.join(cwd, "package.json");
		const content = await fs.readFile(pkgPath, "utf8");
		const pkg = JSON.parse(content);
		if (pkg.genx) {
			return pkg.genx as Config;
		}
	} catch {
		// package.json doesn't exist or has no genx field
	}

	return null;
}

/**
 * Merge configs with priority: cli > config file > defaults
 */
export function mergeConfigs(cliConfig: Config, fileConfig: Config | null, defaults: Config): Config {
	return {
		...defaults,
		...(fileConfig || {}),
		...Object.fromEntries(Object.entries(cliConfig).filter(([, v]) => v !== undefined)),
	};
}

/**
 * Type-safe helper for defining gen-x configuration.
 * Use in gen-x.config.ts or gen-x.config.js files.
 *
 * @example
 * ```ts
 * import { defineConfig } from "@ngrok/gen-x";
 *
 * export default defineConfig({
 *   mode: "camelCase",
 *   customCondition: "@my-package/source"
 * });
 * ```
 */
export function defineConfig(config: Config): Config {
	return config;
}
