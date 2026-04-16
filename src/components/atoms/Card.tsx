import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

interface CardProps {
	children: React.ReactNode;
	style?: StyleProp<ViewStyle>;
	variant?: 'elevated' | 'outlined' | 'flat';
	padding?: 'none' | 'sm' | 'md' | 'lg';
	accessible?: boolean;
	accessibilityLabel?: string;
	testID?: string;
}

export const Card: React.FC<CardProps> = ({
	children,
	style,
	variant = 'elevated',
	padding = 'md',
	accessible,
	accessibilityLabel,
	testID,
}) => {
	const { theme } = useTheme();
	const cardTokens = theme.components.card;

	const cardStyles = [
		styles.base,
		{ backgroundColor: theme.colors.card, borderRadius: cardTokens.radius },
		variant === 'elevated' && theme.elevation.raised,
		variant === 'outlined' && {
			borderWidth: theme.borderWidth.sm,
			borderColor: theme.colors.border,
		},
		variant === 'flat' && { backgroundColor: theme.colors.surfaceVariant },
		padding === 'sm' && { padding: cardTokens.padding.sm },
		padding === 'md' && { padding: cardTokens.padding.md },
		padding === 'lg' && { padding: cardTokens.padding.lg },
		style,
	];

	return (
		<View
			testID={testID}
			style={cardStyles as StyleProp<ViewStyle>}
			accessible={accessible}
			accessibilityLabel={accessibilityLabel}
		>
			{children}
		</View>
	);
};

const styles = StyleSheet.create({
	base: {},
});
