import { extractWords } from "./extract-words.js";
import { transformPath } from "./transform-path.js";

/**
 * Convert a string to camelCase
 *
 * @note
 * This isn't fully generic/bullet proof, but it works for our use case atm
 *
 * @example
 * ```ts
 * camelCase("hello_world") // #=> helloWorld
 * camelCase("hello-world") // #=> helloWorld
 * camelCase("hello world") // #=> helloWorld
 * camelCase("helloWorld") // #=> helloWorld
 * camelCase("HelloWorld") // #=> helloWorld
 * ```
 */
function camelCase(value: string): string {
	const words = extractWords(value).map((word) => word.toLocaleLowerCase());
	return words.map((word, index) => (index === 0 ? word : capitalizeFirstChar(word))).join("");
}

/**
 * Convert a path to camelCase
 *
 * @example
 * ```ts
 * camelCasePath("hello_world/helloWorld/hello-world") // #=> helloWorld/helloWorld/helloWorld
 * ```
 */
function camelCasePath(filepath: string): string {
	return transformPath(filepath, camelCase);
}

export {
	//,
	camelCase,
	camelCasePath,
};

/**
 * Capitalize the first character of a string
 */
function capitalizeFirstChar(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
