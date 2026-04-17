import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import type { LucideIcon } from 'lucide-react-native';
import { LucideIconGlyph } from '@/src/design-system/iconography';
import { SkeletonBlock } from '@/src/design-system/components/molecules/SkeletonBlock';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

interface StatCardProps {
	label: string;
	value: string | number;
	icon?: LucideIcon;
	color?: string;
	trend?: string;
	trendLabel?: string;
	comparisonBaseline?: string;
	updatedAtLabel?: string;
	sparklineValues?: number[];
	isLoading?: boolean;
	errorMessage?: string;
	density?: 'compact' | 'default';
	style?: StyleProp<ViewStyle>;
	testID?: string;
	/** Stable English identifier for screen readers and Maestro. Overrides computed label. */
	accessibilityLabel?: string;
}

function buildSparklinePoints(values: number[]) {
	if (values.length === 0) {
		return '';
	}

	const width = 88;
	const height = 28;
	const max = Math.max(...values, 1);
	const min = Math.min(...values, 0);
	const range = Math.max(1, max - min);

	return values
		.map((value, index) => {
			const x = values.length === 1 ? width / 2 : (width / (values.length - 1)) * index;
			const y = height - ((value - min) / range) * height;
			return `${x},${y}`;
		})
		.join(' ');
}

export const StatCard: React.FC<StatCardProps> = ({
	label,
	value,
	icon: Icon,
	color,
	trend,
	trendLabel,
	comparisonBaseline,
	updatedAtLabel,
	sparklineValues = [],
	isLoading = false,
	errorMessage,
	density = 'default',
	style,
	testID,
	accessibilityLabel,
}) => {
	const { theme } = useTheme();
	const c = theme.colors;
	const r = theme.borderRadius;
	const s = theme.spacing;
	const isCompact = density === 'compact';

	if (isLoading) {
		return (
			<View
				testID={testID}
				style={[
					styles.container,
					{
						backgroundColor: c.card,
						borderRadius: r.md,
						padding: isCompact ? s.sm : s.md,
						...(theme.shadows.md as object),
					},
					style,
				]}
			>
				<SkeletonBlock width="48%" height={12} />
				<SkeletonBlock width="62%" height={24} style={{ marginTop: s.sm }} />
				<SkeletonBlock width="54%" height={10} style={{ marginTop: s.sm }} />
			</View>
		);
	}

	return (
		<View
			testID={testID}
			accessible={true}
			accessibilityLabel={
				accessibilityLabel ??
				[label, value, comparisonBaseline, updatedAtLabel].filter(Boolean).join('. ')
			}
			accessibilityRole="summary"
			style={[
				styles.container,
				{
					backgroundColor: c.card,
					borderRadius: r.md,
					padding: isCompact ? s.sm : s.md,
					...(theme.shadows.md as object),
				},
				style,
			]}
		>
			{Icon ? (
				<View style={styles.iconContainer} importantForAccessibility="no">
					<LucideIconGlyph
						icon={Icon}
						size={20}
						color={color || c.primary}
						strokeWidth={2}
					/>
				</View>
			) : null}
			<ThemedText
				variant="metric"
				numberOfLines={1}
				adjustsFontSizeToFit
				style={[
					styles.value,
					{
						color: c.onSurface,
						fontSize: isCompact
							? theme.typography.sizes.xl
							: theme.typography.sizes['2xl'],
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

			{sparklineValues.length > 0 ? (
				<View style={{ marginTop: s.sm }}>
					<Svg width={88} height={28} testID="stat-card-sparkline">
						<Polyline
							points={buildSparklinePoints(sparklineValues)}
							fill="none"
							stroke={color || c.primary}
							strokeWidth={2}
						/>
					</Svg>
				</View>
			) : null}

			{trend ? (
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
					{trendLabel ? (
						<ThemedText
							variant="caption"
							style={[
								styles.trendLabel,
								{ color: c.onSurfaceVariant, fontSize: theme.typography.sizes.xs },
							]}
						>
							{trendLabel}
						</ThemedText>
					) : null}
				</View>
			) : null}

			{comparisonBaseline ? (
				<ThemedText
					variant="caption"
					style={[styles.comparisonBaseline, { color: c.onSurfaceVariant }]}
				>
					{comparisonBaseline}
				</ThemedText>
			) : null}

			{updatedAtLabel ? (
				<ThemedText
					variant="captionSmall"
					style={[styles.updatedAt, { color: c.onSurfaceVariant }]}
				>
					{updatedAtLabel}
				</ThemedText>
			) : null}

			{errorMessage ? (
				<ThemedText variant="caption" style={{ color: c.error, marginTop: s.sm }}>
					{errorMessage}
				</ThemedText>
			) : null}
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
		marginEnd: SPACING_PX.xs,
	},
	trendLabel: {},
	comparisonBaseline: {
		marginTop: SPACING_PX.xxs,
	},
	updatedAt: {
		marginTop: SPACING_PX.xxs,
	},
});
