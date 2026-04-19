import { useTheme } from '@/src/theme/ThemeProvider';
import type { DesignSystemDirection, DesignSystemLocale } from './copy';
import { resolveIntlLocale } from './formatters';

export interface DesignSystemQualitySignals {
	detectedLocale: string;
	intlLocale: string;
	direction: DesignSystemDirection;
	runtimeRtl: boolean;
	pixelRatio: number;
	fontScale: number;
	reduceMotionEnabled: boolean;
	boldTextEnabled: boolean;
	highTextContrastEnabled: boolean;
}

export function useDesignSystemQualitySignals(
	locale: DesignSystemLocale,
): DesignSystemQualitySignals {
	const { runtime } = useTheme();
	const direction: DesignSystemDirection = locale === 'ar' ? 'rtl' : 'ltr';

	return {
		...runtime,
		intlLocale: resolveIntlLocale(locale),
		direction,
		runtimeRtl: runtime.runtimeRtl || direction === 'rtl',
	};
}
