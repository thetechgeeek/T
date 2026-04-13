import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { withOpacity } from '@/src/utils/color';
import { OPACITY_TINT_LIGHT } from '@/theme/uiMetrics';

export type BadgeVariant =
	| 'primary'
	| 'success'
	| 'warning'
	| 'error'
	| 'info'
	| 'neutral'
	| 'paid'
	| 'partial'
	| 'unpaid'
	| 'default';

interface BadgeProps {
	label: string;
	variant?: BadgeVariant;
	style?: ViewStyle;
	textStyle?: TextStyle;
	size?: 'sm' | 'md';
	/** Stable English identifier for screen readers. Defaults to label. */
	accessibilityLabel?: string;
}

export const Badge: React.FC<BadgeProps> = ({
	label,
	variant = 'primary',
	style,
	textStyle,
	size = 'md',
	accessibilityLabel,
}) => {
	const { theme } = useTheme();

	const getVariantStyles = () => {
		switch (variant) {
			case 'success':
			case 'paid':
				return { bg: theme.colors.successLight, text: theme.colors.success };
			case 'warning':
			case 'partial':
				return { bg: theme.colors.warningLight, text: theme.colors.warning };
			case 'error':
			case 'unpaid':
				return { bg: theme.colors.errorLight, text: theme.colors.error };
			case 'info':
				return { bg: theme.colors.infoLight, text: theme.colors.info };
			case 'neutral':
				return { bg: theme.colors.surfaceVariant, text: theme.colors.onSurfaceVariant };
			case 'default':
			default:
				return {
					bg: withOpacity(theme.colors.primary, OPACITY_TINT_LIGHT),
					text: theme.colors.primary,
				};
		}
	};

	const { bg, text } = getVariantStyles();

	return (
		<View
			accessible={true}
			accessibilityLabel={accessibilityLabel ?? label}
			style={[
				styles.container,
				{
					backgroundColor: bg,
					borderRadius: theme.borderRadius.full,
					paddingHorizontal: size === 'sm' ? 6 : 10,
					paddingVertical: size === 'sm' ? 2 : 4,
				},
				style,
			]}
		>
			<Text
				importantForAccessibility="no"
				style={[
					styles.text,
					{
						color: text,
						fontSize:
							size === 'sm' ? theme.typography.sizes.xs : theme.typography.sizes.sm,
						fontWeight: theme.typography.weights.semibold,
						fontFamily: theme.typography.fontFamilyBold,
					},
					textStyle,
				]}
			>
				{label}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignSelf: 'flex-start',
		justifyContent: 'center',
		alignItems: 'center',
	},
	text: {
		textAlign: 'center',
	},
});
