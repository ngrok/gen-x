#!/usr/bin/env node
import { Command, Option } from "commander";
import { generateExports } from "./index.js";
import { packageName, packageVersion } from "./meta.js";
import { parseGlobOption } from "./parse-glob-option.js";
import { parseReplaceOption, replaceSentinel, type ReplaceTuples } from "./replace.js";
import { transformMode, transformModes } from "./transforms/mode.js";
import { updatePackageJson } from "./update-package-json.js";

const defaultReplaceValue: ReplaceTuples = [];

const program = new Command()
	.name(packageName)
	.version(packageVersion)
	.option("--dry-run, --dryRun", "Preview changes to standard out for debugging.", false)
	.option("--exclude <exclude...>", "A list of globs to exclude file paths from.", ["**/*.test.*"])
	.option("--include <include...>", "A list of globs to include file paths from.", ["**/*"])
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
		`-r, --replace <<pattern${replaceSentinel}replacement>...>`,
		"Replace export keys, a way to rename exports. Like String.prototype.replace, the pattern is a string or regex, and the replacement is a string. If you want to use a regex pattern, you must use the format /pattern/.",
		parseReplaceOption,
		defaultReplaceValue,
	);

async function cli() {
	const command = program.parse(process.argv);
	const options = command.opts();

	const dryRun = Boolean(options.dryRun);
	const exclude = parseGlobOption(options.exclude);
	const include = parseGlobOption(options.include);
	const input = options.input.trim() || `${process.cwd()}/src`;
	const mode = options.mode ?? "passthrough";
	const output = options.output.trim() || `${process.cwd()}/dist`;
	const packageJsonPath = options.package.trim() || `${process.cwd()}/package.json`;
	const replace = options.replace || [];
	const customCondition = options.customCondition?.trim() || null;

	const exports = await generateExports({
		customCondition,
		exclude,
		include,
		input,
		mode,
		output,
		replace,
	});

	await updatePackageJson({
		dryRun,
		exports,
		packageJsonPath,
	});
}

void (await cli());
