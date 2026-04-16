const DEFAULT_DEVICE_LOCALE = 'en-US';

export const SUPPORTED_LANGUAGES = ['en', 'hi'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function detectDeviceLocale() {
	try {
		return Intl.DateTimeFormat().resolvedOptions().locale || DEFAULT_DEVICE_LOCALE;
	} catch {
		return DEFAULT_DEVICE_LOCALE;
	}
}

export function resolveSupportedLanguage(locale = detectDeviceLocale()): SupportedLanguage {
	return locale.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}
