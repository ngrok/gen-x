import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

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
});
