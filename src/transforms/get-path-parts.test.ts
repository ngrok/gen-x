import { describe, expect, test } from "vitest";

import { getPathParts } from "./get-path-parts.js";

describe("getPathParts", () => {
	test(`given "", returns []`, () => {
		expect(getPathParts("")).toEqual([]);
	});

	test(`given "hello/world", returns ["hello", "world"]`, () => {
		expect(getPathParts("hello/world")).toEqual(["hello", "world"]);
	});

	test(`given "////hello////world////", returns ["hello", "world"]`, () => {
		expect(getPathParts("////hello////world////")).toEqual(["hello", "world"]);
	});

	test(`given "/src/transforms/get-path-parts.ts", returns ["src", "transforms", "get-path-parts.ts"]`, () => {
		expect(getPathParts("/src/transforms/get-path-parts.ts")).toEqual(["src", "transforms", "get-path-parts.ts"]);
	});

	test(`given "/src/transforms/get-path-parts.ts" and options.removeExtension = true, returns ["src", "transforms", "get-path-parts"]`, () => {
		expect(getPathParts("/src/transforms/get-path-parts.ts", { removeExtension: true })).toEqual([
			"src",
			"transforms",
			"get-path-parts",
		]);
	});
});
