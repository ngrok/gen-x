import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { defineConfig, loadConfig, mergeConfigs } from "./config.js";

describe("config", () => {
	let tmpDir: string;

	beforeEach(async () => {
		tmpDir = path.join(process.cwd(), ".test-config-tmp", `test-${Date.now()}`);
		await fs.mkdir(tmpDir, { recursive: true });
	});

	afterEach(async () => {
		await fs.rm(tmpDir, { recursive: true, force: true });
	});

	test("loadConfig returns null when no config exists", async () => {
		const config = await loadConfig(tmpDir);
		expect(config).toBeNull();
	});

	test("loadConfig reads gen-x.config.json", async () => {
		await fs.writeFile(
			path.join(tmpDir, "gen-x.config.json"),
			JSON.stringify({
				input: "lib",
				output: "build",
				mode: "camelCase",
			}),
		);

		const config = await loadConfig(tmpDir);
		expect(config).toEqual({
			input: "lib",
			output: "build",
			mode: "camelCase",
		});
	});

	test("loadConfig reads package.json#genx", async () => {
		await fs.writeFile(
			path.join(tmpDir, "package.json"),
			JSON.stringify({
				name: "test-pkg",
				genx: {
					input: "source",
					customCondition: "@test/source",
				},
			}),
		);

		const config = await loadConfig(tmpDir);
		expect(config).toEqual({
			input: "source",
			customCondition: "@test/source",
		});
	});

	test("gen-x.config.json takes priority over package.json#genx", async () => {
		await fs.writeFile(
			path.join(tmpDir, "gen-x.config.json"),
			JSON.stringify({
				input: "from-config",
			}),
		);

		await fs.writeFile(
			path.join(tmpDir, "package.json"),
			JSON.stringify({
				name: "test-pkg",
				genx: {
					input: "from-package",
				},
			}),
		);

		const config = await loadConfig(tmpDir);
		expect(config).toEqual({
			input: "from-config",
		});
	});

	test("mergeConfigs prioritizes CLI > file > defaults", () => {
		const defaults = {
			input: "src",
			output: "dist",
			mode: "passthrough" as const,
		};

		const fileConfig = {
			input: "lib",
			output: "build",
		};

		const cliConfig = {
			output: "out",
		};

		const result = mergeConfigs(cliConfig, fileConfig, defaults);

		expect(result).toEqual({
			input: "lib", // from fileConfig
			output: "out", // from cliConfig (highest priority)
			mode: "passthrough", // from defaults
		});
	});

	test("mergeConfigs handles null file config", () => {
		const defaults = {
			input: "src",
			output: "dist",
		};

		const cliConfig = {
			output: "build",
		};

		const result = mergeConfigs(cliConfig, null, defaults);

		expect(result).toEqual({
			input: "src", // from defaults
			output: "build", // from cliConfig
		});
	});

	test("mergeConfigs filters undefined CLI values", () => {
		const defaults = {
			input: "src",
			output: "dist",
		};

		const fileConfig = {
			input: "lib",
		};

		const cliConfig = {
			input: undefined,
			output: "build",
		};

		const result = mergeConfigs(cliConfig, fileConfig, defaults);

		expect(result).toEqual({
			input: "lib", // from fileConfig (CLI undefined is ignored)
			output: "build", // from cliConfig
		});
	});

	test("config supports replace patterns", async () => {
		await fs.writeFile(
			path.join(tmpDir, "gen-x.config.json"),
			JSON.stringify({
				replace: [["_pb", ""]],
			}),
		);

		const config = await loadConfig(tmpDir);
		expect(config).toEqual({
			replace: [["_pb", ""]],
		});
	});

	test("config supports include/exclude arrays", async () => {
		await fs.writeFile(
			path.join(tmpDir, "gen-x.config.json"),
			JSON.stringify({
				include: ["**/*.ts", "**/*.css"],
				exclude: ["**/*.test.ts", "**/*.d.ts"],
			}),
		);

		const config = await loadConfig(tmpDir);
		expect(config).toEqual({
			include: ["**/*.ts", "**/*.css"],
			exclude: ["**/*.test.ts", "**/*.d.ts"],
		});
	});

	test("defineConfig returns config as-is (type-safety helper)", () => {
		const config = defineConfig({
			input: "src",
			output: "dist",
			mode: "camelCase",
			customCondition: "@test/source",
		});

		expect(config).toEqual({
			input: "src",
			output: "dist",
			mode: "camelCase",
			customCondition: "@test/source",
		});
	});

	test("loadConfig reads gen-x.config.ts with esbuild transformation", async () => {
		// Create a TypeScript config file
		await fs.writeFile(
			path.join(tmpDir, "gen-x.config.ts"),
			`export default {
				input: "lib",
				output: "build",
				mode: "camelCase" as const,
			};`,
		);

		const config = await loadConfig(tmpDir);
		expect(config).toEqual({
			input: "lib",
			output: "build",
			mode: "camelCase",
		});
	});
});
