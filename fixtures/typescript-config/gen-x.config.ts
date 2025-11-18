import { defineConfig } from "@ngrok/gen-x";

export default defineConfig({
	input: "src",
	output: "dist",
	mode: "camelCase",
	customCondition: "@acme/typescript-config/source",
	exclude: ["**/*.test.*", "**/*.d.ts"],
});
