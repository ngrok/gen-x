export function isEmail(str: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.slice(0, 320));
}

export function isUrl(str: string): boolean {
	try {
		// oxlint-disable-next-line
		new URL(str);
		return true;
	} catch {
		return false;
	}
}
