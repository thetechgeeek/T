import { PixelRatio } from 'react-native';

const DEFAULT_PIXEL_RATIO = 2;
const PIXEL_RATIO_DECIMALS = 2;
const HIGH_DENSITY_THRESHOLD = 3;
const HIGH_DENSITY_LAYOUT_SCALE = 1.08;
const HIGH_DENSITY_DIMENSION_SCALE = 1.04;
const HIGH_DENSITY_RADIUS_SCALE = 1.02;

export function detectPixelRatio() {
	const value = PixelRatio.get?.() ?? DEFAULT_PIXEL_RATIO;
	return Number(value.toFixed(PIXEL_RATIO_DECIMALS));
}

export function resolveDensityAwareTouchTarget(value: number, pixelRatio = detectPixelRatio()) {
	return resolveDensityAwareDimension(value, pixelRatio, HIGH_DENSITY_LAYOUT_SCALE);
}

export function resolveDensityAwareDimension(
	value: number,
	pixelRatio = detectPixelRatio(),
	scale = HIGH_DENSITY_DIMENSION_SCALE,
) {
	if (pixelRatio < HIGH_DENSITY_THRESHOLD) {
		return value;
	}

	const roundToNearestPixel = PixelRatio.roundToNearestPixel;
	const scaledValue = value * scale;

	if (typeof roundToNearestPixel !== 'function') {
		return Math.round(scaledValue);
	}

	return Math.max(value, roundToNearestPixel(scaledValue));
}

export function resolveDensityAwareRadius(value: number, pixelRatio = detectPixelRatio()) {
	return resolveDensityAwareDimension(value, pixelRatio, HIGH_DENSITY_RADIUS_SCALE);
}
