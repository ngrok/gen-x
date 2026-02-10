import fs from "node:fs";
import path from "node:path";

import type { Config } from "./config.js";

import { generateExports } from "./index.js";
import { updatePackageJson } from "./update-package-json.js";

type WatchOptions = {
	/**
	 * The resolved gen-x configuration. Loaded once at startup to avoid
	 * repeated esbuild transforms on every file change.
	 */
	config: Config;
	/**
	 * The path to the package.json file to write exports to.
	 */
	packageJsonPath: string;
};

type WatchHandle = {
	/**
	 * Stop watching and clean up the file watcher.
	 */
	close: () => void;
};

/**
 * Start watching the input directory for file changes and regenerate
 * package.json#exports automatically. Runs an initial generation, then
 * watches for subsequent changes.
 *
 * Returns a handle that can be used to stop the watcher.
 */
async function startWatch({ config, packageJsonPath }: WatchOptions): Promise<WatchHandle> {
	const inputDir = path.resolve(config.input?.trim() || "src");
	let previousExportsJson = "";
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Re-run the exports pipeline and write to package.json.
	 * Skips the write if the exports object is unchanged from the previous run.
	 */
	async function regenerate() {
		try {
			const exports = await generateExports(config);
			const exportsJson = JSON.stringify(exports);

			if (exportsJson === previousExportsJson) {
				return;
			}

			previousExportsJson = exportsJson;

			await updatePackageJson({
				dryRun: false,
				exports,
				packageJsonPath,
			});
		} catch (error) {
			console.error("gen-x watch error:", error);
		}
	}

	await regenerate();

	// Recursively watch the input directory for any filesystem events (add, delete, rename).
	// Events are debounced to 200ms to batch rapid changes (e.g., renames emit multiple events).
	const watcher = fs.watch(inputDir, { recursive: true }, () => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
		debounceTimer = setTimeout(() => {
			void regenerate();
		}, 200);
	});

	console.log(`Watching ${inputDir} for changes...`);

	return {
		close() {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
			watcher.close();
		},
	};
}

/**
 * Watch the input directory for file changes and regenerate package.json#exports
 * automatically. Runs an initial generation, then blocks indefinitely until the
 * process is terminated via SIGINT or SIGTERM.
 */
async function watch(options: WatchOptions): Promise<void> {
	const handle = await startWatch(options);

	// Close the watcher on process termination to release the file handle cleanly.
	process.on("SIGINT", () => {
		handle.close();
		process.exit(0);
	});

	process.on("SIGTERM", () => {
		handle.close();
		process.exit(0);
	});

	// Block forever so the process stays alive while fs.watch runs.
	// Signal handlers above ensure clean shutdown on SIGINT/SIGTERM.
	await new Promise<never>(() => {});
}

export {
	//,
	startWatch,
	watch,
};

export type {
	//,
	WatchHandle,
	WatchOptions,
};
