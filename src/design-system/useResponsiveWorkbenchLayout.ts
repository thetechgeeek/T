import { useEffect, useMemo, useRef, useState } from 'react';
import {
	Dimensions,
	LayoutAnimation,
	Platform,
	UIManager,
	useWindowDimensions,
	type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeProvider';
import { resolveResponsiveMetrics } from '@/src/theme/responsive';

const COMPACT_PHONE_MAX_WIDTH = 560;

export interface ResponsiveWorkbenchLayout {
	width: number;
	height: number;
	breakpoint: 'phone' | 'tablet' | 'wide';
	deviceType: 'phone' | 'tablet';
	orientation: 'portrait' | 'landscape';
	isCompactPhone: boolean;
	isPhone: boolean;
	isTablet: boolean;
	isPortrait: boolean;
	isLandscape: boolean;
	supportsSplitPane: boolean;
	columns: number;
	layoutScale: number;
	spacingScale: number;
	typographyScale: number;
	safeAreaInsets: EdgeInsets;
	orientationChangeCount: number;
}

export function useResponsiveWorkbenchLayout(): ResponsiveWorkbenchLayout {
	const { runtime } = useTheme();
	const insets = useSafeAreaInsets();
	const { width, height } = useWindowDimensions();
	const [orientationChangeCount, setOrientationChangeCount] = useState(0);
	const lastOrientationRef = useRef(runtime.orientation);

	useEffect(() => {
		if (Platform.OS === 'android') {
			UIManager.setLayoutAnimationEnabledExperimental?.(true);
		}

		const subscription = Dimensions.addEventListener?.('change', ({ window }) => {
			const nextMetrics = resolveResponsiveMetrics(window.width, window.height);
			if (nextMetrics.orientation === lastOrientationRef.current) {
				return;
			}

			if (!runtime.reduceMotionEnabled) {
				LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
			}
			lastOrientationRef.current = nextMetrics.orientation;
			setOrientationChangeCount((count) => count + 1);
		});

		return () => subscription?.remove?.();
	}, [runtime.reduceMotionEnabled]);

	const metrics = useMemo(() => resolveResponsiveMetrics(width, height), [width, height]);

	useEffect(() => {
		lastOrientationRef.current = metrics.orientation;
	}, [metrics.orientation]);

	return {
		width: metrics.width,
		height: metrics.height,
		breakpoint: metrics.breakpoint,
		deviceType: metrics.deviceType,
		orientation: metrics.orientation,
		isCompactPhone: metrics.isPhone && width < COMPACT_PHONE_MAX_WIDTH,
		isPhone: metrics.isPhone,
		isTablet: metrics.isTablet,
		isPortrait: metrics.isPortrait,
		isLandscape: metrics.isLandscape,
		supportsSplitPane: metrics.supportsSplitPane,
		columns: metrics.columns,
		layoutScale: metrics.layoutScale,
		spacingScale: metrics.spacingScale,
		typographyScale: metrics.typographyScale,
		safeAreaInsets: insets,
		orientationChangeCount,
	};
}

export function responsiveCardStyle(
	isCompactPhone: boolean,
	minWidth: number,
	options: {
		flex?: number;
	} = {},
): ViewStyle {
	if (isCompactPhone) {
		return {
			width: '100%',
			minWidth: 0,
			flexBasis: '100%',
			flexGrow: 0,
			flexShrink: 1,
		};
	}

	if (options.flex === 0) {
		return { minWidth };
	}

	return {
		flex: options.flex ?? 1,
		minWidth,
	};
}

export function stackOnPhoneRowStyle(
	isCompactPhone: boolean,
	options: {
		gap: number;
		alignItems?: ViewStyle['alignItems'];
		justifyContent?: ViewStyle['justifyContent'];
		wrap?: boolean;
	},
): ViewStyle {
	if (isCompactPhone) {
		return {
			flexDirection: 'column',
			gap: options.gap,
			alignItems: 'stretch',
			flexWrap: 'nowrap',
		};
	}

	return {
		flexDirection: 'row',
		gap: options.gap,
		alignItems: options.alignItems,
		justifyContent: options.justifyContent,
		flexWrap: options.wrap === false ? 'nowrap' : 'wrap',
	};
}
