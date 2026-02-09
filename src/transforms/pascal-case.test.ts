import { describe, expect, test } from "vitest";

import { pascalCase, pascalCasePath } from "./pascal-case.js";

describe("pascalCase", () => {
	test('given "", returns ""', () => {
		expect(pascalCase("")).toBe("");
	});

	test('given whitespace, returns ""', () => {
		expect(pascalCase(" \t\r\n")).toBe("");
	});

	test('given "helloWorld", returns "HelloWorld"', () => {
		expect(pascalCase("helloWorld")).toBe("HelloWorld");
	});

	test('given "hello_world", returns "HelloWorld"', () => {
		expect(pascalCase("hello_world")).toBe("HelloWorld");
	});

	test('given "hello-world", returns "HelloWorld"', () => {
		expect(pascalCase("hello-world")).toBe("HelloWorld");
	});

	test('given "HelloWorld", returns "HelloWorld"', () => {
		expect(pascalCase("HelloWorld")).toBe("HelloWorld");
	});

	test('given "hello world", returns "HelloWorld"', () => {
		expect(pascalCase("hello world")).toBe("HelloWorld");
	});
});

describe("pascalCasePath", () => {
	test('given "", returns ""', () => {
		expect(pascalCasePath("")).toBe("");
	});

	test('given whitespace, returns ""', () => {
		expect(pascalCasePath(" \t\r\n")).toBe("");
	});

	test('given "hello-world/hello_world/HelloWorld/helloWorld", returns "HelloWorld/HelloWorld/HelloWorld/HelloWorld"', () => {
		expect(pascalCasePath("hello-world/hello_world/HelloWorld/helloWorld")).toBe(
			"HelloWorld/HelloWorld/HelloWorld/HelloWorld",
		);
	});

	test('given "src/svc/svc_athena_query/query", returns "Src/Svc/SvcAthenaQuery/Query"', () => {
		expect(pascalCasePath("src/svc/svc_athena_query/query")).toBe("Src/Svc/SvcAthenaQuery/Query");
	});
});
