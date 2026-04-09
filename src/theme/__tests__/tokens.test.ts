import { lightTheme } from '../colors';

describe('Theme Tokens (P0.1)', () => {
	it('should have correct spacing tokens', () => {
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
});
