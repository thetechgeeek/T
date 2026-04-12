import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Button } from '@/src/components/atoms/Button';

interface EmptyStateProps {
	title: string;
	description?: string;
	subtitle?: string;
	icon?: React.ReactNode;
	actionLabel?: string;
	onAction?: () => void;
	style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
	title,
	description,
	subtitle,
	icon,
	actionLabel,
	onAction,
	style,
}) => {
	const { theme } = useTheme();

	return (
		<View style={[styles.container, style]}>
			{icon && (
				<View style={styles.icon} importantForAccessibility="no">
					{icon}
				</View>
			)}
			<Text
				accessibilityRole="header"
				style={[
					styles.title,
					{
						color: theme.colors.onSurface,
						fontSize: theme.typography.sizes.xl,
						fontFamily: theme.typography.fontFamilyBold,
					},
				]}
			>
				{title}
			</Text>
			{!!(description || subtitle) && (
				<Text
					style={[
						styles.description,
						{
							color: theme.colors.onSurfaceVariant,
							fontSize: theme.typography.sizes.md,
							fontFamily: theme.typography.fontFamily,
						},
					]}
				>
					{description || subtitle}
				</Text>
			)}
			{actionLabel && onAction && (
				<Button
					title={actionLabel}
					onPress={onAction}
					variant="primary"
					style={styles.button}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
	icon: {
		marginBottom: 16,
	},
	title: {
		textAlign: 'center',
		marginBottom: 8,
	},
	description: {
		textAlign: 'center',
		marginBottom: 24,
	},
	button: {
		minWidth: 150,
	},
});
