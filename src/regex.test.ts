import { describe, expect, test } from "vitest";

import { parseRegexString } from "./regex.js";

describe("parseRegexString", () => {
	test(`given "", throws`, () => {
		expect(() => parseRegexString("")).toThrow();
	});

	test(`given "/foo/", returns /foo/`, () => {
		expect(parseRegexString("/foo/")).toEqual(/foo/);
	});

	test(`given "/foo/i", returns /foo/i`, () => {
		expect(parseRegexString("/foo/i")).toEqual(/foo/i);
	});
});
