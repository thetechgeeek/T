import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { withOpacity } from '@/src/utils/color';
import { useSkeletonShimmer } from '@/src/hooks/useSkeletonShimmer';
import { OPACITY_SKELETON_BASE, OPACITY_SKELETON_PEAK } from '@/theme/uiMetrics';

interface SkeletonBlockProps {
	width?: number | `${number}%`;
	height?: number;
	borderRadius?: number;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

export function SkeletonBlock({
	width = '100%',
	height = 16,
	borderRadius,
	style,
	testID,
}: SkeletonBlockProps) {
	const { c, r } = useThemeTokens();
	const progress = useSkeletonShimmer();

	const shimmerStyle = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, [0, 1], [OPACITY_SKELETON_PEAK, 1]),
	}));

	return (
		<Animated.View
			testID={testID}
			accessibilityElementsHidden={true}
			importantForAccessibility="no-hide-descendants"
			style={[
				{
					width,
					height,
					borderRadius: borderRadius ?? r.sm,
					backgroundColor: withOpacity(c.onSurface, OPACITY_SKELETON_BASE),
				},
				shimmerStyle,
				style,
			]}
		/>
	);
}
