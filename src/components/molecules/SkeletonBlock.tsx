import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { withOpacity } from '@/src/utils/color';
import { useSkeletonShimmer } from '@/src/hooks/useSkeletonShimmer';

interface SkeletonBlockProps {
	width?: number | `${number}%`;
	height?: number;
	borderRadius?: number;
	style?: StyleProp<ViewStyle>;
}

export function SkeletonBlock({
	width = '100%',
	height = 16,
	borderRadius,
	style,
}: SkeletonBlockProps) {
	const { c, r } = useThemeTokens();
	const progress = useSkeletonShimmer();

	const shimmerStyle = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, [0, 1], [0.5, 1]),
	}));

	return (
		<Animated.View
			accessibilityElementsHidden={true}
			importantForAccessibility="no-hide-descendants"
			style={[
				{
					width,
					height,
					borderRadius: borderRadius ?? r.sm,
					backgroundColor: withOpacity(c.onSurface, 0.08),
				},
				shimmerStyle,
				style,
			]}
		/>
	);
}
