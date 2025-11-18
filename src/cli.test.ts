import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { loadConfig, mergeConfigs } from "./config.js";
import { generateExports } from "./index.js";
import type { ReplaceTuples } from "./replace.js";
import type { TransformMode } from "./transforms/mode.js";

describe("CLI e2e tests with fixtures", () => {
	const fixturesDir = path.join(process.cwd(), "fixtures");

	async function runGenerateExports(
		fixtureName: string,
		cliOptions: {
			customCondition?: string;
			replace?: ReplaceTuples;
			mode?: TransformMode;
		} = {},
	) {
		const fixturePath = path.join(fixturesDir, fixtureName);

		// Read the original package.json to preserve fields
		const pkgContent = await fs.readFile(path.join(fixturePath, "package.json"), "utf8");
		const originalPkg = JSON.parse(pkgContent);

		// Change directory context to match CLI behavior
		const originalCwd = process.cwd();
		process.chdir(fixturePath);

		try {
			// Load config file if present
			const fileConfig = await loadConfig(fixturePath);

			// Merge: CLI > config file > defaults
			const defaults = {
				input: "src",
				output: "dist",
			};

			const config = mergeConfigs(cliOptions, fileConfig, defaults);

			// Generate exports directly (no process spawning!)
			const exports = await generateExports({
				input: config.input,
				output: config.output,
				mode: config.mode,
				customCondition: config.customCondition,
				replace: config.replace,
				include: config.include,
				exclude: config.exclude,
			});

			// Build the result package.json (simulating what update-package-json does)
			const result = { ...originalPkg };
			delete result.exports;
			result.exports = exports;

			return { pkg: result, fixturePath };
		} finally {
			// Restore original directory
			process.chdir(originalCwd);
		}
	}

	async function readExpectedPackageJson(fixturePath: string) {
		const content = await fs.readFile(path.join(fixturePath, "package.json.expected"), "utf8");
		return JSON.parse(content);
	}

	test("basic-typescript fixture", async () => {
		const { pkg, fixturePath } = await runGenerateExports("basic-typescript");
		const expected = await readExpectedPackageJson(fixturePath);

		expect(pkg.exports).toEqual(expected.exports);
	});

	test("nested-structure fixture", async () => {
		const { pkg, fixturePath } = await runGenerateExports("nested-structure");
		const expected = await readExpectedPackageJson(fixturePath);

		expect(pkg.exports).toEqual(expected.exports);

		// Verify index files are flattened
		expect(pkg.exports).toHaveProperty(".");
		expect(pkg.exports).toHaveProperty("./lib");
		expect(pkg.exports).toHaveProperty("./lib/helpers");
	});

	test("react-components fixture", async () => {
		const { pkg, fixturePath } = await runGenerateExports("react-components");
		const expected = await readExpectedPackageJson(fixturePath);

		expect(pkg.exports).toEqual(expected.exports);

		// Verify component directories are flattened
		expect(pkg.exports).toHaveProperty("./components/Button");
		expect(pkg.exports).toHaveProperty("./components/Card");
		expect(pkg.exports).toHaveProperty("./components/Input");
	});

	test("monorepo-live-types fixture with custom condition", async () => {
		const { pkg, fixturePath } = await runGenerateExports("monorepo-live-types", {
			customCondition: "@acme/monorepo-pkg/source",
		});
		const expected = await readExpectedPackageJson(fixturePath);

		expect(pkg.exports).toEqual(expected.exports);

		// Verify custom condition is first in export entry
		const rootExport = pkg.exports["."] as Record<string, string>;
		const keys = Object.keys(rootExport);
		expect(keys[0]).toBe("@acme/monorepo-pkg/source");
		expect(rootExport["@acme/monorepo-pkg/source"]).toBe("./src/index.ts");
	});

	test("protobuf-codegen fixture with replace pattern", async () => {
		const { pkg, fixturePath } = await runGenerateExports("protobuf-codegen", {
			replace: [[/_pb/, ""]],
		});
		const expected = await readExpectedPackageJson(fixturePath);

		expect(pkg.exports).toEqual(expected.exports);

		// Verify _pb suffix is removed from export keys
		expect(pkg.exports).toHaveProperty("./proto/auth");
		expect(pkg.exports).toHaveProperty("./proto/user");
		expect(pkg.exports).not.toHaveProperty("./proto/auth_pb");
		expect(pkg.exports).not.toHaveProperty("./proto/user_pb");
	});

	test("multiple-extensions fixture", async () => {
		const { pkg, fixturePath } = await runGenerateExports("multiple-extensions");
		const expected = await readExpectedPackageJson(fixturePath);

		expect(pkg.exports).toEqual(expected.exports);

		// Verify all file extensions are handled
		expect(pkg.exports).toHaveProperty("./component"); // .tsx
		expect(pkg.exports).toHaveProperty("./jsx-component"); // .jsx
		expect(pkg.exports).toHaveProperty("./legacy"); // .js
		expect(pkg.exports).toHaveProperty("./modern"); // .mjs
		expect(pkg.exports).toHaveProperty("./commonjs"); // .cjs
	});

	test("all fixtures produce valid package.json", async () => {
		const fixtures = ["basic-typescript", "nested-structure", "react-components", "multiple-extensions"];

		for (const fixture of fixtures) {
			const { pkg } = await runGenerateExports(fixture);

			// Verify it has exports field
			expect(pkg.exports).toBeDefined();
			expect(typeof pkg.exports).toBe("object");
		}
	});

	test("POSIX paths in all fixtures (no backslashes)", async () => {
		const fixtures = ["basic-typescript", "nested-structure", "react-components"];

		for (const fixture of fixtures) {
			const { pkg } = await runGenerateExports(fixture);

			// All export keys and values should use forward slashes
			for (const [key, value] of Object.entries(pkg.exports)) {
				expect(key).not.toContain("\\");
				if (typeof value === "string") {
					expect(value).not.toContain("\\");
				} else if (typeof value === "object") {
					for (const path of Object.values(value as Record<string, string>)) {
						expect(path).not.toContain("\\");
					}
				}
			}
		}
	});

	test("preserves existing package.json fields", async () => {
		const { pkg } = await runGenerateExports("basic-typescript");

		// Original fields should be preserved
		expect(pkg.name).toBe("@acme/basic-typescript");
		expect(pkg.version).toBe("1.0.0");
		expect(pkg.description).toBe("Basic TypeScript library");
		expect(pkg.type).toBe("module");
		expect(pkg.main).toBe("./dist/index.js");
		expect(pkg.types).toBe("./dist/index.d.ts");

		// Exports should be added
		expect(pkg.exports).toBeDefined();
	});

	test("excludes test files by default", async () => {
		const { pkg } = await runGenerateExports("basic-typescript");

		// utils.test.ts should not generate an export
		expect(pkg.exports).not.toHaveProperty("./utils.test");
	});

	test("index files are flattened to directory paths", async () => {
		const { pkg } = await runGenerateExports("nested-structure");

		// index.ts → .
		expect(pkg.exports["."]).toEqual({
			import: "./dist/index.js",
			types: "./dist/index.d.ts",
		});

		// lib/index.ts → ./lib
		expect(pkg.exports["./lib"]).toEqual({
			import: "./dist/lib/index.js",
			types: "./dist/lib/index.d.ts",
		});

		// lib/helpers/index.ts → ./lib/helpers
		expect(pkg.exports["./lib/helpers"]).toEqual({
			import: "./dist/lib/helpers/index.js",
			types: "./dist/lib/helpers/index.d.ts",
		});
	});

	test("component directory-based structure", async () => {
		const { pkg } = await runGenerateExports("react-components");

		// components/Button/index.tsx → ./components/Button
		expect(pkg.exports["./components/Button"]).toEqual({
			import: "./dist/components/Button/index.js",
			types: "./dist/components/Button/index.d.ts",
		});

		// Verify index is NOT in the path
		expect(pkg.exports).not.toHaveProperty("./components/Button/index");
	});

	test("custom condition order (source first)", async () => {
		const { pkg } = await runGenerateExports("monorepo-live-types", {
			customCondition: "@acme/monorepo-pkg/source",
		});
		const rootExport = pkg.exports["."] as Record<string, string>;

		// Custom condition should be first
		const keys = Object.keys(rootExport);
		expect(keys).toEqual(["@acme/monorepo-pkg/source", "import", "types"]);
	});

	test("replace pattern removes suffix correctly", async () => {
		const { pkg } = await runGenerateExports("protobuf-codegen", {
			replace: [[/_pb/, ""]],
		});

		// File: proto/user_pb.ts → Export: ./proto/user
		const userExport = pkg.exports["./proto/user"];
		expect(userExport).toEqual({
			import: "./dist/proto/user_pb.js",
			types: "./dist/proto/user_pb.d.ts",
		});

		// Export path still references the actual file (user_pb.js)
		// But the export KEY has _pb removed
	});

	test("supports all JavaScript and TypeScript extensions", async () => {
		const { pkg } = await runGenerateExports("multiple-extensions");

		const exportKeys = Object.keys(pkg.exports);

		// Should have exports for all file types
		expect(exportKeys).toContain("."); // index.ts
		expect(exportKeys).toContain("./component"); // component.tsx
		expect(exportKeys).toContain("./jsx-component"); // jsx-component.jsx
		expect(exportKeys).toContain("./legacy"); // legacy.js
		expect(exportKeys).toContain("./modern"); // modern.mjs
		expect(exportKeys).toContain("./commonjs"); // commonjs.cjs
	});

	test("loads config from gen-x.config.ts with defineConfig", async () => {
		const fixturePath = path.join(fixturesDir, "typescript-config");

		// Verify config loads correctly
		const { loadConfig } = await import("./config.js");
		const config = await loadConfig(fixturePath);
		expect(config?.mode).toBe("camelCase");
		expect(config?.customCondition).toBe("@acme/typescript-config/source");

		// Now test generation
		const { pkg } = await runGenerateExports("typescript-config");
		const expected = await readExpectedPackageJson(fixturePath);

		expect(pkg.exports).toEqual(expected.exports);

		// Config file should apply camelCase mode
		expect(pkg.exports).toHaveProperty("./helloWorld");
		expect(pkg.exports).toHaveProperty("./fooBarBaz");

		// Custom condition from config file
		const helloExport = pkg.exports["./helloWorld"] as Record<string, string>;
		expect(helloExport["@acme/typescript-config/source"]).toBe("./src/hello-world.ts");
	});

	test("CSS files keep extension in export key", async () => {
		const { pkg, fixturePath } = await runGenerateExports("css-assets", { mode: "kebab-case" });
		const expected = await readExpectedPackageJson(fixturePath);

		expect(pkg.exports).toEqual(expected.exports);

		// CSS files should have .css extension in the export key (kebab-cased)
		expect(pkg.exports).toHaveProperty("./styles/theme.css");
		expect(pkg.exports).toHaveProperty("./styles/reset.css");
		expect(pkg.exports).toHaveProperty("./styles/fancy-button.module.css");

		// CSS exports should not have a "types" field, only "import"
		const themeExport = pkg.exports["./styles/theme.css"];
		expect(themeExport).toEqual({
			import: "./dist/styles/theme.css",
		});
		expect(themeExport).not.toHaveProperty("types");

		// Module CSS should preserve .module.css extension (not -module.css)
		const moduleExport = pkg.exports["./styles/fancy-button.module.css"];
		expect(moduleExport).toEqual({
			import: "./dist/styles/FancyButton.module.css",
		});
	});

	test("CSS files get custom condition for live types", async () => {
		const { pkg } = await runGenerateExports("css-assets", {
			customCondition: "@acme/source",
		});

		// CSS files should have custom condition pointing to source
		const themeExport = pkg.exports["./styles/theme.css"] as Record<string, string>;
		expect(themeExport).toEqual({
			"@acme/source": "./src/styles/theme.css",
			import: "./dist/styles/theme.css",
		});

		// Custom condition should be first
		const keys = Object.keys(themeExport);
		expect(keys[0]).toBe("@acme/source");

		// Still no types field for CSS
		expect(themeExport).not.toHaveProperty("types");
	});
});
