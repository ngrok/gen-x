import { describe, expect, test } from "vitest";

import { snakeCase, snakeCasePath } from "./snake-case.js";

describe("snakeCase", () => {
	test('given "", returns ""', () => {
		expect(snakeCase("")).toBe("");
	});

	test('given whitespace, returns ""', () => {
		expect(snakeCase(" \t\r\n")).toBe("");
	});

	test('given "helloWorld", returns "hello_world"', () => {
		expect(snakeCase("helloWorld")).toBe("hello_world");
	});

	test('given "hello_world", returns "hello_world"', () => {
		expect(snakeCase("hello_world")).toBe("hello_world");
	});

	test('given "hello-world", returns "hello_world"', () => {
		expect(snakeCase("hello-world")).toBe("hello_world");
	});

	test('given "HelloWorld", returns "hello_world"', () => {
		expect(snakeCase("HelloWorld")).toBe("hello_world");
	});

	test('given "hello world", returns "hello_world"', () => {
		expect(snakeCase("hello world")).toBe("hello_world");
	});
});

describe("snakeCasePath", () => {
	test('given "", returns ""', () => {
		expect(snakeCasePath("")).toBe("");
	});

	test('given whitespace, returns ""', () => {
		expect(snakeCasePath(" \t\r\n")).toBe("");
	});

	test('given "hello-world/hello_world/HelloWorld/helloWorld", returns "hello_world/hello_world/hello_world/hello_world"', () => {
		expect(snakeCasePath("hello-world/hello_world/HelloWorld/helloWorld")).toBe(
			"hello_world/hello_world/hello_world/hello_world",
		);
	});

	test('given "src/svc/svc_athena_query/query", returns "src/svc/svc_athena_query/query"', () => {
		expect(snakeCasePath("src/svc/svc_athena_query/query")).toBe("src/svc/svc_athena_query/query");
	});
});
