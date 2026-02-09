import { describe, expect, test } from "vitest";

import { extractWords } from "./extract-words.js";

describe("extractWords", () => {
	test('given "", returns []', () => {
		expect(extractWords("")).toEqual([]);
	});

	test("given ` \t\r\n`, returns []", () => {
		expect(extractWords(" \t\r\n")).toEqual([]);
	});

	test('given "helloWorld", returns ["hello", "World"]', () => {
		expect(extractWords("helloWorld")).toEqual(["hello", "World"]);
	});

	test('given "hello_world", returns ["hello", "world"]', () => {
		expect(extractWords("hello_world")).toEqual(["hello", "world"]);
	});

	test('given "hello-world", returns ["hello", "world"]', () => {
		expect(extractWords("hello-world")).toEqual(["hello", "world"]);
	});

	test('given "HelloWorld", returns ["Hello", "World"]', () => {
		expect(extractWords("HelloWorld")).toEqual(["Hello", "World"]);
	});

	test("given the first 5 lines of the bee movie script, returns the expected words", () => {
		const value = `According to all known laws of aviation,
		there is no way a bee should be able to fly.
		Its wings are too small to get its fat little body off the ground.
		The bee, of course, flies anyway
		because bees don't care what humans think is impossible.`;

		const expected = [
			"According",
			"to",
			"all",
			"known",
			"laws",
			"of",
			"aviation",
			"there",
			"is",
			"no",
			"way",
			"a",
			"bee",
			"should",
			"be",
			"able",
			"to",
			"fly",
			"Its",
			"wings",
			"are",
			"too",
			"small",
			"to",
			"get",
			"its",
			"fat",
			"little",
			"body",
			"off",
			"the",
			"ground",
			"The",
			"bee",
			"of",
			"course",
			"flies",
			"anyway",
			"because",
			"bees",
			"don't",
			"care",
			"what",
			"humans",
			"think",
			"is",
			"impossible",
		];

		expect(extractWords(value)).toEqual(expected);
	});
});
