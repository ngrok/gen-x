export function isEmail(str: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

export function isUrl(str: string): boolean {
	try {
		new URL(str);
		return true;
	} catch {
		return false;
	}
}
