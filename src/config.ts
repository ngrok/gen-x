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
	 * @example [["_pb", ""]] // Remove _pb suffix from protobuf files
	 * @default []
	 */
	replace?: ReplaceTuples;
	/**
	 * When true, emit plain string entries pointing directly to source files,
	 * omitting `import`, `types`, and any custom condition from the exports map.
	 * @default false
	 */
	sourceOnly?: boolean;
};
