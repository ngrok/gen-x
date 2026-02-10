import fs from "node:fs";
import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { startWatch, type WatchHandle } from "./watch.js";

function waitForFileChange(filePath: string, expected: (pkg: Record<string, unknown>) => boolean): Promise<void> {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			watcher.close();
			reject(new Error("Timed out waiting for package.json to update"));
		}, 5_000);

		const watcher = fs.watch(filePath, async () => {
			try {
				const content = await fsPromises.readFile(filePath, "utf8");
				const pkg = JSON.parse(content) as Record<string, unknown>;
				if (expected(pkg)) {
					clearTimeout(timeout);
					watcher.close();
					resolve();
				}
			} catch {
				// file may be mid-write, ignore and wait for next event
			}
		});
	});
}

describe("watch mode", () => {
	let tmpDir: string;
	let srcDir: string;
	let packageJsonPath: string;
	let handle: WatchHandle | null = null;

	beforeEach(async () => {
		tmpDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "gen-x-watch-"));
		srcDir = path.join(tmpDir, "src");
		packageJsonPath = path.join(tmpDir, "package.json");

		await fsPromises.mkdir(srcDir, { recursive: true });
		await fsPromises.writeFile(path.join(srcDir, "index.ts"), "export const x = 1;");
		await fsPromises.writeFile(packageJsonPath, JSON.stringify({ name: "test-pkg", version: "1.0.0" }, null, 2) + "\n");
	});

	afterEach(async () => {
		handle?.close();
		handle = null;
		await fsPromises.rm(tmpDir, { recursive: true, force: true });
	});

	test("initial run generates exports", async () => {
		handle = await startWatch({
			config: { input: srcDir },
			packageJsonPath,
		});

		const content = await fsPromises.readFile(packageJsonPath, "utf8");
		const pkg = JSON.parse(content);

		expect(pkg.exports).toEqual({
			"./package.json": "./package.json",
			".": {
				import: "./dist/index.js",
				types: "./dist/index.d.ts",
			},
		});
	});

	test("regenerates exports when a file is added", async () => {
		handle = await startWatch({
			config: { input: srcDir },
			packageJsonPath,
		});

		const waiting = waitForFileChange(packageJsonPath, (pkg) => {
			const exports = pkg.exports as Record<string, unknown> | undefined;
			return exports != null && "./utils" in exports;
		});

		await fsPromises.writeFile(path.join(srcDir, "utils.ts"), "export const y = 2;");

		await waiting;

		const content = await fsPromises.readFile(packageJsonPath, "utf8");
		const pkg = JSON.parse(content);

		expect(pkg.exports).toEqual({
			"./package.json": "./package.json",
			".": {
				import: "./dist/index.js",
				types: "./dist/index.d.ts",
			},
			"./utils": {
				import: "./dist/utils.js",
				types: "./dist/utils.d.ts",
			},
		});
	});

	test("regenerates exports when a file is deleted", async () => {
		await fsPromises.writeFile(path.join(srcDir, "utils.ts"), "export const y = 2;");

		handle = await startWatch({
			config: { input: srcDir },
			packageJsonPath,
		});

		// Verify utils is in initial exports
		let content = await fsPromises.readFile(packageJsonPath, "utf8");
		let pkg = JSON.parse(content);
		expect(pkg.exports).toHaveProperty("./utils");

		const waiting = waitForFileChange(packageJsonPath, (pkg) => {
			const exports = pkg.exports as Record<string, unknown> | undefined;
			return exports != null && !("./utils" in exports);
		});

		await fsPromises.unlink(path.join(srcDir, "utils.ts"));

		await waiting;

		content = await fsPromises.readFile(packageJsonPath, "utf8");
		pkg = JSON.parse(content);

		expect(pkg.exports).toEqual({
			"./package.json": "./package.json",
			".": {
				import: "./dist/index.js",
				types: "./dist/index.d.ts",
			},
		});
	});

	test("skips write when exports are unchanged", async () => {
		handle = await startWatch({
			config: { input: srcDir },
			packageJsonPath,
		});

		const { mtimeMs: initialMtime } = await fsPromises.stat(packageJsonPath);

		// Modify file content (not structure) — should not trigger a write
		await fsPromises.writeFile(path.join(srcDir, "index.ts"), "export const x = 999;");

		// Wait longer than debounce + regeneration
		await new Promise((resolve) => setTimeout(resolve, 500));

		const { mtimeMs: afterMtime } = await fsPromises.stat(packageJsonPath);
		expect(afterMtime).toBe(initialMtime);
	});
});
