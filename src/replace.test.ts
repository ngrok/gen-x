import { describe, expect, test } from "vitest";

import { parseReplaceOption } from "./replace.js";

describe("parseReplaceOption", () => {
	test("given an empty string, returns an empty array", () => {
		expect(parseReplaceOption("", [])).toEqual([]);
	});

	test("given a string without the sentinel, returns an empty array", () => {
		expect(parseReplaceOption("foo", [])).toEqual([]);
	});

	test("given a string with the sentinel, returns an array with the pattern and replacement", () => {
		expect(parseReplaceOption("foo:=>bar", [])).toEqual([["foo", "bar"]]);
	});

	test("given a string with the sentinel and regex pattern, returns an array with the pattern and replacement", () => {
		expect(parseReplaceOption("/foo/:=>bar", [])).toEqual([[/foo/, "bar"]]);
	});

	test("given a string with the sentinel and invalid regex pattern, returns an array with the pattern and replacement", () => {
		expect(parseReplaceOption("/foo:=>bar", [])).toEqual([["/foo", "bar"]]);
	});

	test(`given "/_pb/:=>", returns a tuple that can be passed to String.prototype.replace to remove "_pb" from the path "src/svc/athena_query/query_pb.ts"`, () => {
		const tuples = parseReplaceOption("/_pb/:=>", []);
		const subject = "src/svc/athena_query/query_pb.ts";

		const result = tuples.reduce((acc, [pattern, replacement]) => {
			return acc.replace(pattern, replacement);
		}, subject);

		expect(result).toEqual("src/svc/athena_query/query.ts");
	});
});
