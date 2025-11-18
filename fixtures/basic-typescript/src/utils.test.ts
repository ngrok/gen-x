import { expect, test } from "vitest";
import { formatDate, parseDate } from "./utils.js";

test("formatDate", () => {
	const date = new Date("2024-01-01");
	expect(formatDate(date)).toBe("2024-01-01T00:00:00.000Z");
});
