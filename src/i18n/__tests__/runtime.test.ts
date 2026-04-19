import { getCalendars, getLocales } from 'expo-localization';
import { detectDeviceLocale, detectDeviceTimeZone, resolveSupportedLanguage } from '../runtime';

jest.mock('expo-localization', () => ({
	getLocales: jest.fn(),
	getCalendars: jest.fn(),
}));

describe('i18n runtime helpers', () => {
	afterEach(() => {
		jest.restoreAllMocks();
		jest.mocked(getLocales).mockReset();
		jest.mocked(getCalendars).mockReset();
	});

	it('detects the current device locale and timezone from expo-localization first', () => {
		jest.mocked(getLocales).mockReturnValue([
			{
				languageTag: 'hi-IN',
			} as ReturnType<typeof getLocales>[number],
		]);
		jest.mocked(getCalendars).mockReturnValue([
			{
				timeZone: 'Asia/Kolkata',
			} as ReturnType<typeof getCalendars>[number],
		]);

		const dateTimeFormatSpy = jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(
			(() =>
				({
					resolvedOptions: () => ({ locale: 'en-US', timeZone: 'UTC' }),
				}) as Intl.DateTimeFormat) as typeof Intl.DateTimeFormat,
		);

		expect(detectDeviceLocale()).toBe('hi-IN');
		expect(detectDeviceTimeZone()).toBe('Asia/Kolkata');

		dateTimeFormatSpy.mockRestore();
	});

	it('falls back to Intl when expo-localization is empty', () => {
		jest.mocked(getLocales).mockReturnValue([]);
		jest.mocked(getCalendars).mockReturnValue([]);
		jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(
			(() =>
				({
					resolvedOptions: () => ({ locale: 'fr-FR', timeZone: 'Europe/Paris' }),
				}) as Intl.DateTimeFormat) as typeof Intl.DateTimeFormat,
		);

		expect(detectDeviceLocale()).toBe('fr-FR');
		expect(detectDeviceTimeZone()).toBe('Europe/Paris');
	});

	it('falls back to English and UTC when locale detection throws', () => {
		jest.mocked(getLocales).mockImplementation(() => {
			throw new Error('Localization unavailable');
		});
		jest.mocked(getCalendars).mockImplementation(() => {
			throw new Error('Calendar unavailable');
		});
		jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => {
			throw new Error('Intl unavailable');
		});

		expect(detectDeviceLocale()).toBe('en-US');
		expect(detectDeviceTimeZone()).toBe('UTC');
	});

	it('maps device locales onto supported app languages', () => {
		expect(resolveSupportedLanguage('hi-IN')).toBe('hi');
		expect(resolveSupportedLanguage('en-IN')).toBe('en');
		expect(resolveSupportedLanguage('fr-FR')).toBe('en');
	});
});
