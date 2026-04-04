import Color from 'color';
import { lightTheme, darkTheme } from '@/src/theme/colors';

function assertContrast(fg: string, bg: string, minRatio = 4.5, context = '') {
	const ratio = Color(fg).contrast(Color(bg));
	try {
		expect(ratio).toBeGreaterThanOrEqual(minRatio);
	} catch (e) {
		throw new Error(
			`Contrast ratio for ${context} (${fg} on ${bg}) is ${ratio.toFixed(2)}, which is below the required ${minRatio}`,
			{ cause: e },
		);
	}
}

describe('WCAG Contrast Accessibility', () => {
	describe('Light Theme', () => {
		const c = lightTheme.colors;

		it('has sufficient contrast for body text', () => {
			assertContrast(c.onBackground, c.background, 4.5, 'onBackground/background');
			assertContrast(c.onSurface, c.surface, 4.5, 'onSurface/surface');
		});

		it('has sufficient contrast for variant text (AA Large/UI)', () => {
			assertContrast(c.onSurfaceVariant, c.surface, 3.0, 'onSurfaceVariant/surface');
		});

		it('has sufficient contrast for brand elements', () => {
			assertContrast(c.onPrimary, c.primary, 4.5, 'onPrimary/primary');
			assertContrast(c.primary, c.background, 4.5, 'primary/background');
		});

		it('has sufficient contrast for status elements', () => {
			assertContrast(c.onSuccess, c.success, 4.5, 'onSuccess/success');
			assertContrast(c.onError, c.error, 4.5, 'onError/error');
			assertContrast(c.onWarning, c.warning, 4.5, 'onWarning/warning');
		});
	});

	describe('Dark Theme', () => {
		const c = darkTheme.colors;

		it('has sufficient contrast for body text', () => {
			assertContrast(c.onBackground, c.background, 4.5, 'onBackground/background');
			assertContrast(c.onSurface, c.surface, 4.5, 'onSurface/surface');
		});

		it('has sufficient contrast for variant text', () => {
			assertContrast(c.onSurfaceVariant, c.surface, 3.0, 'onSurfaceVariant/surface');
		});

		it('has sufficient contrast for brand elements', () => {
			assertContrast(c.onPrimary, c.primary, 4.5, 'onPrimary/primary');
			// Note: primary is often used on background as well
			assertContrast(c.primary, c.background, 4.5, 'primary/background');
		});

		it('has sufficient contrast for status elements', () => {
			// In dark theme, some on-tokens might be black (#000000)
			assertContrast(c.onSuccess, c.success, 4.5, 'onSuccess/success');
			assertContrast(c.onError, c.error, 4.5, 'onError/error');
		});
	});
});
