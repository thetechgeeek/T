import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import type { LucideIcon } from 'lucide-react-native';
import { LucideIconGlyph } from '@/src/design-system/iconography';
import {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	type CardDensity,
} from '@/src/design-system/components/atoms/Card';
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
	density?: CardDensity;
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
	const s = theme.spacing;
	const isCompact = density === 'compact';
	const isRelaxed = density === 'relaxed';
	const metricFontSize = isCompact ? theme.typography.sizes.xl : theme.typography.sizes['2xl'];
	const iconSize = isCompact ? 18 : isRelaxed ? 22 : 20;
	const footerContent =
		trend || comparisonBaseline || updatedAtLabel || errorMessage ? (
			<CardFooter>
				<View
					style={{
						gap: isCompact ? s.xxs : s.xs,
					}}
				>
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
										{
											color: c.onSurfaceVariant,
											fontSize: theme.typography.sizes.xs,
										},
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
						<ThemedText variant="caption" style={{ color: c.error }}>
							{errorMessage}
						</ThemedText>
					) : null}
				</View>
			</CardFooter>
		) : undefined;

	if (isLoading) {
		return (
			<Card testID={testID} density={density} style={style}>
				<CardBody>
					<View style={{ gap: s.sm }}>
						<SkeletonBlock width="48%" height={12} />
						<SkeletonBlock width="62%" height={24} />
						<SkeletonBlock width="54%" height={10} />
					</View>
				</CardBody>
			</Card>
		);
	}

	return (
		<Card
			testID={testID}
			accessible={true}
			accessibilityRole="summary"
			accessibilityLabel={
				accessibilityLabel ??
				[label, value, comparisonBaseline, updatedAtLabel].filter(Boolean).join('. ')
			}
			density={density}
			style={style}
			header={
				<CardHeader>
					<View style={styles.headerRow}>
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
						{Icon ? (
							<View style={styles.iconContainer} importantForAccessibility="no">
								<LucideIconGlyph
									icon={Icon}
									size={iconSize}
									color={color || c.primary}
									strokeWidth={2}
								/>
							</View>
						) : null}
					</View>
				</CardHeader>
			}
			footer={footerContent}
		>
			<CardBody>
				<ThemedText
					variant="metric"
					numberOfLines={1}
					adjustsFontSizeToFit
					style={[
						styles.value,
						{
							color: c.onSurface,
							fontSize: metricFontSize,
							fontWeight: theme.typography.weights.bold,
						},
					]}
				>
					{value}
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
			</CardBody>
		</Card>
	);
};

const styles = StyleSheet.create({
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: SPACING_PX.sm,
	},
	iconContainer: {
		alignSelf: 'flex-start',
	},
	label: {},
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
