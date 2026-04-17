import {
	FONT_FAMILY_TOKENS,
	FONT_POLICY_TOKENS,
	QUALITATIVE_DATA_PALETTE_TOKENS,
} from '../designTokens';

const COLOR_BLIND_MATRICES = {
	deuteranopia: [
		[0.625, 0.375, 0],
		[0.7, 0.3, 0],
		[0, 0.3, 0.7],
	],
	protanopia: [
		[0.567, 0.433, 0],
		[0.558, 0.442, 0],
		[0, 0.242, 0.758],
	],
} as const;

const CURATED_COLOR_BLIND_PAIRINGS = [
	[QUALITATIVE_DATA_PALETTE_TOKENS[0], QUALITATIVE_DATA_PALETTE_TOKENS[2]],
	[QUALITATIVE_DATA_PALETTE_TOKENS[1], QUALITATIVE_DATA_PALETTE_TOKENS[5]],
	[QUALITATIVE_DATA_PALETTE_TOKENS[3], QUALITATIVE_DATA_PALETTE_TOKENS[8]],
	[QUALITATIVE_DATA_PALETTE_TOKENS[4], QUALITATIVE_DATA_PALETTE_TOKENS[7]],
] as const;

function hexToRgb(hex: string) {
	const normalized = hex.replace('#', '');
	return [0, 2, 4].map((start) => Number.parseInt(normalized.slice(start, start + 2), 16));
}

function simulateColorBlindness(
	hex: string,
	matrix: readonly [readonly number[], readonly number[], readonly number[]],
) {
	const [r, g, b] = hexToRgb(hex);

	return [
		r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2],
		r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2],
		r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2],
	].map((value) => Math.max(0, Math.min(255, value)));
}

function rgbToLab([r, g, b]: number[]) {
	const [linearR, linearG, linearB] = [r / 255, g / 255, b / 255].map((channel) =>
		channel > 0.04045 ? ((channel + 0.055) / 1.055) ** 2.4 : channel / 12.92,
	);

	const xValue = (linearR * 0.4124 + linearG * 0.3576 + linearB * 0.1805) / 0.95047;
	const yValue = (linearR * 0.2126 + linearG * 0.7152 + linearB * 0.0722) / 1;
	const zValue = (linearR * 0.0193 + linearG * 0.1192 + linearB * 0.9505) / 1.08883;

	const [x, y, z] = [xValue, yValue, zValue].map((value) =>
		value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116,
	);

	return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

function deltaE(left: number[], right: number[]) {
	return Math.sqrt(left.reduce((sum, channel, index) => sum + (channel - right[index]) ** 2, 0));
}

describe('design-token accessibility policy', () => {
	it('keeps curated chart pairings distinguishable under deuteranopia and protanopia simulation', () => {
		for (const matrix of Object.values(COLOR_BLIND_MATRICES)) {
			for (const [left, right] of CURATED_COLOR_BLIND_PAIRINGS) {
				const leftSimulated = rgbToLab(simulateColorBlindness(left, matrix));
				const rightSimulated = rgbToLab(simulateColorBlindness(right, matrix));

				expect(deltaE(leftSimulated, rightSimulated)).toBeGreaterThan(30);
			}
		}
	});

	it('limits each platform to two product font families plus a monospace utility exemption', () => {
		expect(FONT_POLICY_TOKENS.maxProductFamilies).toBe(2);
		expect(FONT_POLICY_TOKENS.monoFamilyExempt).toBe(true);

		for (const platform of ['ios', 'android', 'web'] as const) {
			const productFamilies = new Set([
				FONT_FAMILY_TOKENS.ui[platform],
				FONT_FAMILY_TOKENS.display[platform],
				FONT_FAMILY_TOKENS.brand[platform],
			]);

			expect(productFamilies.size).toBeLessThanOrEqual(FONT_POLICY_TOKENS.maxProductFamilies);
		}
	});
});
