import { glob } from "tinyglobby";

type GatherFilepathsOptions = {
	/**
	 * The input directory to search for files
	 */
	input: string;
	/**
	 * The filepath globs to include in the search
	 */
	include: Array<string>;
	/**
	 * The filepath globs to exclude from the search
	 */
	exclude: Array<string>;
};

/**
 * Return a list of absolute file paths based on the include and exclude globs and the given input directory.
 */
async function gatherFilepaths(options: GatherFilepathsOptions): Promise<Array<string>> {
	// Use single glob call with ignore for better performance
	const filepaths = await glob(options.include, {
		onlyFiles: true,
		cwd: options.input,
		absolute: true,
		ignore: options.exclude,
	});

	// alphasort the file paths
	filepaths.sort((a, b) => a.localeCompare(b));

	return filepaths;
}

export {
	//,
	gatherFilepaths,
};
