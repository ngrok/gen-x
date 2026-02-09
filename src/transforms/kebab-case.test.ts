import { describe, expect, test } from "vitest";

import { kebabCase, kebabCasePath } from "./kebab-case.js";

describe("kebabCase", () => {
	test('given "", returns ""', () => {
		expect(kebabCase("")).toBe("");
	});

	test('given whitespace, returns ""', () => {
		expect(kebabCase(" \t\r\n")).toBe("");
	});

	test('given "helloWorld", returns "hello-world"', () => {
		expect(kebabCase("helloWorld")).toBe("hello-world");
	});

	test('given "hello_world", returns "hello-world"', () => {
		expect(kebabCase("hello_world")).toBe("hello-world");
	});

	test('given "hello-world", returns "hello-world"', () => {
		expect(kebabCase("hello-world")).toBe("hello-world");
	});

	test('given "HelloWorld", returns "hello-world"', () => {
		expect(kebabCase("HelloWorld")).toBe("hello-world");
	});

	test('given "hello world", returns "hello-world"', () => {
		expect(kebabCase("hello world")).toBe("hello-world");
	});
});

describe("kebabCasePath", () => {
	test('given "", returns ""', () => {
		expect(kebabCasePath("")).toBe("");
	});

	test('given whitespace, returns ""', () => {
		expect(kebabCasePath(" \t\r\n")).toBe("");
	});

	test('given "hello-world/hello_world/HelloWorld/helloWorld", returns "hello-world/hello-world/hello-world/hello-world"', () => {
		expect(kebabCasePath("hello-world/hello_world/HelloWorld/helloWorld")).toBe(
			"hello-world/hello-world/hello-world/hello-world",
		);
	});

	test('given "src/svc/svc_athena_query/query", returns "src/svc/svc-athena-query/query"', () => {
		expect(kebabCasePath("src/svc/svc_athena_query/query")).toBe("src/svc/svc-athena-query/query");
	});
});
