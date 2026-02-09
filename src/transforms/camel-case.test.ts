import { describe, expect, test } from "vitest";

import { camelCase, camelCasePath } from "./camel-case.js";

describe("camelCase", () => {
	test('given "", returns ""', () => {
		expect(camelCase("")).toBe("");
	});

	test('given whitespace, returns ""', () => {
		expect(camelCase(" \t\r\n")).toBe("");
	});

	test('given "helloWorld", returns "helloWorld"', () => {
		expect(camelCase("helloWorld")).toBe("helloWorld");
	});

	test('given "hello_world", returns "helloWorld"', () => {
		expect(camelCase("hello_world")).toBe("helloWorld");
	});

	test('given "hello-world", returns "helloWorld"', () => {
		expect(camelCase("hello-world")).toBe("helloWorld");
	});

	test('given "HelloWorld", returns "helloWorld"', () => {
		expect(camelCase("HelloWorld")).toBe("helloWorld");
	});

	test('given "hello world", returns "helloWorld"', () => {
		expect(camelCase("hello world")).toBe("helloWorld");
	});
});

describe("camelCasePath", () => {
	test('given "", returns ""', () => {
		expect(camelCasePath("")).toBe("");
	});

	test('given whitespace, returns ""', () => {
		expect(camelCasePath(" \t\r\n")).toBe("");
	});

	test('given "hello-world/hello_world/HelloWorld/helloWorld", returns "helloWorld/helloWorld/helloWorld/helloWorld"', () => {
		expect(camelCasePath("hello-world/hello_world/HelloWorld/helloWorld")).toBe(
			"helloWorld/helloWorld/helloWorld/helloWorld",
		);
	});

	test('given "src/svc/svc_athena_query/query", returns "src/svc/svcAthenaQuery/query"', () => {
		expect(camelCasePath("src/svc/svc_athena_query/query")).toBe("src/svc/svcAthenaQuery/query");
	});
});
