import { detectLocaleScript, resolveTypographyFamiliesForLocale } from '../localeTypography';

describe('locale typography policy', () => {
	it('detects supported non-Latin script buckets from locale hints', () => {
		expect(detectLocaleScript('hi-IN')).toBe('devanagari');
		expect(detectLocaleScript('ar-SA')).toBe('arabic');
		expect(detectLocaleScript('he-IL')).toBe('hebrew');
		expect(detectLocaleScript('ja-JP')).toBe('cjk');
		expect(detectLocaleScript('en-US')).toBe('latin');
	});

	it('collapses display and brand families to the script-safe fallback for non-Latin locales', () => {
		const latinFamilies = resolveTypographyFamiliesForLocale('en-US');
		const hindiFamilies = resolveTypographyFamiliesForLocale('hi-IN');
		const hebrewFamilies = resolveTypographyFamiliesForLocale('he-IL');

		expect(hindiFamilies.script).toBe('devanagari');
		expect(hindiFamilies.ui).toBe(hindiFamilies.display);
		expect(hindiFamilies.display).toBe(hindiFamilies.brand);
		expect(hindiFamilies.mono).toBe(latinFamilies.mono);
		expect(hindiFamilies.ui).toBeTruthy();
		expect(hebrewFamilies.script).toBe('hebrew');
		expect(hebrewFamilies.ui).toBe(hebrewFamilies.display);
		expect(hebrewFamilies.display).toBe(hebrewFamilies.brand);
	});
});
