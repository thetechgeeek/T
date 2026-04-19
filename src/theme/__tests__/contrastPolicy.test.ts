import { buildTheme } from '../colors';

function hexToLinearRgb(hex: string) {
	const normalized = hex.replace('#', '').slice(0, 6);
	return [0, 2, 4].map((start) => {
		const channel = Number.parseInt(normalized.slice(start, start + 2), 16) / 255;
		return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
	});
}

function relativeLuminance(hex: string) {
	const [red, green, blue] = hexToLinearRgb(hex);
	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string) {
	const foregroundLuminance = relativeLuminance(foreground);
	const backgroundLuminance = relativeLuminance(background);
	const lightest = Math.max(foregroundLuminance, backgroundLuminance);
	const darkest = Math.min(foregroundLuminance, backgroundLuminance);

	return (lightest + 0.05) / (darkest + 0.05);
}

const THEME_MATRIX = [
	{ label: 'light default', theme: buildTheme(false) },
	{ label: 'dark default', theme: buildTheme(true) },
	{ label: 'light high contrast', theme: buildTheme(false, { contrastMode: 'high' }) },
	{ label: 'dark high contrast', theme: buildTheme(true, { contrastMode: 'high' }) },
] as const;

describe('theme contrast policy', () => {
	it.each(THEME_MATRIX)('keeps text tokens at or above WCAG AA in $label', ({ theme }) => {
		expect(
			contrastRatio(theme.colors.onBackground, theme.colors.background),
		).toBeGreaterThanOrEqual(4.5);
		expect(contrastRatio(theme.colors.onSurface, theme.colors.surface)).toBeGreaterThanOrEqual(
			4.5,
		);
		expect(contrastRatio(theme.colors.onPrimary, theme.colors.primary)).toBeGreaterThanOrEqual(
			4.5,
		);
	});

	it.each(THEME_MATRIX)(
		'keeps key action and critical-state colors above non-text contrast minimums in $label',
		({ theme }) => {
			expect(
				contrastRatio(theme.colors.primary, theme.colors.surface),
			).toBeGreaterThanOrEqual(3);
			expect(contrastRatio(theme.colors.error, theme.colors.surface)).toBeGreaterThanOrEqual(
				3,
			);
		},
	);
});
