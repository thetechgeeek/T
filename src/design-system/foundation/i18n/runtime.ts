import { getCalendars, getLocales } from 'expo-localization';

const DEFAULT_DEVICE_LOCALE = 'en-US';
const DEFAULT_DEVICE_TIME_ZONE = 'UTC';

export const SUPPORTED_LANGUAGES = ['en', 'hi'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function detectDeviceLocale() {
	try {
		return (
			getLocales()[0]?.languageTag ||
			Intl.DateTimeFormat().resolvedOptions().locale ||
			DEFAULT_DEVICE_LOCALE
		);
	} catch {
		return DEFAULT_DEVICE_LOCALE;
	}
}

export function detectDeviceTimeZone() {
	try {
		return (
			getCalendars()[0]?.timeZone ||
			Intl.DateTimeFormat().resolvedOptions().timeZone ||
			DEFAULT_DEVICE_TIME_ZONE
		);
	} catch {
		return DEFAULT_DEVICE_TIME_ZONE;
	}
}

export function resolveSupportedLanguage(locale = detectDeviceLocale()): SupportedLanguage {
	return locale.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}
