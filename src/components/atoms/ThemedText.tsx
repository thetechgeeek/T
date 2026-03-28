import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { ThemeTypography } from '@/src/theme/index';

export interface ThemedTextProps extends TextProps {
	variant?: keyof ThemeTypography['variants'];
	color?: string;
	align?: TextStyle['textAlign'];
	weight?: keyof ThemeTypography['weights'];
	opacity?: number;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
	variant = 'body2',
	color,
	align,
	weight,
	opacity,
	style,
	children,
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

	return (
		<Text style={[textStyle, style]} {...rest}>
			{children}
		</Text>
	);
};
