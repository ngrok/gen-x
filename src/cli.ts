#!/usr/bin/env node
import { Command, Option } from "commander";

import pkg from "../package.json" with { type: "json" };
import { loadConfig, mergeConfigs } from "./config.js";
import { generateExports } from "./index.js";
import { parseGlobOption } from "./parse-glob-option.js";
import { parseReplaceOption, replaceSentinel, type ReplaceTuples } from "./replace.js";
import { transformMode, transformModes } from "./transforms/mode.js";
import { updatePackageJson } from "./update-package-json.js";

const packageName = pkg.name;
const packageVersion = pkg.version;

const defaultReplaceValue: ReplaceTuples = [];

const program = new Command()
	.name(packageName)
	.version(packageVersion)
	.option("--dry-run, --dryRun", "Preview changes to standard out for debugging.", false)
	.option("--exclude <exclude...>", "A list of globs to exclude file paths from.", [
		"**/*.d.ts",
		"**/*.test.*",
		"**/*.spec.*",
		"**/__tests__/**",
	])
	.option("--include <include...>", "A list of globs to include file paths from.", [
		"**/*.{ts,tsx,cts,mts,js,jsx,mjs,cjs,css}",
	])
	.option("-i, --input <input>", "The input directory to gather file paths from.", "src")
	.addOption(
		new Option("-m, --mode <mode>", "The mode to transform filepath segments.")
			.choices(transformModes)
			.default(transformMode("passthrough")),
	)
	.option(
		"--customCondition <customCondition>",
		'Add a unique custom condition to the package.json exports for supporting live types in a monorepo, e.g. "@my-package/source". Will map the custom condition to the source TypeScript file path.',
	)
	.option("-o, --output <output>", "The output directory for the package export files", "dist")
	.option("-p, --package <package>", "The path to the package.json file to read from and write to.", "package.json")
	.option(
		"--sourceOnly",
		"Only emit plain source file paths in exports (no import/types/custom condition pointing to dist/).",
		false,
	)
	.option(
		`-r, --replace <<pattern${replaceSentinel}replacement>...>`,
		"Replace export keys, a way to rename exports. Like String.prototype.replace, the pattern is a string or regex, and the replacement is a string. If you want to use a regex pattern, you must use the format /pattern/.",
		parseReplaceOption,
		defaultReplaceValue,
	);

async function cli() {
	const command = program.parse(process.argv);
	const options = command.opts();

	// Load config file
	const fileConfig = await loadConfig(process.cwd());

	// Merge: CLI > config file > defaults
	const defaults = {
		input: "src",
		output: "dist",
		package: "package.json",
		exclude: ["**/*.d.ts", "**/*.test.*", "**/*.spec.*", "**/__tests__/**"],
		include: ["**/*.{ts,tsx,cts,mts,js,jsx,mjs,cjs,css}"],
		mode: "passthrough" as const,
		replace: [] as ReplaceTuples,
		customCondition: null as string | null,
		sourceOnly: false,
	};

	const config = mergeConfigs(
		{
			input: options.input?.trim(),
			output: options.output?.trim(),
			exclude: options.exclude ? parseGlobOption(options.exclude) : undefined,
			include: options.include ? parseGlobOption(options.include) : undefined,
			mode: options.mode,
			replace: options.replace,
			customCondition: options.customCondition?.trim(),
			sourceOnly: options.sourceOnly,
		},
		fileConfig,
		defaults,
	);

	const dryRun = Boolean(options.dryRun);
	const packageJsonPath = options.package?.trim() || "package.json";

	const exports = await generateExports({
		customCondition: config.customCondition,
		exclude: config.exclude,
		include: config.include,
		input: config.input,
		mode: config.mode,
		output: config.output,
		replace: config.replace,
		sourceOnly: config.sourceOnly,
	});

	await updatePackageJson({
		dryRun,
		exports,
		packageJsonPath,
	});
}

void (await cli());
