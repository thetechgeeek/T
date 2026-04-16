import { detectDeviceLocale, resolveSupportedLanguage } from '../runtime';

describe('i18n runtime helpers', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('detects the current device locale from Intl', () => {
		const dateTimeFormatSpy = jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(
			(() =>
				({
					resolvedOptions: () => ({ locale: 'hi-IN' }),
				}) as Intl.DateTimeFormat) as typeof Intl.DateTimeFormat,
		);

		expect(detectDeviceLocale()).toBe('hi-IN');

		dateTimeFormatSpy.mockRestore();
	});

	it('falls back to English when locale detection throws', () => {
		jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => {
			throw new Error('Intl unavailable');
		});

		expect(detectDeviceLocale()).toBe('en-US');
	});

	it('maps device locales onto supported app languages', () => {
		expect(resolveSupportedLanguage('hi-IN')).toBe('hi');
		expect(resolveSupportedLanguage('en-IN')).toBe('en');
		expect(resolveSupportedLanguage('fr-FR')).toBe('en');
	});
});
