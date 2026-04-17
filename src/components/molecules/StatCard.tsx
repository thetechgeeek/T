import React from 'react';
import { View, StyleSheet, ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { LucideIcon } from 'lucide-react-native';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { ThemedText } from '@/src/components/atoms/ThemedText';

interface StatCardProps {
	label: string;
	value: string | number;
	icon?: LucideIcon;
	color?: string;
	trend?: string;
	trendLabel?: string;
	style?: StyleProp<ViewStyle>;
	testID?: string;
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
	testID,
	accessibilityLabel,
}) => {
	const { theme } = useTheme();
	const c = theme.colors;
	const r = theme.borderRadius;
	const s = theme.spacing;

	return (
		<View
			testID={testID}
			accessible={true}
			accessibilityLabel={accessibilityLabel ?? `${label}: ${value}`}
			accessibilityRole="summary"
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
			<ThemedText
				variant="metric"
				numberOfLines={1}
				adjustsFontSizeToFit
				style={[
					styles.value,
					{
						color: c.onSurface,
						fontSize: theme.typography.sizes['2xl'],
						fontWeight: theme.typography.weights.bold,
						marginTop: Icon ? s.xs : 0,
					},
				]}
			>
				{value}
			</ThemedText>
			<ThemedText
				variant="caption"
				weight="semibold"
				style={[
					styles.label,
					{
						color: c.onSurfaceVariant,
						fontSize: theme.typography.sizes.xs,
					},
				]}
			>
				{label}
			</ThemedText>

			{trend && (
				<View style={styles.trendRow}>
					<ThemedText
						variant="caption"
						weight="bold"
						style={[
							styles.trend,
							{
								color: trend.startsWith('+') ? c.success : c.error,
								fontSize: theme.typography.sizes.xs,
							},
						]}
					>
						{trend}
					</ThemedText>
					<ThemedText
						variant="caption"
						style={[
							styles.trendLabel,
							{ color: c.onSurfaceVariant, fontSize: theme.typography.sizes.xs },
						]}
					>
						{trendLabel}
					</ThemedText>
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
		marginBottom: SPACING_PX.xxs,
	},
	label: {
		marginTop: SPACING_PX.xxs,
	},
	value: {},
	trendRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: SPACING_PX.xs,
	},
	trend: {
		fontWeight: '700',
		marginRight: SPACING_PX.xs,
	},
	trendLabel: {},
});
