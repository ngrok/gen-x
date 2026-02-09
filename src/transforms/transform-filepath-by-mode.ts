import type { TransformMode } from "./mode.js";

import { camelCasePath } from "./camel-case.js";
import { kebabCasePath } from "./kebab-case.js";
import { pascalCasePath } from "./pascal-case.js";
import { snakeCasePath } from "./snake-case.js";

/**
 * Transform a filepath based on the given transform mode
 */
export function transformFilepathByMode(filepath: string, mode: TransformMode): string {
	switch (mode) {
		case "camelCase":
			return camelCasePath(filepath);
		case "kebab-case":
			return kebabCasePath(filepath);
		case "PascalCase":
			return pascalCasePath(filepath);
		case "snake_case":
			return snakeCasePath(filepath);
		case "passthrough":
		default:
			return filepath;
	}
}
