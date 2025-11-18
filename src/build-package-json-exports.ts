import path from "node:path";
import type { ExportItem } from "./make-export-items.js";

export type ExportEntry = string | ({ import: string; types: string } & Record<string, string>);
export type ExportsField = Record<string, ExportEntry>;

type Options = {
	/**
	 * Custom condition to add to the package.json exports for supporting live types in a monorepo
	 */
	customCondition?: string | null;
	/**
	 * The output directory for the package export files
	 * @default `dist`
	 */
	outputDir?: string;
};

/**
 * Given the list of filepaths and an optional outputDir, return a new object package.json#exports object
 */
function buildPackageJsonExports(exportItems: Array<ExportItem>, options?: Options): ExportsField {
	const outputDir = options?.outputDir?.trim() || "dist";
	const customCondition = options?.customCondition?.trim();

	// Track export keys to detect collisions
	const exportKeyMap = new Map<string, string>();

	return exportItems.reduce<ExportsField>(
		(acc, item) => {
			const parsed = path.posix.parse(toPosix(item.path));
			// Handle root export: if item.name is ".", use "." directly
			const name = item.name === "." ? "." : [".", item.name].filter(Boolean).join("/");

			// Determine if this is a compilable source file or an asset
			const isAsset =
				parsed.ext && ![".ts", ".tsx", ".cts", ".mts", ".js", ".jsx", ".mjs", ".cjs"].includes(parsed.ext);

			// For assets (CSS, etc), keep the extension in the output path
			const exportPath = isAsset
				? [".", toPosix(outputDir), parsed.dir, parsed.base].filter(Boolean).join("/")
				: [".", toPosix(outputDir), parsed.dir, parsed.name].filter(Boolean).join("/");

			// Build sourcePath: if srcDir is ".", don't duplicate it
			const sourcePath =
				toPosix(item.srcDir) === "."
					? [".", toPosix(item.path)].filter(Boolean).join("/")
					: [".", toPosix(item.srcDir), toPosix(item.path)].filter(Boolean).join("/");

			// Detect collision
			if (exportKeyMap.has(name)) {
				const existingFile = exportKeyMap.get(name);
				throw new Error(
					`Export key collision detected: "${name}"\n` +
						`  Existing file: ${existingFile}\n` +
						`  Conflicting file: ${sourcePath}\n` +
						`Check your replace/mode rules to avoid duplicate export keys.`,
				);
			}
			exportKeyMap.set(name, sourcePath);

			// Build export entry
			// For compilable sources: add import, types
			// For assets (CSS, etc): only add import (and optional custom condition)
			const entry = isAsset
				? {
						...(customCondition ? { [customCondition]: sourcePath } : {}),
						import: exportPath,
					}
				: {
						...(customCondition ? { [customCondition]: sourcePath } : {}),
						import: `${exportPath}.js`,
						types: `${exportPath}.d.ts`,
					};

			acc[name] = entry as ExportEntry;

			return acc;
		},
		// base exports for the package.json
		{
			"./package.json": "./package.json",
		} as const satisfies ExportsField,
	);
}

export {
	//,
	buildPackageJsonExports,
};

/**
 * Convert Windows-style paths to POSIX-style for package.json exports
 */
const toPosix = (input: string): string => input.replaceAll("\\", "/");
