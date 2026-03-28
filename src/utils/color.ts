/**
 * Convert a hex color + opacity to an rgba() string.
 * Supports 3, 4, 6, and 8-char hex strings (with or without '#').
 */
export function withOpacity(hexColor: string, opacity: number): string {
	const hex = hexColor.replace('#', '');
	const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex.slice(0, 6);
	const r = parseInt(full.substring(0, 2), 16);
	const g = parseInt(full.substring(2, 4), 16);
	const b = parseInt(full.substring(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
