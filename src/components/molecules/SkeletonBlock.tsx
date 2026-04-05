import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { withOpacity } from '@/src/utils/color';

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

	return (
		<View
			accessibilityElementsHidden={true}
			importantForAccessibility="no-hide-descendants"
			style={[
				{
					width,
					height,
					borderRadius: borderRadius ?? r.sm,
					backgroundColor: withOpacity(c.onSurface, 0.08),
				},
				style,
			]}
		/>
	);
}
