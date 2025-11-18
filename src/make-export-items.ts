import path from "node:path";
import type { ReplaceTuples } from "./replace.js";
import type { TransformMode } from "./transforms/mode.js";
import { transformFilepathByMode } from "./transforms/transform-filepath-by-mode.js";

export type ExportItem = {
	/**
	 * The name of the export, may be transformed by the mode and replaced by the replace tuples
	 */
	name: string;
	/**
	 * The export's path, relative to the containing directory, sans the file extension
	 */
	path: string;
	/**
	 * The export's source directory
	 */
	srcDir: string;
};

type Options = {
	/**
	 * The input directory to gather file paths from.
	 */
	input: string;
	/**
	 * The mode to transform filepath segments.
	 */
	mode: TransformMode;
	/**
	 * An optional list of replace tuples to rename export names.
	 */
	replace?: ReplaceTuples;
};

/**
 * Given a list of file paths and options, return a list of export items.
 *
 * When building the name, the order of operations is:
 * 1. Take the file path and remove the extension
 * 2. Replace the name with the replace tuples
 * 3. Transform the name based on the mode
 */
function makeExportItems(filepaths: Array<string>, options: Options): Array<ExportItem> {
	// srcDir should be project-relative for package.json, not absolute
	const srcDir = path.relative(process.cwd(), options.input) || ".";

	return filepaths.map((filepath) => {
		const exportPath = path.relative(options.input, filepath);
		const name = makeNameFromFilepath(exportPath, options);

		return {
			name,
			path: exportPath,
			srcDir,
		};
	});
}

export {
	//,
	makeExportItems,
};

/**
 * Extensions for compilable source files that should be stripped from export keys.
 * Non-compilable files (CSS, JSON, etc) keep their extensions.
 */
const COMPILABLE_EXTENSIONS = new Set([
	//,
	".ts",
	".tsx",
	".cts",
	".mts",
	".js",
	".jsx",
	".mjs",
	".cjs",
]);

/**
 * Given a file path and options, return the name of the export.
 * The order of operations is:
 *  1. Take the file path and remove the extension (only for compilable files)
 *  2. If the filename is "index", flatten to the directory path
 *  3. Replace the name with the replace tuples
 *  4. Transform the name based on the mode
 */
function makeNameFromFilepath(filepath: string, options: Options): string {
	const parsed = path.parse(filepath);
	const isCompilable = COMPILABLE_EXTENSIONS.has(parsed.ext);

	// 1. remove the extension (only for compilable source files)
	let name = isCompilable
		? [parsed.dir, parsed.name].filter(Boolean).join(path.sep)
		: [parsed.dir, parsed.base].filter(Boolean).join(path.sep); // Keep full filename for assets

	// 2. flatten index files to directory path (only for compilable files)
	if (isCompilable && parsed.name === "index") {
		name = parsed.dir || ".";
	}
	// 3. replace the name with the replace tuples
	const replacedName = replaceName(name, options.replace);
	// 4. transform the name based on the mode
	const transformedName = transformFilepathByMode(replacedName, options.mode);

	return transformedName;
}

/**
 * Given a value and a list of replace tuples, return the value with the replacements applied.
 */
function replaceName(value: string, replaceTuples: ReplaceTuples = []): string {
	return replaceTuples.reduce((acc, [pattern, replacement]) => {
		return acc.replace(pattern, replacement);
	}, value);
}
