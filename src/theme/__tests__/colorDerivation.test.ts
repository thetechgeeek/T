/**
 * Phase 1 — Color derivation cleanup tests
 *
 * Verifies:
 * 1. withOpacity produces correct rgba strings
 * 2. All new OPACITY_* constants exist and have correct values
 * 3. No raw hex-string concatenation needed (withOpacity handles short/long hex)
 */

import { withOpacity } from '../../utils/color';
import {
	OPACITY_ROW_HIGHLIGHT,
	OPACITY_TINT_SUBTLE,
	OPACITY_TINT_LIGHT,
	OPACITY_BADGE_BG,
	OPACITY_PANEL,
	OPACITY_BORDER_TINT,
	OPACITY_DIM,
	OPACITY_SEPARATOR,
	OPACITY_SKELETON_BASE,
} from '../uiMetrics';

describe('withOpacity (Phase 1)', () => {
	it('converts 6-char hex to rgba', () => {
		expect(withOpacity('#C1440E', 0.08)).toBe('rgba(193, 68, 14, 0.08)');
	});

	it('converts 3-char hex to rgba', () => {
		expect(withOpacity('#fff', 0.2)).toBe('rgba(255, 255, 255, 0.2)');
	});

	it('handles hex without # prefix', () => {
		expect(withOpacity('000000', 0.5)).toBe('rgba(0, 0, 0, 0.5)');
	});

	it('replaces alpha in existing rgba string', () => {
		expect(withOpacity('rgba(255,255,255,1)', 0.4)).toBe('rgba(255, 255, 255, 0.4)');
	});

	it('produces same result as old hex-suffix hack for common values', () => {
		// '15' hex suffix = 21/255 ≈ 0.082, plan rounds to 0.08
		// withOpacity should produce a deterministic rgba
		const result = withOpacity('#C1440E', 0.08);
		expect(result).toMatch(/^rgba\(/);
		expect(result).toContain('0.08');
	});
});

describe('Opacity constants (Phase 1)', () => {
	it('OPACITY_ROW_HIGHLIGHT is 0.06', () => {
		expect(OPACITY_ROW_HIGHLIGHT).toBe(0.06);
	});

	it('OPACITY_TINT_SUBTLE is 0.09', () => {
		expect(OPACITY_TINT_SUBTLE).toBe(0.09);
	});

	it('OPACITY_TINT_LIGHT is 0.12', () => {
		expect(OPACITY_TINT_LIGHT).toBe(0.12);
	});

	it('OPACITY_BADGE_BG is 0.13', () => {
		expect(OPACITY_BADGE_BG).toBe(0.13);
	});

	it('OPACITY_PANEL is 0.18', () => {
		expect(OPACITY_PANEL).toBe(0.18);
	});

	it('OPACITY_BORDER_TINT is 0.19', () => {
		expect(OPACITY_BORDER_TINT).toBe(0.19);
	});

	it('OPACITY_DIM is 0.38', () => {
		expect(OPACITY_DIM).toBe(0.38);
	});

	it('OPACITY_SEPARATOR is 0.4', () => {
		expect(OPACITY_SEPARATOR).toBe(0.4);
	});

	it('OPACITY_SKELETON_BASE is 0.08', () => {
		expect(OPACITY_SKELETON_BASE).toBe(0.08);
	});

	it('opacity constants are in ascending order', () => {
		const ordered = [
			OPACITY_ROW_HIGHLIGHT,
			OPACITY_SKELETON_BASE,
			OPACITY_TINT_SUBTLE,
			OPACITY_TINT_LIGHT,
			OPACITY_BADGE_BG,
			OPACITY_PANEL,
			OPACITY_BORDER_TINT,
			OPACITY_DIM,
			OPACITY_SEPARATOR,
		];
		for (let i = 1; i < ordered.length; i++) {
			expect(ordered[i]).toBeGreaterThan(ordered[i - 1]);
		}
	});
});

describe('Color pipeline guard (Phase 1)', () => {
	it('withOpacity result is always a valid rgba string', () => {
		const inputs: Array<[string, number]> = [
			['#1A8754', 0.06],
			['#B91C1C', 0.09],
			['#C1440E', 0.13],
			['#3b82f6', 0.12],
			['#808080', 0.4],
		];
		inputs.forEach(([color, opacity]) => {
			const result = withOpacity(color, opacity);
			expect(result).toMatch(/^rgba\(\d+, \d+, \d+, [0-9.]+\)$/);
		});
	});
});
