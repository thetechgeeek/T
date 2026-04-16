import { PixelRatio } from 'react-native';
import { buildTheme } from '../colors';
import {
	detectPixelRatio,
	resolveDensityAwareDimension,
	resolveDensityAwareRadius,
	resolveDensityAwareTouchTarget,
} from '../density';

describe('theme density helpers', () => {
	const roundToDensityStep = (value: number) => Number((Math.ceil(value * 3) / 3).toFixed(2));

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('reads the active runtime pixel ratio', () => {
		jest.spyOn(PixelRatio, 'get').mockReturnValue(3);

		expect(detectPixelRatio()).toBe(3);
	});

	it('keeps baseline touch targets unchanged on standard density displays', () => {
		jest.spyOn(PixelRatio, 'get').mockReturnValue(2);

		expect(resolveDensityAwareTouchTarget(48)).toBe(48);
		expect(buildTheme(false, 'baseline').touchTarget).toBe(48);
	});

	it('scales touch targets up for high-density displays', () => {
		jest.spyOn(PixelRatio, 'get').mockReturnValue(3);
		jest.spyOn(PixelRatio, 'roundToNearestPixel').mockImplementation(roundToDensityStep);

		expect(resolveDensityAwareTouchTarget(48)).toBeGreaterThan(48);
		const baselineTheme = buildTheme(false, 'baseline');
		expect(baselineTheme.touchTarget).toBeGreaterThan(48);
		expect(baselineTheme.spacing.lg).toBeGreaterThan(16);
		expect(baselineTheme.borderRadius.md).toBeGreaterThan(8);
		expect(baselineTheme.typography.scale.lg).toBeGreaterThan(16);
	});

	it('keeps dimensions and radii stable below the high-density threshold', () => {
		jest.spyOn(PixelRatio, 'get').mockReturnValue(2);

		expect(resolveDensityAwareDimension(16)).toBe(16);
		expect(resolveDensityAwareRadius(8)).toBe(8);
	});

	it('scales dimensions and radii once the display density is high enough', () => {
		jest.spyOn(PixelRatio, 'get').mockReturnValue(3);
		jest.spyOn(PixelRatio, 'roundToNearestPixel').mockImplementation(roundToDensityStep);

		expect(resolveDensityAwareDimension(16)).toBeGreaterThan(16);
		expect(resolveDensityAwareRadius(8)).toBeGreaterThan(8);
	});
});
