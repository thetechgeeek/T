import { buildTheme, DEFAULT_THEME_PRESET_ID } from '../colors';

describe('theme presets', () => {
	it('keeps the default preset aligned with tilemaster', () => {
		const theme = buildTheme(false, DEFAULT_THEME_PRESET_ID);

		expect(theme.meta.presetId).toBe('tilemaster');
		expect(theme.meta.presetLabel).toBe('TileMaster');
		expect(theme.spacing.lg).toBe(16);
		expect(theme.borderRadius.md).toBe(8);
	});

	it('applies executive density and chrome changes', () => {
		const defaultTheme = buildTheme(false, 'tilemaster');
		const executiveTheme = buildTheme(false, 'executive');

		expect(executiveTheme.meta.presetId).toBe('executive');
		expect(executiveTheme.meta.density).toBe('compact');
		expect(executiveTheme.spacing.lg).toBeLessThan(defaultTheme.spacing.lg);
		expect(executiveTheme.borderRadius.md).toBeLessThan(defaultTheme.borderRadius.md);
		expect(executiveTheme.animation.durationFast).toBeLessThan(
			defaultTheme.animation.durationFast,
		);
		expect(executiveTheme.colors.primary).not.toBe(defaultTheme.colors.primary);
	});

	it('applies spacious touch targets for studio', () => {
		const defaultTheme = buildTheme(false, 'tilemaster');
		const studioTheme = buildTheme(false, 'studio');
		const monoTheme = buildTheme(true, 'mono');

		expect(studioTheme.meta.presetId).toBe('studio');
		expect(studioTheme.touchTarget).toBeGreaterThan(48);
		expect(studioTheme.borderRadius.lg).toBeGreaterThan(defaultTheme.borderRadius.lg);
		expect(studioTheme.animation.durationSlow).toBeGreaterThan(
			defaultTheme.animation.durationSlow,
		);
		expect(monoTheme.meta.presetId).toBe('mono');
		expect(monoTheme.colors.background).not.toBe(
			buildTheme(true, 'tilemaster').colors.background,
		);
	});
});
