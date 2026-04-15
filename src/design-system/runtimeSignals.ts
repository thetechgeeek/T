import { AccessibilityInfo, I18nManager, PixelRatio } from 'react-native';
import { useEffect, useState } from 'react';

const DEFAULT_RUNTIME_LOCALE = 'en-US';
const FONT_SCALE_DECIMALS = 2;

type AccessibilitySubscription = { remove?: () => void } | undefined;

export interface RuntimeQualitySignals {
	detectedLocale: string;
	runtimeRtl: boolean;
	fontScale: number;
	reduceMotionEnabled: boolean;
	boldTextEnabled: boolean;
}

export const DEFAULT_RUNTIME_QUALITY_SIGNALS: RuntimeQualitySignals = {
	detectedLocale: DEFAULT_RUNTIME_LOCALE,
	runtimeRtl: false,
	fontScale: 1,
	reduceMotionEnabled: false,
	boldTextEnabled: false,
};

function detectRuntimeLocale() {
	try {
		return Intl.DateTimeFormat().resolvedOptions().locale || DEFAULT_RUNTIME_LOCALE;
	} catch {
		return DEFAULT_RUNTIME_LOCALE;
	}
}

function detectFontScale() {
	const fontScale = PixelRatio.getFontScale?.() ?? 1;
	return Number(fontScale.toFixed(FONT_SCALE_DECIMALS));
}

async function readAccessibilityBoolean(reader?: (() => Promise<boolean>) | (() => boolean)) {
	if (!reader) {
		return false;
	}

	try {
		const value = await Promise.resolve(reader());
		return Boolean(value);
	} catch {
		return false;
	}
}

function addAccessibilityListener(
	eventName: string,
	handler: (value: boolean) => void,
): AccessibilitySubscription {
	const addEventListener = AccessibilityInfo.addEventListener as unknown as
		| ((name: string, listener: (value: boolean) => void) => AccessibilitySubscription)
		| undefined;

	return addEventListener?.(eventName, handler);
}

export function useRuntimeQualitySignals(enabled = true): RuntimeQualitySignals {
	const [reduceMotionEnabled, setReduceMotionEnabled] = useState(
		DEFAULT_RUNTIME_QUALITY_SIGNALS.reduceMotionEnabled,
	);
	const [boldTextEnabled, setBoldTextEnabled] = useState(
		DEFAULT_RUNTIME_QUALITY_SIGNALS.boldTextEnabled,
	);
	const [detectedLocale] = useState(detectRuntimeLocale);
	const [fontScale] = useState(detectFontScale);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		let isActive = true;

		void Promise.all([
			readAccessibilityBoolean(AccessibilityInfo.isReduceMotionEnabled),
			readAccessibilityBoolean(AccessibilityInfo.isBoldTextEnabled),
		]).then(([reduceMotion, boldText]) => {
			if (!isActive) {
				return;
			}

			setReduceMotionEnabled(reduceMotion);
			setBoldTextEnabled(boldText);
		});

		const reduceMotionSubscription = addAccessibilityListener(
			'reduceMotionChanged',
			setReduceMotionEnabled,
		);
		const boldTextSubscription = addAccessibilityListener(
			'boldTextChanged',
			setBoldTextEnabled,
		);

		return () => {
			isActive = false;
			reduceMotionSubscription?.remove?.();
			boldTextSubscription?.remove?.();
		};
	}, [enabled]);

	return {
		detectedLocale,
		runtimeRtl: I18nManager.isRTL,
		fontScale,
		reduceMotionEnabled,
		boldTextEnabled,
	};
}
