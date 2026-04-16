import React from 'react';
import { Text, type TextProps, type TextStyle, type AccessibilityRole } from 'react-native';
import { DEFAULT_RUNTIME_QUALITY_SIGNALS } from '@/src/design-system/runtimeSignals';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { ThemeTypography } from '@/src/theme/index';

export interface ThemedTextProps extends TextProps {
	variant?: keyof ThemeTypography['variants'];
	color?: string;
	align?: TextStyle['textAlign'];
	weight?: keyof ThemeTypography['weights'];
	opacity?: number;
}

// h1/h2/h3 variants map to the 'header' role so VoiceOver/TalkBack announces them as headings
const HEADING_VARIANTS = new Set(['display', 'screenTitle', 'sectionTitle', 'h1', 'h2', 'h3']);
const ACCESSIBLE_WEIGHT_PROMOTION_MAP: Record<string, TextStyle['fontWeight']> = {
	'400': '500',
	'500': '600',
	'600': '700',
	normal: '500',
};

export function resolveAccessibleFontWeight(
	weight: TextStyle['fontWeight'] | undefined,
	boldTextEnabled: boolean,
) {
	if (!boldTextEnabled || weight == null) {
		return weight;
	}

	return ACCESSIBLE_WEIGHT_PROMOTION_MAP[String(weight)] ?? weight;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
	variant = 'body',
	color,
	align,
	weight,
	opacity,
	style,
	children,
	accessibilityRole,
	allowFontScaling,
	...rest
}) => {
	const { theme, runtime } = useTheme();
	const resolvedRuntime = runtime ?? DEFAULT_RUNTIME_QUALITY_SIGNALS;
	const variantStyle = theme.typography.variants[variant];
	const baseFontWeight = weight ? theme.typography.weights[weight] : variantStyle.fontWeight;
	const resolvedFontWeight = resolveAccessibleFontWeight(
		baseFontWeight,
		resolvedRuntime.boldTextEnabled,
	);

	const textStyle: TextStyle = {
		...variantStyle,
		color: color || variantStyle.color || theme.colors.onSurface,
		textAlign: align,
		opacity,
		fontWeight: resolvedFontWeight,
	};

	const resolvedRole: AccessibilityRole | undefined =
		accessibilityRole ?? (HEADING_VARIANTS.has(variant) ? 'header' : undefined);

	return (
		<Text
			style={[textStyle, style]}
			accessibilityRole={resolvedRole}
			allowFontScaling={allowFontScaling ?? true}
			maxFontSizeMultiplier={1.3}
			{...rest}
		>
			{children}
		</Text>
	);
};
