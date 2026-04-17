import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle, type StyleProp } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { withOpacity } from '@/src/utils/color';
import { OPACITY_TINT_LIGHT } from '@/theme/uiMetrics';
import { ThemedText } from './ThemedText';

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
	style?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
	size?: 'sm' | 'md';
	testID?: string;
	/** Stable English identifier for screen readers. Defaults to label. */
	accessibilityLabel?: string;
}

export const Badge: React.FC<BadgeProps> = ({
	label,
	variant = 'primary',
	style,
	textStyle,
	size = 'md',
	testID,
	accessibilityLabel,
}) => {
	const { theme } = useTheme();
	const badgeTokens = theme.components.badge;

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
			testID={testID}
			accessible={true}
			accessibilityLabel={accessibilityLabel ?? label}
			style={[
				styles.container,
				{
					backgroundColor: bg,
					borderRadius: badgeTokens.radius,
					paddingHorizontal:
						size === 'sm' ? badgeTokens.paddingX.sm : badgeTokens.paddingX.md,
					paddingVertical:
						size === 'sm' ? badgeTokens.paddingY.sm : badgeTokens.paddingY.md,
				},
				style,
			]}
		>
			<ThemedText
				importantForAccessibility="no"
				variant="caption"
				weight="semibold"
				style={[
					styles.text,
					{
						color: text,
						fontSize:
							size === 'sm' ? theme.typography.sizes.xs : theme.typography.sizes.sm,
						fontFamily: theme.typography.fontFamilyBold,
					},
					textStyle,
				]}
			>
				{label}
			</ThemedText>
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
