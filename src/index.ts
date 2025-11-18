import path from "node:path";
import { buildPackageJsonExports, type ExportsField } from "./build-package-json-exports.js";
import type { Config } from "./config.js";
import { gatherFilepaths } from "./gather-filepaths.js";
import { makeExportItems } from "./make-export-items.js";

/**
 * Generate the exports object for the package given the arguments.
 */
async function generateExports(args: Config): Promise<ExportsField> {
	const { customCondition, exclude, include, input, output, mode, replace } = parseArguments(args);

	const filepaths = await gatherFilepaths({ input, include, exclude });

	const exportItems = makeExportItems(filepaths, { input, mode, replace });

	const exports = buildPackageJsonExports(exportItems, { outputDir: output, customCondition });

	return exports;
}

export {
	//,
	generateExports,
};

export { defineConfig } from "./config.js";
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

	return {
		customCondition,
		exclude,
		include,
		input,
		mode,
		output,
		replace,
	};
}
