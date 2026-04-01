import React from 'react';
import { Text, type TextProps, type TextStyle, type AccessibilityRole } from 'react-native';
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
const HEADING_VARIANTS = new Set(['h1', 'h2', 'h3']);

export const ThemedText: React.FC<ThemedTextProps> = ({
	variant = 'body2',
	color,
	align,
	weight,
	opacity,
	style,
	children,
	accessibilityRole,
	...rest
}) => {
	const { theme } = useTheme();

	const textStyle: TextStyle = {
		...theme.typography.variants[variant],
		color: color || theme.colors.onSurface,
		textAlign: align,
		opacity,
	};

	if (weight) {
		textStyle.fontWeight = theme.typography.weights[weight];
	}

	const resolvedRole: AccessibilityRole | undefined =
		accessibilityRole ?? (HEADING_VARIANTS.has(variant) ? 'header' : undefined);

	return (
		<Text style={[textStyle, style]} accessibilityRole={resolvedRole} {...rest}>
			{children}
		</Text>
	);
};
