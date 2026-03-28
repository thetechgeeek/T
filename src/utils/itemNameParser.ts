/**
 * Extracts the base item number from a tile design name.
 * Examples:
 *   "10526-HL-1-A" -> "10526"
 *   "10526-D"      -> "10526"
 *   "10526-L"      -> "10526"
 *   "10526-F"      -> "10526"
 *   "10526-ELE"    -> "10526"
 *   "BRAND-10526"  -> "10526"  (handles brand prefixes)
 *   "10526"        -> "10526"
 */
export function extractBaseItemNumber(designName: string): string {
	if (!designName) return '';

	// Strip known suffixes: -D, -L, -F, -HL, -HL-N, -HL-N-X, -ELE, -ELEVATION
	// Then extract the first contiguous numeric block of 4+ digits
	const suffixPattern = /(-(?:HL(?:-\d+(?:-[A-Z])?)?|ELE(?:VATION)?|[DLFABCM]\d*)).*$/i;
	const stripped = designName.replace(suffixPattern, '');

	// Extract the numeric portion (4+ digits)
	const numericMatch = stripped.match(/\d{4,}/);
	if (numericMatch) return numericMatch[0];

	// Fallback: return stripped name without suffix if no long number found
	return stripped.trim();
}

/**
 * Determines if two items belong to the same tile set (same base item number).
 */
export function isSameTileSet(designA: string, designB: string): boolean {
	const baseA = extractBaseItemNumber(designA);
	const baseB = extractBaseItemNumber(designB);
	return baseA !== '' && baseA === baseB;
}

/**
 * Groups an array of items by their base item number.
 */
export function groupByBaseItemNumber<T extends { design_name: string }>(
	items: T[],
): Map<string, T[]> {
	const groups = new Map<string, T[]>();
	for (const item of items) {
		const base = extractBaseItemNumber(item.design_name);
		const existing = groups.get(base) ?? [];
		groups.set(base, [...existing, item]);
	}
	return groups;
}
