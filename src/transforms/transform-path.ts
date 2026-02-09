import path from "node:path";

import { getPathParts } from "./get-path-parts.js";

/**
 * Transform a path using a custom function
 */
function transformPath(filepath: string, transformPart: (part: string) => string): string {
	const extension = path.extname(filepath);
	const leadingSlash = filepath.startsWith("/") ? "/" : "";

	const parts = getPathParts(filepath, { removeExtension: true });

	const transformedParts = parts.map((part) => transformPart(part));

	const pathWithoutExtension = transformedParts.join("/");

	return `${leadingSlash}${pathWithoutExtension}${extension}`;
}

export {
	//,
	transformPath,
};
