import { buildTheme, DEFAULT_THEME_PRESET_ID } from '../colors';
import { resolveTypographyFamiliesForLocale } from '../localeTypography';

describe('theme presets', () => {
	it('keeps the default preset aligned with baseline', () => {
		const theme = buildTheme(false, DEFAULT_THEME_PRESET_ID, { pixelRatio: 2 });

		expect(theme.meta.presetId).toBe('baseline');
		expect(theme.meta.presetLabel).toBe('Baseline');
		expect(theme.meta.expression).toBe('balanced');
		expect(theme.meta.accentBudget).toBe(1);
		expect(theme.meta.contrastMode).toBe('default');
		expect(theme.meta.tokenVersion).toBe('1.1.0');
		expect(theme.spacing.lg).toBe(16);
		expect(theme.borderRadius.md).toBe(8);
		expect(theme.visual.presentation.defaultSurfaceBias).toBe('neutral');
		expect(theme.visual.presentation.brandExpressionZones).toEqual(['hero']);
		expect(theme.visual.presentation.neutralSurfaceTiers).toEqual([
			'canvas',
			'default',
			'raised',
			'overlay',
		]);
		expect(theme.visual.presentation.inverseActionSurfaces).toEqual([
			'hero',
			'media',
			'inverse',
		]);
	});

	it('keeps typography role coverage for body medium and monospace code text', () => {
		const theme = buildTheme(false, 'baseline', { pixelRatio: 2 });

		expect(theme.typography.variants.bodyMedium.fontWeight).toBe('500');
		expect(theme.typography.variants.code.fontFamily).toBe(theme.typography.families.mono);
		expect(theme.typography.variants.metric.fontSize).toBeGreaterThan(
			theme.typography.variants.body.fontSize ?? 0,
		);
	});

	it('resolves script-safe font families for non-Latin locales', () => {
		const hindiTheme = buildTheme(false, 'baseline', {
			pixelRatio: 2,
			detectedLocale: 'hi-IN',
		});
		const families = resolveTypographyFamiliesForLocale('hi-IN');

		expect(hindiTheme.typography.fontFamily).toBe(families.ui);
		expect(hindiTheme.typography.fontFamilyDisplay).toBe(families.brand);
		expect(hindiTheme.typography.families.display).toBe(families.display);
	});

	it('applies executive density and chrome changes', () => {
		const defaultTheme = buildTheme(false, 'baseline', { pixelRatio: 2 });
		const executiveTheme = buildTheme(false, 'executive', { pixelRatio: 2 });

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
		expect(executiveTheme.visual.presentation.brandExpressionZones).toEqual(['hero']);
	});

	it('applies spacious touch targets for studio', () => {
		const defaultTheme = buildTheme(false, 'baseline', { pixelRatio: 2 });
		const studioTheme = buildTheme(false, 'studio', { pixelRatio: 2 });
		const monoTheme = buildTheme(true, 'mono', { pixelRatio: 2 });

		expect(studioTheme.meta.presetId).toBe('studio');
		expect(studioTheme.meta.expression).toBe('showcase');
		expect(studioTheme.meta.accentBudget).toBe(2);
		expect(studioTheme.touchTarget).toBeGreaterThan(48);
		expect(studioTheme.borderRadius.lg).toBeGreaterThan(defaultTheme.borderRadius.lg);
		expect(studioTheme.animation.durationSlow).toBeGreaterThan(
			defaultTheme.animation.durationSlow,
		);
		expect(studioTheme.visual.presentation.defaultSurfaceBias).toBe('brand');
		expect(studioTheme.visual.presentation.brandExpressionZones).toEqual([
			'hero',
			'promo',
			'media',
		]);
		expect(monoTheme.meta.presetId).toBe('mono');
		expect(monoTheme.colors.background).not.toBe(
			buildTheme(true, 'baseline', { pixelRatio: 2 }).colors.background,
		);
	});

	it('keeps inverse anchor actions available for hero, media, and high-contrast surfaces', () => {
		const highContrastTheme = buildTheme(false, 'baseline', {
			contrastMode: 'high',
			pixelRatio: 2,
		});

		expect(highContrastTheme.visual.presentation.inverseAction).toBe('required');
		expect(highContrastTheme.visual.presentation.inverseActionSurfaces).toEqual([
			'hero',
			'media',
			'inverse',
		]);
		expect(highContrastTheme.visual.surfaces.inverse).toBeTruthy();
		expect(highContrastTheme.visual.surfaces.onInverse).toBeTruthy();
	});
});
