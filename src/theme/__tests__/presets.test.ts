import { buildTheme, DEFAULT_THEME_PRESET_ID } from '../colors';

describe('theme presets', () => {
	it('keeps the default preset aligned with baseline', () => {
		const theme = buildTheme(false, DEFAULT_THEME_PRESET_ID);

		expect(theme.meta.presetId).toBe('baseline');
		expect(theme.meta.presetLabel).toBe('Baseline');
		expect(theme.meta.expression).toBe('balanced');
		expect(theme.meta.accentBudget).toBe(1);
		expect(theme.spacing.lg).toBe(16);
		expect(theme.borderRadius.md).toBe(8);
		expect(theme.visual.presentation.defaultSurfaceBias).toBe('neutral');
	});

	it('applies executive density and chrome changes', () => {
		const defaultTheme = buildTheme(false, 'baseline');
		const executiveTheme = buildTheme(false, 'executive');

		expect(executiveTheme.meta.presetId).toBe('executive');
		expect(executiveTheme.meta.density).toBe('compact');
		expect(executiveTheme.meta.expression).toBe('operational');
		expect(executiveTheme.spacing.lg).toBeLessThan(defaultTheme.spacing.lg);
		expect(executiveTheme.borderRadius.md).toBeLessThan(defaultTheme.borderRadius.md);
		expect(executiveTheme.animation.durationFast).toBeLessThan(
			defaultTheme.animation.durationFast,
		);
		expect(executiveTheme.colors.primary).not.toBe(defaultTheme.colors.primary);
		expect(executiveTheme.visual.accents.maxHotspots).toBe(1);
	});

	it('applies spacious touch targets for studio', () => {
		const defaultTheme = buildTheme(false, 'baseline');
		const studioTheme = buildTheme(false, 'studio');
		const monoTheme = buildTheme(true, 'mono');

		expect(studioTheme.meta.presetId).toBe('studio');
		expect(studioTheme.meta.expression).toBe('showcase');
		expect(studioTheme.meta.accentBudget).toBe(2);
		expect(studioTheme.touchTarget).toBeGreaterThan(48);
		expect(studioTheme.borderRadius.lg).toBeGreaterThan(defaultTheme.borderRadius.lg);
		expect(studioTheme.animation.durationSlow).toBeGreaterThan(
			defaultTheme.animation.durationSlow,
		);
		expect(studioTheme.visual.presentation.defaultSurfaceBias).toBe('brand');
		expect(monoTheme.meta.presetId).toBe('mono');
		expect(monoTheme.colors.background).not.toBe(
			buildTheme(true, 'baseline').colors.background,
		);
	});
});
