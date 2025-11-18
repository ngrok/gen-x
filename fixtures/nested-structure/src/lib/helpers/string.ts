export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, maxLen: number): string {
	return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
}
