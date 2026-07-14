import { setIntersection } from "./set.js";

/**
 * RegExp literal to check if the given value is a string that may represent a regular expression.
 */
const regexPattern = /^\/(.+)\/([a-z]*)$/i;

/**
 * Predicate function to check if the given value is a string that may represent a regular expression.
 */
function isRegexString(value: unknown): boolean {
	return typeof value === "string" && regexPattern.test(value);
}

/**
 * The list of valid regular expression flags.
 */
const validRegExpFlags = ["d", "g", "i", "m", "s", "u", "v", "y"] as const;
const validRegExpFlagSet = new Set(validRegExpFlags);

/**
 * Parse the regular expression flags and return a new string with only the valid flags.
 */
function parseRegExpFlags(value: string | undefined): string | undefined {
	if (!value) {
		return undefined;
	}

	const flagSet = new Set(value.split(""));
	const validFlags = setIntersection(flagSet, validRegExpFlagSet);

	return Array.from(validFlags).join("");
}

/**
 * Parse the regular expression string and return a new RegExp object.
 */
function parseRegexString(value: string): RegExp {
	// Match the pattern and optional flags using a regular expression
	const regexParts = value.match(regexPattern);

	if (!regexParts || regexParts.length < 2) {
		throw new Error(`Invalid regular expression string given: '${value}'`);
	}

	// capture group 1 already excludes the leading and trailing delimiter slashes
	const pattern = regexParts.at(1) ?? "";
	// the optional flags like 'i', 'g', 'm', etc.
	const flags = parseRegExpFlags(regexParts.at(2));

	return new RegExp(pattern, flags);
}

export {
	//,
	isRegexString,
	parseRegExpFlags,
	parseRegexString,
	regexPattern,
};
