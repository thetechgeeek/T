import { Platform } from 'react-native';
import { FONT_FAMILY_TOKENS } from './designTokens';

export type DesignSystemScript = 'latin' | 'arabic' | 'devanagari' | 'cjk';

export interface TypographyFamilySet {
	script: DesignSystemScript;
	ui: string;
	display: string;
	brand: string;
	mono: string;
}

const DEFAULT_LOCALE = 'en-US';
const SCRIPT_FALLBACK_FAMILIES = {
	arabic: {
		ios: 'Geeza Pro',
		android: 'sans-serif',
		web: '"Noto Naskh Arabic", Inter, system-ui, sans-serif',
		default: 'Geeza Pro',
	},
	devanagari: {
		ios: 'Kohinoor Devanagari',
		android: 'sans-serif',
		web: '"Noto Sans Devanagari", Inter, system-ui, sans-serif',
		default: 'Kohinoor Devanagari',
	},
	cjk: {
		ios: 'PingFang SC',
		android: 'sans-serif',
		web: '"Noto Sans JP", Inter, system-ui, sans-serif',
		default: 'PingFang SC',
	},
} as const;

function resolvePlatformFontFamily(fontToken: {
	ios: string;
	android: string;
	web: string;
	default: string;
}) {
	return Platform.select(fontToken) ?? fontToken.default;
}

export function detectLocaleScript(locale = DEFAULT_LOCALE): DesignSystemScript {
	const normalizedLocale = locale.trim().toLowerCase();

	if (
		normalizedLocale.startsWith('ar') ||
		normalizedLocale.startsWith('fa') ||
		normalizedLocale.startsWith('ur') ||
		normalizedLocale.includes('-arab')
	) {
		return 'arabic';
	}

	if (
		normalizedLocale.startsWith('hi') ||
		normalizedLocale.startsWith('mr') ||
		normalizedLocale.startsWith('ne') ||
		normalizedLocale.startsWith('sa') ||
		normalizedLocale.includes('-deva')
	) {
		return 'devanagari';
	}

	if (
		normalizedLocale.startsWith('ja') ||
		normalizedLocale.startsWith('zh') ||
		normalizedLocale.startsWith('ko') ||
		normalizedLocale.includes('-hani') ||
		normalizedLocale.includes('-hans') ||
		normalizedLocale.includes('-hant')
	) {
		return 'cjk';
	}

	return 'latin';
}

export function resolveTypographyFamiliesForLocale(locale = DEFAULT_LOCALE): TypographyFamilySet {
	const script = detectLocaleScript(locale);
	const mono = resolvePlatformFontFamily(FONT_FAMILY_TOKENS.mono);

	if (script === 'latin') {
		return {
			script,
			ui: resolvePlatformFontFamily(FONT_FAMILY_TOKENS.ui),
			display: resolvePlatformFontFamily(FONT_FAMILY_TOKENS.display),
			brand: resolvePlatformFontFamily(FONT_FAMILY_TOKENS.brand),
			mono,
		};
	}

	const fallbackFamily = resolvePlatformFontFamily(SCRIPT_FALLBACK_FAMILIES[script]);

	return {
		script,
		ui: fallbackFamily,
		display: fallbackFamily,
		brand: fallbackFamily,
		mono,
	};
}
