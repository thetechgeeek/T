import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
	label: string;
	value: string | number;
	icon?: LucideIcon;
	color?: string;
	trend?: string;
	trendLabel?: string;
	style?: ViewStyle;
	/** Stable English identifier for screen readers and Maestro. Overrides computed label. */
	accessibilityLabel?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
	label,
	value,
	icon: Icon,
	color,
	trend,
	trendLabel,
	style,
	accessibilityLabel,
}) => {
	const { theme } = useTheme();
	const c = theme.colors;
	const r = theme.borderRadius;
	const s = theme.spacing;

	return (
		<View
			accessible={true}
			accessibilityLabel={accessibilityLabel ?? `${label}: ${value}`}
			style={[
				styles.container,
				{
					backgroundColor: c.card,
					borderRadius: r.md,
					padding: s.md,
					...(theme.shadows.md as object),
				},
				style,
			]}
		>
			{Icon && (
				<View style={styles.iconContainer} importantForAccessibility="no">
					<Icon size={20} color={color || c.primary} strokeWidth={2} />
				</View>
			)}
			<Text
				numberOfLines={1}
				adjustsFontSizeToFit
				style={[
					styles.value,
					{
						color: c.onSurface,
						fontSize: theme.typography.sizes['2xl'],
						fontWeight: theme.typography.weights.bold,
						marginTop: Icon ? 6 : 0,
					},
				]}
			>
				{value}
			</Text>
			<Text
				style={[
					styles.label,
					{
						color: c.onSurfaceVariant,
						fontSize: theme.typography.sizes.xs,
						fontWeight: theme.typography.weights.semibold,
					},
				]}
			>
				{label}
			</Text>

			{trend && (
				<View style={styles.trendRow}>
					<Text
						style={[
							styles.trend,
							{ color: trend.startsWith('+') ? c.success : c.error },
						]}
					>
						{trend}
					</Text>
					<Text
						style={[
							styles.trendLabel,
							{ color: c.onSurfaceVariant, fontSize: theme.typography.sizes.xs },
						]}
					>
						{trendLabel}
					</Text>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
	},
	iconContainer: {
		marginBottom: 2,
	},
	label: {
		marginTop: 2,
	},
	value: {},
	trendRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 4,
	},
	trend: {
		fontSize: 10,
		fontWeight: '700',
		marginRight: 4,
	},
	trendLabel: {},
});
