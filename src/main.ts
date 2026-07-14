import { Command, Option } from "commander";

import pkg from "../package.json" with { type: "json" };
import type { Config } from "./config.js";
import { generateExports } from "./index.js";
import { parseGlobOption } from "./parse-glob-option.js";
import { parseReplaceOption, replaceSentinel, type ReplaceTuples } from "./replace.js";
import { transformMode, transformModes } from "./transforms/mode.js";
import { updatePackageJson } from "./update-package-json.js";
import { watch } from "./watch.js";

const packageName = pkg.name;
const packageVersion = pkg.version;

const defaultReplaceValue: ReplaceTuples = [];

const program = new Command()
	.name(packageName)
	.version(packageVersion)
	.option("--dry-run, --dryRun", "Preview changes to standard out for debugging.", false)
	.option("-w, --watch", "Watch the input directory for changes and regenerate exports.", false)
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

	// commander applies the option defaults declared above, so the options are
	// already fully resolved; CLI flags are the only configuration source
	const config: Config = {
		input: options.input?.trim() || "src",
		output: options.output?.trim() || "dist",
		exclude: parseGlobOption(options.exclude),
		include: parseGlobOption(options.include),
		mode: options.mode,
		replace: options.replace,
		customCondition: options.customCondition?.trim() || null,
		sourceOnly: options.sourceOnly,
	};

	const packageJsonPath = options.package?.trim() || "package.json";

	// Watch mode: run an initial generation, then watch for file changes indefinitely.
	if (options.watch && options.dryRun) {
		console.error("Error: --dry-run is not supported in --watch mode. Remove --dry-run or disable --watch.");
		process.exitCode = 1;
		return;
	}

	if (options.watch) {
		await watch({ config, packageJsonPath });
		return;
	}

	// One-shot mode: generate exports and write (or preview with --dry-run).
	const exports = await generateExports(config, packageJsonPath);
	await updatePackageJson({ dryRun: Boolean(options.dryRun), exports, packageJsonPath });
}

void (await cli());
