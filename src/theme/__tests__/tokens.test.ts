import { darkTheme, lightTheme } from '../colors';
import { layout } from '../layout';
import {
	Z_INDEX,
	FAB_OFFSET_RIGHT,
	FAB_OFFSET_BOTTOM,
	OVERLAY_COLOR_MEDIUM,
	OVERLAY_COLOR_STRONG,
	OVERLAY_COLOR_DARK,
	OVERLAY_COLOR_DIVIDER,
	OVERLAY_COLOR_SEPARATOR,
	GLASS_WHITE_LIGHT,
	GLASS_WHITE_MEDIUM,
	GLASS_WHITE_STRONG,
	GLASS_WHITE_TEXT,
	GLASS_WHITE_CARD,
} from '../uiMetrics';

describe('Theme Tokens (P0.1)', () => {
	it('should have correct spacing tokens', () => {
		expect(lightTheme.spacing.xxs).toBe(2);
		expect(lightTheme.spacing.xs).toBe(4);
		expect(lightTheme.spacing.sm).toBe(8);
		expect(lightTheme.spacing.md).toBe(12);
		expect(lightTheme.spacing.lg).toBe(16);
		expect(lightTheme.spacing.xl).toBe(24);
		expect(lightTheme.spacing['2xl']).toBe(32);
		expect(lightTheme.spacing['3xl']).toBe(48);
		expect(lightTheme.spacing['4xl']).toBe(64);
	});

	it('should have correct border radius tokens', () => {
		expect(lightTheme.borderRadius.none).toBe(0);
		expect(lightTheme.borderRadius.sm).toBe(4);
		expect(lightTheme.borderRadius.md).toBe(8);
		expect(lightTheme.borderRadius.lg).toBe(12);
		expect(lightTheme.borderRadius.xl).toBe(16);
		expect(lightTheme.borderRadius.full).toBe(9999);
	});

	it('should have correct touch target token', () => {
		expect(lightTheme.touchTarget).toBe(48);
	});

	it('should have correct animation tokens', () => {
		expect(lightTheme.animation.springDamping).toBe(20);
		expect(lightTheme.animation.springStiffness).toBe(200);
		expect(lightTheme.animation.durationNormal).toBe(200);
	});

	it('should expose shared utility colors through the theme', () => {
		expect(lightTheme.colors.white).toBe('#FFFFFF');
		expect(lightTheme.colors.shadow).toBe('#4A3828');
		expect(darkTheme.colors.shadow).toBe('#000000');
	});

	it('should expose palette-backed collections through the theme', () => {
		expect(lightTheme.collections.partyAvatarColors).toHaveLength(8);
		expect(lightTheme.collections.expenseCategoryPickColors[0]).toBe('#C1440E');
		expect(lightTheme.collections.printThemeSwatches).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ key: 'professional', color: '#1D4ED8' }),
			]),
		);
		expect(lightTheme.collections.expenseReportDemoSlices).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: 'Purchase', color: '#4A90E2' }),
			]),
		);
		expect(lightTheme.collections.allTransactionsTypeColors.sale).toBe('#22c55e');
	});
});

describe('Layout gap helpers (Phase 0)', () => {
	it('covers full spacing scale including new entries', () => {
		expect(layout.gap2).toEqual({ gap: 2 });
		expect(layout.gap4).toEqual({ gap: 4 });
		expect(layout.gap8).toEqual({ gap: 8 });
		expect(layout.gap12).toEqual({ gap: 12 });
		expect(layout.gap16).toEqual({ gap: 16 });
		expect(layout.gap24).toEqual({ gap: 24 });
		expect(layout.gap32).toEqual({ gap: 32 });
		expect(layout.gap48).toEqual({ gap: 48 });
	});
});

describe('Z_INDEX scale (Phase 0)', () => {
	it('defines all z-index levels in ascending order', () => {
		expect(Z_INDEX.base).toBe(0);
		expect(Z_INDEX.dropdown).toBe(10);
		expect(Z_INDEX.sticky).toBe(50);
		expect(Z_INDEX.overlay).toBe(100);
		expect(Z_INDEX.modal).toBe(200);
		expect(Z_INDEX.toast).toBe(300);
		expect(Z_INDEX.max).toBe(999);
	});

	it('values are strictly ascending', () => {
		const values = Object.values(Z_INDEX) as number[];
		for (let i = 1; i < values.length; i++) {
			expect(values[i]).toBeGreaterThan(values[i - 1]);
		}
	});
});

describe('FAB positioning constants (Phase 0)', () => {
	it('exports numeric offsets', () => {
		expect(typeof FAB_OFFSET_RIGHT).toBe('number');
		expect(typeof FAB_OFFSET_BOTTOM).toBe('number');
		expect(FAB_OFFSET_RIGHT).toBe(20);
		expect(FAB_OFFSET_BOTTOM).toBe(20);
	});
});

describe('Overlay / glass color tokens (Phase 0)', () => {
	it('overlay tokens are valid rgba strings', () => {
		const rgbaPattern = /^rgba\(\d+,\d+,\d+,[0-9.]+\)$/;
		expect(OVERLAY_COLOR_MEDIUM).toMatch(rgbaPattern);
		expect(OVERLAY_COLOR_STRONG).toMatch(rgbaPattern);
		expect(OVERLAY_COLOR_DARK).toMatch(rgbaPattern);
		expect(OVERLAY_COLOR_DIVIDER).toMatch(rgbaPattern);
		expect(OVERLAY_COLOR_SEPARATOR).toMatch(rgbaPattern);
		expect(GLASS_WHITE_LIGHT).toMatch(rgbaPattern);
		expect(GLASS_WHITE_MEDIUM).toMatch(rgbaPattern);
		expect(GLASS_WHITE_STRONG).toMatch(rgbaPattern);
		expect(GLASS_WHITE_TEXT).toMatch(rgbaPattern);
		expect(GLASS_WHITE_CARD).toMatch(rgbaPattern);
	});

	it('overlay alphas are in ascending darkness order', () => {
		const alpha = (s: string) => parseFloat(s.split(',')[3]);
		expect(alpha(OVERLAY_COLOR_SEPARATOR)).toBeLessThan(alpha(OVERLAY_COLOR_DIVIDER));
		expect(alpha(OVERLAY_COLOR_DIVIDER)).toBeLessThan(alpha(OVERLAY_COLOR_MEDIUM));
		expect(alpha(OVERLAY_COLOR_MEDIUM)).toBeLessThan(alpha(OVERLAY_COLOR_STRONG));
		expect(alpha(OVERLAY_COLOR_STRONG)).toBeLessThan(alpha(OVERLAY_COLOR_DARK));
	});

	it('glass white alphas are in ascending opacity order', () => {
		const alpha = (s: string) => parseFloat(s.split(',')[3]);
		expect(alpha(GLASS_WHITE_LIGHT)).toBeLessThan(alpha(GLASS_WHITE_MEDIUM));
		expect(alpha(GLASS_WHITE_MEDIUM)).toBeLessThan(alpha(GLASS_WHITE_STRONG));
		expect(alpha(GLASS_WHITE_STRONG)).toBeLessThan(alpha(GLASS_WHITE_TEXT));
		expect(alpha(GLASS_WHITE_TEXT)).toBeLessThan(alpha(GLASS_WHITE_CARD));
	});
});
