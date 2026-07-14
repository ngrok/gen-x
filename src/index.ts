import fs from "node:fs/promises";
import path from "node:path";

import { buildPackageJsonExports, type ExportsField } from "./build-package-json-exports.js";
import type { Config } from "./config.js";
import { gatherFilepaths } from "./gather-filepaths.js";
import { makeExportItems } from "./make-export-items.js";

/**
 * Generate the exports object for the package given the arguments.
 *
 * `packageJsonPath` is the package.json the exports are destined for; source
 * paths in the exports map are emitted relative to its directory.
 */
async function generateExports(args: Config, packageJsonPath: string = "package.json"): Promise<ExportsField> {
	const { customCondition, exclude, include, input, output, mode, replace, sourceOnly } = parseArguments(args);

	// exports targets resolve relative to the package.json's own directory
	const packageDir = path.dirname(path.resolve(packageJsonPath));

	// Fail loudly if the input directory does not exist. tinyglobby returns []
	// for a nonexistent cwd, which would silently replace every existing export
	// with just "./package.json" (destroying a published package's exports map).
	const inputStats = await fs.stat(input).catch(() => null);
	if (!inputStats?.isDirectory()) {
		throw new Error(`Input directory "${input}" does not exist (from --input).`);
	}

	const filepaths = await gatherFilepaths({ input, include, exclude });

	// An empty match always erases every generated export, which is usually an
	// include/exclude typo rather than intent — warn before writing.
	if (filepaths.length === 0) {
		console.warn(
			`Warning: no files in "${input}" matched include ${JSON.stringify(include)}; ` +
				`package.json#exports will contain only "./package.json".`,
		);
	}

	const exportItems = makeExportItems(filepaths, { input, mode, replace, packageDir });

	const exports = buildPackageJsonExports(exportItems, { outputDir: output, customCondition, sourceOnly });

	return exports;
}

export {
	//,
	generateExports,
};

export type { Config } from "./config.js";

/**
 * Parse the arguments object and return a new object with all properties as required.
 */
function parseArguments(args: Config): Required<Config> {
	const customCondition = args.customCondition ?? null;
	const exclude = args.exclude ?? ["**/*.d.ts", "**/*.test.*", "**/*.spec.*", "**/__tests__/**"];
	const include = args.include ?? ["**/*.{ts,tsx,cts,mts,js,jsx,mjs,cjs,css}"];
	// input: resolve to absolute path for filesystem operations
	const input = path.resolve(args.input?.trim() || path.join(process.cwd(), "src"));
	const mode = args.mode ?? "passthrough";
	// output: keep relative for package.json
	const output = args.output?.trim() || "dist";
	const replace = args.replace ?? [];
	const sourceOnly = args.sourceOnly ?? false;

	return {
		customCondition,
		exclude,
		include,
		input,
		mode,
		output,
		replace,
		sourceOnly,
	};
}
