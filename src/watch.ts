import fs from "node:fs";
import path from "node:path";

import type { Config } from "./config.js";

import { generateExports } from "./index.js";
import { updatePackageJson } from "./update-package-json.js";

type WatchOptions = {
	config: Config;
	packageJsonPath: string;
};

async function watch({ config, packageJsonPath }: WatchOptions): Promise<void> {
	const inputDir = path.resolve(config.input?.trim() || "src");
	let previousExportsJson = "";
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

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

	const watcher = fs.watch(inputDir, { recursive: true }, () => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
		debounceTimer = setTimeout(() => {
			void regenerate();
		}, 200);
	});

	console.log(`Watching ${inputDir} for changes...`);

	process.on("SIGINT", () => {
		watcher.close();
		process.exit(0);
	});

	process.on("SIGTERM", () => {
		watcher.close();
		process.exit(0);
	});

	await new Promise(() => {});
}

export {
	//,
	watch,
};
