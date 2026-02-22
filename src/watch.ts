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
	/**
	 * An AbortSignal to stop watching and clean up the file watcher.
	 * Similar to a React useEffect cleanup function.
	 */
	signal?: AbortSignal;
};

/**
 * Start watching the input directory for file changes and regenerate
 * package.json#exports automatically. Runs an initial generation, then
 * watches for subsequent changes.
 *
 * Pass an AbortSignal to stop watching. The signal is forwarded to
 * `fs.watch`, which closes the watcher when aborted.
 */
async function startWatch({ config, packageJsonPath, signal }: WatchOptions): Promise<void> {
	const inputDir = path.resolve(config.input?.trim() || "src");
	let previousExportsJson = "";
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let running = false;
	let pending = false;

	/**
	 * Re-run the exports pipeline and write to package.json.
	 * Skips the write if the exports object is unchanged from the previous run.
	 * Guarded so only one regeneration runs at a time; if a change arrives
	 * while one is in-flight, exactly one follow-up run is scheduled.
	 */
	async function regenerate() {
		if (running) {
			pending = true;
			return;
		}

		running = true;
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
		} finally {
			running = false;
			if (pending) {
				pending = false;
				void regenerate();
			}
		}
	}

	await regenerate();

	// Recursively watch the input directory for any filesystem events (add, delete, rename).
	// Events are debounced to 200ms to batch rapid changes (e.g., renames emit multiple events).
	// The AbortSignal is forwarded to fs.watch, which closes the watcher when aborted.
	fs.watch(inputDir, { recursive: true, signal }, () => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
		debounceTimer = setTimeout(() => {
			void regenerate();
		}, 200);
	});

	console.log(`Watching ${inputDir} for changes...`);
}

/**
 * Watch the input directory for file changes and regenerate package.json#exports
 * automatically. Runs an initial generation, then blocks indefinitely until the
 * process is terminated via SIGINT or SIGTERM.
 */
async function watch(options: Omit<WatchOptions, "signal">): Promise<void> {
	const abortController = new AbortController();

	// Close the watcher on process termination to release the file handle cleanly.
	process.on("SIGINT", () => {
		abortController.abort();
		process.exit(0);
	});

	process.on("SIGTERM", () => {
		abortController.abort();
		process.exit(0);
	});

	await startWatch({ ...options, signal: abortController.signal });

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
	WatchOptions,
};
