import { I18nManager } from 'react-native';

const RTL_LANGUAGE_PREFIXES = ['ar', 'fa', 'he', 'ur'] as const;

export function configureI18nRtlSupport() {
	I18nManager.allowRTL?.(true);
	I18nManager.swapLeftAndRightInRTL?.(true);
}

export function isRtlLanguageTag(languageTag: string) {
	const normalizedLanguageTag = languageTag.trim().toLowerCase();
	return RTL_LANGUAGE_PREFIXES.some((prefix) => normalizedLanguageTag.startsWith(prefix));
}

export interface SyncI18nRtlPreferenceResult {
	didChange: boolean;
	requiresReload: boolean;
	shouldUseRtl: boolean;
}

export function syncI18nRtlPreference(
	languageTag: string,
	options?: { reloadApp?: () => void },
): SyncI18nRtlPreferenceResult {
	const shouldUseRtl = isRtlLanguageTag(languageTag);
	const didChange = I18nManager.isRTL !== shouldUseRtl;

	if (didChange) {
		I18nManager.forceRTL?.(shouldUseRtl);
		options?.reloadApp?.();
	}

	return {
		didChange,
		requiresReload: didChange,
		shouldUseRtl,
	};
}
