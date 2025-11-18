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

	// For non-compilable files, we need to preserve the full extension during transformation
	// For example: FancyButton.module.css → fancy-button.module.css (not fancy-button-module.css)
	if (!isCompilable) {
		const pathWithoutFilename = parsed.dir;
		// Extract all extensions (e.g., ".module.css" from "FancyButton.module.css")
		const firstDot = parsed.base.indexOf(".");
		const basename = firstDot === -1 ? parsed.base : parsed.base.slice(0, firstDot);
		const allExtensions = firstDot === -1 ? "" : parsed.base.slice(firstDot);

		// 3. replace the path with the replace tuples
		const replacedPath = replaceName(pathWithoutFilename, options.replace);
		// 4. transform the path and basename based on the mode
		const transformedPath = transformFilepathByMode(replacedPath, options.mode);
		const transformedBasename = transformFilepathByMode(basename, options.mode);

		const fullPath = [transformedPath, transformedBasename].filter(Boolean).join(path.sep);
		return fullPath + allExtensions;
	}

	// 1. remove the extension (only for compilable source files)
	let name = [parsed.dir, parsed.name].filter(Boolean).join(path.sep);

	// 2. flatten index files to directory path (only for compilable files)
	if (parsed.name === "index") {
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
