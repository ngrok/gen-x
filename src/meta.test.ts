import { describe, expect, test } from "vitest";
import packageJson from "../package.json" assert { type: "json" };
import { packageName, packageVersion } from "./meta.js";

describe("meta", () => {
	test("packageName === package.json#name", () => {
		expect(packageName).toEqual(packageJson.name);
	});

	test("packageVersion === package.json#version", () => {
		expect(packageVersion).toEqual(packageJson.version);
	});
});
