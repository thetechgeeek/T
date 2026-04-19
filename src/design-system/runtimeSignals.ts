import { AccessibilityInfo, Dimensions, I18nManager, PixelRatio, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { detectDeviceLocale } from '@/src/i18n/runtime';
import { detectPixelRatio } from '@/src/theme/density';
import {
	resolveResponsiveMetrics,
	type ResponsiveBreakpoint,
	type ResponsiveDeviceType,
	type ResponsiveOrientation,
} from '@/src/theme/responsive';

const FONT_SCALE_DECIMALS = 2;
const DEFAULT_WINDOW_WIDTH = 390;
const DEFAULT_WINDOW_HEIGHT = 844;

type AccessibilitySubscription = { remove?: () => void } | undefined;
type DimensionSubscription = { remove?: () => void } | undefined;

function getWindowDimensions() {
	const window = Dimensions.get('window');
	return {
		width: window?.width ?? DEFAULT_WINDOW_WIDTH,
		height: window?.height ?? DEFAULT_WINDOW_HEIGHT,
	};
}

export interface RuntimeQualitySignals {
	detectedLocale: string;
	runtimeRtl: boolean;
	pixelRatio: number;
	fontScale: number;
	reduceMotionEnabled: boolean;
	boldTextEnabled: boolean;
	platform: string;
	windowWidth: number;
	windowHeight: number;
	orientation: ResponsiveOrientation;
	breakpoint: ResponsiveBreakpoint;
	deviceType: ResponsiveDeviceType;
	columns: number;
	supportsSplitPane: boolean;
	layoutScale: number;
	spacingScale: number;
	typographyScale: number;
}

const DEFAULT_DIMENSIONS = getWindowDimensions();
const DEFAULT_RESPONSIVE_METRICS = resolveResponsiveMetrics(
	DEFAULT_DIMENSIONS.width,
	DEFAULT_DIMENSIONS.height,
);

export const DEFAULT_RUNTIME_QUALITY_SIGNALS: RuntimeQualitySignals = {
	detectedLocale: detectDeviceLocale(),
	runtimeRtl: false,
	pixelRatio: detectPixelRatio(),
	fontScale: 1,
	reduceMotionEnabled: false,
	boldTextEnabled: false,
	platform: Platform.OS,
	windowWidth: DEFAULT_RESPONSIVE_METRICS.width,
	windowHeight: DEFAULT_RESPONSIVE_METRICS.height,
	orientation: DEFAULT_RESPONSIVE_METRICS.orientation,
	breakpoint: DEFAULT_RESPONSIVE_METRICS.breakpoint,
	deviceType: DEFAULT_RESPONSIVE_METRICS.deviceType,
	columns: DEFAULT_RESPONSIVE_METRICS.columns,
	supportsSplitPane: DEFAULT_RESPONSIVE_METRICS.supportsSplitPane,
	layoutScale: DEFAULT_RESPONSIVE_METRICS.layoutScale,
	spacingScale: DEFAULT_RESPONSIVE_METRICS.spacingScale,
	typographyScale: DEFAULT_RESPONSIVE_METRICS.typographyScale,
};

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

function addDimensionsListener(
	handler: (width: number, height: number) => void,
): DimensionSubscription {
	const subscription = Dimensions.addEventListener?.('change', ({ window }) => {
		handler(window.width, window.height);
	});

	return subscription;
}

export function useRuntimeQualitySignals(enabled = true): RuntimeQualitySignals {
	const [reduceMotionEnabled, setReduceMotionEnabled] = useState(
		DEFAULT_RUNTIME_QUALITY_SIGNALS.reduceMotionEnabled,
	);
	const [boldTextEnabled, setBoldTextEnabled] = useState(
		DEFAULT_RUNTIME_QUALITY_SIGNALS.boldTextEnabled,
	);
	const [detectedLocale] = useState(detectDeviceLocale);
	const [pixelRatio] = useState(detectPixelRatio);
	const [fontScale] = useState(detectFontScale);
	const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions);

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
		const dimensionsSubscription = addDimensionsListener((width, height) => {
			setWindowDimensions({ width, height });
		});

		return () => {
			isActive = false;
			reduceMotionSubscription?.remove?.();
			boldTextSubscription?.remove?.();
			dimensionsSubscription?.remove?.();
		};
	}, [enabled]);

	const responsiveMetrics = resolveResponsiveMetrics(
		windowDimensions.width,
		windowDimensions.height,
	);

	return {
		detectedLocale,
		runtimeRtl: I18nManager.isRTL,
		pixelRatio,
		fontScale,
		reduceMotionEnabled,
		boldTextEnabled,
		platform: Platform.OS,
		windowWidth: responsiveMetrics.width,
		windowHeight: responsiveMetrics.height,
		orientation: responsiveMetrics.orientation,
		breakpoint: responsiveMetrics.breakpoint,
		deviceType: responsiveMetrics.deviceType,
		columns: responsiveMetrics.columns,
		supportsSplitPane: responsiveMetrics.supportsSplitPane,
		layoutScale: responsiveMetrics.layoutScale,
		spacingScale: responsiveMetrics.spacingScale,
		typographyScale: responsiveMetrics.typographyScale,
	};
}
