import { describe, expect, test } from "vitest";

import { transformPath } from "./transform-path.js";

describe("transformPath", () => {
	test('given "" and (value) => value, returns ""', () => {
		expect(transformPath("", (value) => value)).toBe("");
	});

	test('given "hello-world/hello-world and (value) => value, returns "hello-world/hello-world"', () => {
		expect(transformPath("hello-world/hello-world", (value) => value)).toBe("hello-world/hello-world");
	});

	test('given "/hello-world/helloWorld/hello_world" and (value) => value, returns "/hello-world/helloWorld/hello_world"', () => {
		expect(transformPath("/hello-world/helloWorld/hello_world", (value) => value)).toBe(
			"/hello-world/helloWorld/hello_world",
		);
	});

	test('given "/hello-world/helloWorld/hello_world" and (value) => value.replace(/-/g, "_"), returns "/hello_world/helloWorld/hello_world"', () => {
		expect(transformPath("/hello-world/helloWorld/hello_world", (value) => value.replace(/-/g, "_"))).toBe(
			"/hello_world/helloWorld/hello_world",
		);
	});
});
