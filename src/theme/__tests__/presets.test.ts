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

	it('applies dense showcase styling for prism', () => {
		const defaultTheme = buildTheme(false, 'baseline', { pixelRatio: 2 });
		const prismTheme = buildTheme(false, 'prism', { pixelRatio: 2 });
		const prismDarkTheme = buildTheme(true, 'prism', { pixelRatio: 2 });

		expect(prismTheme.meta.presetId).toBe('prism');
		expect(prismTheme.meta.presetLabel).toBe('Prism');
		expect(prismTheme.meta.density).toBe('compact');
		expect(prismTheme.meta.expression).toBe('showcase');
		expect(prismTheme.meta.accentBudget).toBe(2);
		expect(prismTheme.spacing.lg).toBeLessThan(defaultTheme.spacing.lg);
		expect(prismTheme.borderRadius.lg).toBeGreaterThan(defaultTheme.borderRadius.lg);
		expect(prismTheme.touchTarget).toBe(defaultTheme.touchTarget);
		expect(prismTheme.colors.onSurface).toBe('#161B33');
		expect(prismTheme.visual.surfaces.hero).toBe('#ECE8FF');
		expect(prismTheme.visual.hero.stat.surface).toBe('#4D7CFE');
		expect(prismTheme.visual.media.textGradientEnd).toBe('rgba(20, 24, 48, 0.78)');
		expect(prismTheme.visual.presentation.showcaseDensity).toBe('compact');
		expect(prismDarkTheme.colors.onSurface).toBe('#F7F8FF');
		expect(prismDarkTheme.visual.surfaces.hero).toBe('#171D52');
		expect(prismDarkTheme.visual.data.comparisonSeries).toBe('#FF7CC4');
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

	it('scales typography, spacing, and touch targets between phone and tablet layouts', () => {
		const phoneTheme = buildTheme(false, 'baseline', {
			pixelRatio: 2,
			viewportWidth: 390,
			viewportHeight: 844,
		});
		const tabletTheme = buildTheme(false, 'baseline', {
			pixelRatio: 2,
			viewportWidth: 1024,
			viewportHeight: 768,
		});

		expect(tabletTheme.spacing.lg).toBeGreaterThan(phoneTheme.spacing.lg);
		expect(tabletTheme.typography.sizes.lg).toBeGreaterThan(phoneTheme.typography.sizes.lg);
		expect(tabletTheme.borderRadius.md).toBeGreaterThan(phoneTheme.borderRadius.md);
		expect(tabletTheme.touchTarget).toBeGreaterThan(phoneTheme.touchTarget);
		expect(tabletTheme.components.card.padding.md).toBeGreaterThan(
			phoneTheme.components.card.padding.md,
		);
	});
});
