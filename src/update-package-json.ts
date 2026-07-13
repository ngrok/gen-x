import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import type { ExportsField } from "./build-package-json-exports.js";

type Args = {
	/**
	 * Preview changes to standard out for debugging.
	 */
	dryRun?: boolean;
	/**
	 * The exports object to write to the package.json file.
	 */
	exports: ExportsField;
	/**
	 * The path to the package.json file to write to.
	 */
	packageJsonPath: string;
};

/**
 * Update the package.json file with the new exports object.
 *
 * Set `dryRun` to `true` to preview changes to standard out for debugging,
 * else the changes will be written to the package.json file.
 */
async function updatePackageJson({ dryRun = false, exports, packageJsonPath }: Args) {
	let originalPackageJsonFile: string;
	let originalStats: Awaited<ReturnType<typeof fs.stat>>;
	let originalPackageJson: Record<string, unknown>;

	// read the package.json file (and its stats, so the atomic write below can
	// preserve the original file's permissions)
	try {
		originalPackageJsonFile = await fs.readFile(packageJsonPath, "utf8");
		originalStats = await fs.stat(packageJsonPath);
	} catch (error) {
		console.error(`Failed to read package.json at ${packageJsonPath}`);
		throw error;
	}

	// convert the package.json file to a JSON object
	try {
		originalPackageJson = JSON.parse(originalPackageJsonFile) as Record<string, unknown>;
	} catch (error) {
		console.error(`Invalid JSON in package.json at ${packageJsonPath}`);
		throw error;
	}

	// set the exports field; if it already exists the spread preserves its position,
	// otherwise it is appended at the end
	const updatedPackageJson = { ...originalPackageJson, exports };

	// don't write to disk if dry run is set, just preview the changes in stdout
	if (dryRun) {
		console.log("Dry run:");
		console.log(JSON.stringify(updatedPackageJson, null, 2));
		return;
	}

	console.log(`Writing exports to ${packageJsonPath}`);

	// stringify the updated package.json object
	let data = JSON.stringify(updatedPackageJson, null, 2);

	// preserve cross-platform EOF newline if original package.json file has one
	let eofNewline = "";
	if (originalPackageJsonFile.endsWith("\r\n")) {
		eofNewline = "\r\n"; // Windows-style newline
	} else if (originalPackageJsonFile.endsWith("\n")) {
		eofNewline = "\n"; // Unix-style newline
	}
	data += eofNewline;

	// write the updated package.json file atomically: write to a unique temp
	// file in the same directory, then rename it over package.json. A plain
	// writeFile truncates the file before writing, so a concurrent reader
	// (e.g. a bundler resolving the package mid-build) can observe an empty
	// or partial package.json. rename is atomic on the same filesystem, so
	// readers only ever see the old contents or the new contents.
	let tempPath: string | undefined;
	try {
		// resolve symlinks so the write goes through to the real file (a rename
		// onto the symlink's own path would replace the link instead) and so the
		// temp file lands on the same filesystem, keeping the rename atomic
		const realPath = await fs.realpath(packageJsonPath);
		tempPath = path.join(
			path.dirname(realPath),
			`.${path.basename(realPath)}.${crypto.randomBytes(8).toString("hex")}.tmp`,
		);

		const tempFile = await fs.open(tempPath, "w");
		try {
			await tempFile.writeFile(data, "utf8");
			// preserve the original file's permissions; a fresh temp file would
			// otherwise reset them to the process default (0o666 & ~umask)
			await tempFile.chmod(originalStats.mode);
			// flush to disk before the rename so a crash can't persist the rename
			// ahead of the file data, which would leave an empty package.json
			await tempFile.sync();
		} finally {
			await tempFile.close();
		}
		await fs.rename(tempPath, realPath);
	} catch (error) {
		// best-effort cleanup of the temp file; ignore cleanup failures so the
		// original write error is the one that surfaces
		if (tempPath) {
			await fs.rm(tempPath, { force: true }).catch(() => {});
		}
		console.error(`Failed to write package.json at ${packageJsonPath}`);
		throw error;
	}
}

export {
	//,
	updatePackageJson,
};
