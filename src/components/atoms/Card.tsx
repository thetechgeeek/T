import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

interface CardProps {
	children: React.ReactNode;
	style?: ViewStyle;
	variant?: 'elevated' | 'outlined' | 'flat';
	padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
	children,
	style,
	variant = 'elevated',
	padding = 'md',
}) => {
	const { theme } = useTheme();

	const cardStyles = [
		styles.base,
		{ backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.md },
		variant === 'elevated' && {
			...Platform.select({
				ios: theme.shadows.sm,
				android: { elevation: 2 },
				default: {},
			}),
		},
		variant === 'outlined' && { borderWidth: 1, borderColor: theme.colors.border },
		variant === 'flat' && { backgroundColor: theme.colors.surfaceVariant },
		padding === 'sm' && { padding: theme.spacing.sm },
		padding === 'md' && { padding: theme.spacing.md },
		padding === 'lg' && { padding: theme.spacing.lg },
		style,
	];

	return <View style={cardStyles as any}>{children}</View>;
};

const styles = StyleSheet.create({
	base: {
		overflow: 'hidden',
	},
});
