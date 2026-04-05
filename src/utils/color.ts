/**
 * Convert a color + opacity to an rgba() string.
 * Supports 3, 4, 6, and 8-char hex strings (with or without '#') and existing rgba() strings.
 */
export function withOpacity(color: string, opacity: number): string {
	// Already an rgba() — replace the alpha channel
	const rgbaMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (rgbaMatch) {
		return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity})`;
	}
	const hex = color.replace('#', '');
	const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex.slice(0, 6);
	const r = parseInt(full.substring(0, 2), 16);
	const g = parseInt(full.substring(2, 4), 16);
	const b = parseInt(full.substring(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Darken a hex color by a given factor (0–1).
 * factor=0.1 → 10% darker.
 */
export function darken(hexColor: string, factor: number): string {
	const hex = hexColor.replace('#', '');
	const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex.slice(0, 6);
	const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
	const r = clamp(parseInt(full.substring(0, 2), 16) * (1 - factor));
	const g = clamp(parseInt(full.substring(2, 4), 16) * (1 - factor));
	const b = clamp(parseInt(full.substring(4, 6), 16) * (1 - factor));
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
