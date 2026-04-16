import { buildTheme, highContrastDarkTheme, highContrastLightTheme, lightTheme } from '../colors';
import {
	COLOR_VARIANTS,
	DATA_EMPHASIS_TOKENS,
	FONT_FAMILY_TOKENS,
	FONT_SIZE_TOKENS,
	HERO_TOKENS,
	ICON_SIZE_TOKENS,
	MEDIA_OVERLAY_TOKENS,
	PRIMITIVE_COLOR_PALETTES,
	QUALITATIVE_DATA_PALETTE_TOKENS,
	SHADOW_TOKEN_RECIPES,
	SILHOUETTE_RADIUS_TOKENS,
	SPACING_STEP_TOKENS,
	SURFACE_TIER_TOKENS,
} from '../designTokens';

const PALETTE_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

describe('design token contract', () => {
	it('defines full primitive 50-950 scales for every palette', () => {
		expect(COLOR_VARIANTS).toEqual(['light', 'dark', 'highContrastLight', 'highContrastDark']);
		for (const palette of Object.values(PRIMITIVE_COLOR_PALETTES)) {
			expect(Object.keys(palette)).toEqual(PALETTE_STEPS);
		}
	});

	it('defines explicit spacing steps, icon sizes, and qualitative chart colors', () => {
		expect(SPACING_STEP_TOKENS).toEqual(
			expect.objectContaining({
				0: 0,
				1: 1,
				6: 6,
				20: 20,
				64: 64,
			}),
		);
		expect(ICON_SIZE_TOKENS).toEqual({
			dense: 16,
			default: 20,
			standalone: 24,
		});
		expect(QUALITATIVE_DATA_PALETTE_TOKENS).toHaveLength(10);
		expect(new Set(QUALITATIVE_DATA_PALETTE_TOKENS).size).toBe(10);
	});

	it('exposes explicit surface, hero, data, and media token families', () => {
		expect(SURFACE_TIER_TOKENS.light).toEqual(
			expect.objectContaining({
				canvas: expect.any(String),
				default: expect.any(String),
				raised: expect.any(String),
				overlay: expect.any(String),
				inverse: expect.any(String),
			}),
		);
		expect(HERO_TOKENS.light).toEqual(
			expect.objectContaining({
				screen: expect.objectContaining({ surface: expect.any(String) }),
				stat: expect.objectContaining({ accent: expect.any(String) }),
				promo: expect.objectContaining({ onSurface: expect.any(String) }),
			}),
		);
		expect(DATA_EMPHASIS_TOKENS.dark).toEqual(
			expect.objectContaining({
				focusSeries: expect.any(String),
				comparisonSeries: expect.any(String),
				mutedSeries: expect.any(String),
				quietGrid: expect.any(String),
				annotation: expect.any(String),
			}),
		);
		expect(MEDIA_OVERLAY_TOKENS.highContrastDark.scrimStrong).toMatch(/^rgba\(/);
		expect(MEDIA_OVERLAY_TOKENS.highContrastDark.fallbackSurface).toBeTruthy();
	});

	it('remaps tokens for high-contrast themes', () => {
		expect(highContrastLightTheme.meta.contrastMode).toBe('high');
		expect(highContrastDarkTheme.meta.contrastMode).toBe('high');
		expect(highContrastLightTheme.colors.background).not.toBe(lightTheme.colors.background);
		expect(highContrastDarkTheme.visual.surfaces.default).toBe('#000000');
		expect(highContrastDarkTheme.visual.surfaces.inverse).toBe('#FFFFFF');
	});

	it('maps silhouette radii into stable component families', () => {
		expect(SILHOUETTE_RADIUS_TOKENS).toEqual({
			card: 8,
			control: 8,
			chip: 9999,
			avatar: 9999,
			overlay: 12,
		});
		expect(lightTheme.visual.silhouette).toEqual(SILHOUETTE_RADIUS_TOKENS);
	});

	it('defines typography families and the full size scale', () => {
		expect(FONT_FAMILY_TOKENS).toEqual(
			expect.objectContaining({
				ui: expect.objectContaining({ ios: expect.any(String), web: expect.any(String) }),
				brand: expect.objectContaining({ android: expect.any(String) }),
				mono: expect.objectContaining({ default: expect.any(String) }),
			}),
		);
		expect(FONT_SIZE_TOKENS).toEqual(
			expect.objectContaining({
				xs: 11,
				lg: 16,
				'4xl': 28,
				'display-2xl': 60,
			}),
		);
		expect(lightTheme.typography.families.brand).toBeTruthy();
		expect(lightTheme.typography.scale['display-2xl']).toBe(60);
	});

	it('keeps shadow recipes ambient and non-harsh by default', () => {
		expect(SHADOW_TOKEN_RECIPES.light.md).toEqual({
			opacity: 0.12,
			blur: 6,
			y: 3,
			elevation: 4,
		});
		expect(lightTheme.visual.depth.ambientShadowBlur).toBeGreaterThan(0);
		expect(lightTheme.visual.depth.ambientShadowOpacity).toBeLessThan(0.2);
		expect(lightTheme.visual.depth.harshShadowAvoided).toBe(true);
	});

	it('carries accent-budget tokens and display emphasis into runtime themes', () => {
		const baselineTheme = buildTheme(false, 'baseline', { pixelRatio: 2 });
		const studioTheme = buildTheme(false, 'studio', { pixelRatio: 2 });

		expect(baselineTheme.visual.accents.maxHotspots).toBe(1);
		expect(studioTheme.visual.accents.maxHotspots).toBe(2);
		expect(studioTheme.visual.hero.screen.surface).toBeTruthy();
		expect(studioTheme.visual.data.annotation).toBeTruthy();
		expect(studioTheme.visual.media.textGradientEnd).toMatch(/^rgba\(/);
	});
});
