/**
 * Ponyfill for `Set.prototype.intersection`
 * Takes two sets A and B; and returns a new set containing elements that are in both sets A and B
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/intersection
 */
function setIntersection<T>(a: Set<T>, b: Set<T>): Set<T> {
	const result = new Set<T>();
	for (const item of b) {
		if (a.has(item)) {
			result.add(item);
		}
	}
	return result;
}

export {
	//,
	setIntersection,
};
