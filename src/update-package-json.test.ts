import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { updatePackageJson } from "./update-package-json.js";

describe("updatePackageJson", () => {
	let tmpDir: string;
	let packageJsonPath: string;

	beforeEach(async () => {
		tmpDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "gen-x-update-pkg-"));
		packageJsonPath = path.join(tmpDir, "package.json");
	});

	afterEach(async () => {
		await fsPromises.rm(tmpDir, { recursive: true, force: true });
	});

	test("preserves key order when exports already exists", async () => {
		const original = {
			name: "my-pkg",
			version: "1.0.0",
			exports: { ".": "./old.js" },
			license: "MIT",
		};
		await fsPromises.writeFile(packageJsonPath, JSON.stringify(original, null, 2) + "\n");

		await updatePackageJson({
			packageJsonPath,
			exports: { ".": "./new.js" },
		});

		const content = await fsPromises.readFile(packageJsonPath, "utf8");
		const keys = Object.keys(JSON.parse(content));
		expect(keys).toEqual(["name", "version", "exports", "license"]);
	});

	test("appends exports at the end when it does not exist", async () => {
		const original = { name: "my-pkg", version: "1.0.0" };
		await fsPromises.writeFile(packageJsonPath, JSON.stringify(original, null, 2) + "\n");

		await updatePackageJson({
			packageJsonPath,
			exports: { ".": "./index.js" },
		});

		const content = await fsPromises.readFile(packageJsonPath, "utf8");
		const pkg = JSON.parse(content);
		expect(Object.keys(pkg)).toEqual(["name", "version", "exports"]);
		expect(pkg.exports).toEqual({ ".": "./index.js" });
	});

	test("updates exports value", async () => {
		const original = { name: "my-pkg", exports: { ".": "./old.js" } };
		await fsPromises.writeFile(packageJsonPath, JSON.stringify(original, null, 2) + "\n");

		await updatePackageJson({
			packageJsonPath,
			exports: { ".": "./new.js" },
		});

		const content = await fsPromises.readFile(packageJsonPath, "utf8");
		expect(JSON.parse(content).exports).toEqual({ ".": "./new.js" });
	});

	test("preserves trailing newline", async () => {
		const original = { name: "my-pkg" };
		await fsPromises.writeFile(packageJsonPath, JSON.stringify(original, null, 2) + "\n");

		await updatePackageJson({ packageJsonPath, exports: { ".": "./index.js" } });

		const content = await fsPromises.readFile(packageJsonPath, "utf8");
		expect(content.endsWith("\n")).toBe(true);
	});

	test("does not leave temp files behind after a successful write", async () => {
		const original = { name: "my-pkg" };
		await fsPromises.writeFile(packageJsonPath, JSON.stringify(original, null, 2) + "\n");

		await updatePackageJson({ packageJsonPath, exports: { ".": "./index.js" } });

		const entries = await fsPromises.readdir(tmpDir);
		expect(entries).toEqual(["package.json"]);
	});

	// skipped on Windows: replacing a file that has concurrent open handles is
	// not atomic there, so the reader loop can flake even with a correct implementation
	test.skipIf(process.platform === "win32")(
		"concurrent readers never observe an empty or partial package.json",
		async () => {
			const original = { name: "my-pkg", version: "1.0.0" };
			await fsPromises.writeFile(packageJsonPath, JSON.stringify(original, null, 2) + "\n");

			// hammer the file with reads while updates are in flight; with a
			// truncate-then-write the reader can catch the empty window, with an
			// atomic rename it only ever sees complete old or new contents
			const state = { stop: false };
			const reader = (async () => {
				while (!state.stop) {
					const content = await fsPromises.readFile(packageJsonPath, "utf8");
					expect(content.length).toBeGreaterThan(0);
					expect(() => JSON.parse(content)).not.toThrow();
				}
			})();
			// mark an early reader failure as handled so it can't surface as an
			// unhandled rejection; the `await reader` below still rethrows it
			reader.catch(() => {});

			try {
				for (let i = 0; i < 50; i++) {
					await updatePackageJson({ packageJsonPath, exports: { ".": `./index-${i}.js` } });
				}
			} finally {
				state.stop = true;
			}
			await reader;
		},
	);

	test("dry run leaves the file untouched and writes nothing", async () => {
		const originalContent = JSON.stringify({ name: "my-pkg" }, null, 2) + "\n";
		await fsPromises.writeFile(packageJsonPath, originalContent);

		await updatePackageJson({ packageJsonPath, dryRun: true, exports: { ".": "./index.js" } });

		expect(await fsPromises.readFile(packageJsonPath, "utf8")).toBe(originalContent);
		expect(await fsPromises.readdir(tmpDir)).toEqual(["package.json"]);
	});

	test.skipIf(process.platform === "win32")("writes through a symlinked package.json", async () => {
		const realPath = path.join(tmpDir, "real-package.json");
		await fsPromises.writeFile(realPath, JSON.stringify({ name: "my-pkg" }, null, 2) + "\n");
		await fsPromises.symlink(realPath, packageJsonPath);

		await updatePackageJson({ packageJsonPath, exports: { ".": "./index.js" } });

		// the symlink is preserved and the real file received the update
		const linkStats = await fsPromises.lstat(packageJsonPath);
		expect(linkStats.isSymbolicLink()).toBe(true);
		const content = JSON.parse(await fsPromises.readFile(realPath, "utf8"));
		expect(content.exports).toEqual({ ".": "./index.js" });
	});

	test.skipIf(process.platform === "win32")("preserves the original file's permissions", async () => {
		const original = { name: "my-pkg" };
		await fsPromises.writeFile(packageJsonPath, JSON.stringify(original, null, 2) + "\n");
		await fsPromises.chmod(packageJsonPath, 0o600);

		await updatePackageJson({ packageJsonPath, exports: { ".": "./index.js" } });

		const stats = await fsPromises.stat(packageJsonPath);
		expect(stats.mode & 0o777).toBe(0o600);
	});

	test.skipIf(process.platform === "win32" || process.getuid?.() === 0)(
		"leaves the original untouched when the directory is not writable",
		async () => {
			const original = { name: "my-pkg" };
			await fsPromises.writeFile(packageJsonPath, JSON.stringify(original, null, 2) + "\n");

			// make the directory read-only so creating the temp file fails
			await fsPromises.chmod(tmpDir, 0o555);
			try {
				await expect(updatePackageJson({ packageJsonPath, exports: { ".": "./index.js" } })).rejects.toThrow();
			} finally {
				await fsPromises.chmod(tmpDir, 0o755);
			}

			// the original file is untouched and no temp files are left behind
			const entries = await fsPromises.readdir(tmpDir);
			expect(entries).toEqual(["package.json"]);
			const content = await fsPromises.readFile(packageJsonPath, "utf8");
			expect(JSON.parse(content)).toEqual(original);
		},
	);

	test("cleans up the temp file when the rename fails", async () => {
		const original = { name: "my-pkg" };
		await fsPromises.writeFile(packageJsonPath, JSON.stringify(original, null, 2) + "\n");

		// fail after the temp file has been written so the cleanup path runs
		const renameSpy = vi.spyOn(fsPromises, "rename").mockRejectedValueOnce(new Error("EACCES: rename failed"));
		try {
			await expect(updatePackageJson({ packageJsonPath, exports: { ".": "./index.js" } })).rejects.toThrow(
				"rename failed",
			);
		} finally {
			renameSpy.mockRestore();
		}

		// the temp file was cleaned up and the original file is untouched
		const entries = await fsPromises.readdir(tmpDir);
		expect(entries).toEqual(["package.json"]);
		const content = await fsPromises.readFile(packageJsonPath, "utf8");
		expect(JSON.parse(content)).toEqual(original);
	});

	test("skips the write entirely when the output is byte-identical", async () => {
		await fsPromises.writeFile(packageJsonPath, JSON.stringify({ name: "my-pkg" }, null, 2) + "\n");
		await updatePackageJson({ packageJsonPath, exports: { ".": "./index.js" } });
		const statsAfterFirstWrite = await fsPromises.stat(packageJsonPath);

		// wait long enough for a rewrite to produce a distinct mtime
		await new Promise((resolve) => setTimeout(resolve, 20));
		await updatePackageJson({ packageJsonPath, exports: { ".": "./index.js" } });

		// the second, no-op update must not touch the file (mtime unchanged)
		const statsAfterNoop = await fsPromises.stat(packageJsonPath);
		expect(statsAfterNoop.mtimeMs).toBe(statsAfterFirstWrite.mtimeMs);
	});

	test("preserves Windows CRLF trailing newline", async () => {
		await fsPromises.writeFile(packageJsonPath, '{\r\n  "name": "my-pkg"\r\n}\r\n');

		await updatePackageJson({ packageJsonPath, exports: { ".": "./index.js" } });

		const content = await fsPromises.readFile(packageJsonPath, "utf8");
		expect(content.endsWith("\r\n")).toBe(true);
	});

	test("flushes (fsyncs) the temp file to disk before the rename", async () => {
		const original = { name: "my-pkg" };
		await fsPromises.writeFile(packageJsonPath, JSON.stringify(original, null, 2) + "\n");

		// grab the FileHandle prototype so the spy sees the temp file's handle
		const probeHandle = await fsPromises.open(packageJsonPath, "r");
		const fileHandleProto = Object.getPrototypeOf(probeHandle) as { sync: () => Promise<void> };
		await probeHandle.close();

		const calls: string[] = [];
		const origSync = fileHandleProto.sync;
		const origRename = fsPromises.rename;
		vi.spyOn(fileHandleProto, "sync").mockImplementation(async function (this: unknown) {
			calls.push("sync");
			return origSync.call(this as never);
		});
		vi.spyOn(fsPromises, "rename").mockImplementation(async (...args) => {
			calls.push("rename");
			return origRename.apply(fsPromises, args);
		});
		try {
			await updatePackageJson({ packageJsonPath, exports: { ".": "./index.js" } });
		} finally {
			vi.restoreAllMocks();
		}

		// the fsync must happen, and must happen before the rename, so a crash
		// cannot persist the rename ahead of the file data
		expect(calls).toEqual(["sync", "rename"]);
	});

	test("rewrites with 2-space indentation regardless of input indentation (documented behavior)", async () => {
		await fsPromises.writeFile(packageJsonPath, '{\n\t"name": "my-pkg"\n}\n');

		await updatePackageJson({ packageJsonPath, exports: { ".": "./index.js" } });

		const content = await fsPromises.readFile(packageJsonPath, "utf8");
		expect(content).toContain('\n  "name"');
		expect(content).not.toContain("\t");
	});
});
