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
}

export const Card: React.FC<CardProps> = ({
	children,
	style,
	variant = 'elevated',
	padding = 'md',
	accessible,
	accessibilityLabel,
}) => {
	const { theme } = useTheme();

	const cardStyles = [
		styles.base,
		{ backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md },
		variant === 'elevated' && theme.shadows.sm,
		variant === 'outlined' && { borderWidth: 1, borderColor: theme.colors.border },
		variant === 'flat' && { backgroundColor: theme.colors.surfaceVariant },
		padding === 'sm' && { padding: theme.spacing.sm },
		padding === 'md' && { padding: theme.spacing.md },
		padding === 'lg' && { padding: theme.spacing.lg },
		style,
	];

	return (
		<View
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
