import React, { forwardRef, useMemo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, G, Line, Path, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { Chip } from '@/src/design-system/components/atoms/Chip';
import { EmptyState } from '@/src/design-system/components/molecules/EmptyState';
import { ErrorState } from '@/src/design-system/components/molecules/ErrorState';
import { SkeletonBlock } from '@/src/design-system/components/molecules/SkeletonBlock';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

export type DataChartVariant =
	| 'line'
	| 'bar'
	| 'area'
	| 'pie'
	| 'donut'
	| 'scatter'
	| 'heatmap'
	| 'sparkline';

export interface DataChartSeries {
	id: string;
	label: string;
	values: number[];
	color?: string;
}

export interface DataChartSlice {
	id: string;
	label: string;
	value: number;
	color?: string;
}

export interface DataChartPoint {
	id?: string;
	x: number;
	y: number;
	seriesId?: string;
}

export interface DataChartHeatmapCell {
	row: string;
	column: string;
	value: number;
}

export interface DataChartAnnotation {
	label: string;
	value: number;
}

export interface DataChartProps {
	title: string;
	description?: string;
	variant: DataChartVariant;
	categories?: string[];
	series?: DataChartSeries[];
	slices?: DataChartSlice[];
	points?: DataChartPoint[];
	heatmap?: DataChartHeatmapCell[];
	annotations?: DataChartAnnotation[];
	focusedSeriesId?: string;
	defaultFocusedSeriesId?: string;
	onFocusedSeriesChange?: (seriesId: string) => void;
	isLoading?: boolean;
	hasError?: boolean;
	emptyTitle?: string;
	emptyDescription?: string;
	density?: 'compact' | 'default';
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

const CHART_WIDTH = 312;
const CHART_HEIGHT = 176;
const SPARKLINE_HEIGHT = 72;
const PADDING_X = 24;
const PADDING_Y = 20;
const RETRY_CHART_LABEL = 'Retry chart';
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- SVG arc math uses 90deg as the top-origin offset.
const ARC_TOP_OFFSET_DEGREES = 90;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- muted comparison series need visible but subordinate emphasis.
const MUTED_SERIES_OPACITY = 0.28;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- grouped bars need slightly more breathing room than the raw series count.
const MIN_BAR_GROUP_DIVISOR = 1.5;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- non-focused bars stay readable at a lower emphasis.
const MUTED_BAR_OPACITY = 0.3;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- heatmap cells need a floor opacity so low values still register.
const HEATMAP_MIN_OPACITY = 0.18;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- pie and donut charts share a stable outer radius for layout consistency.
const POLAR_CHART_RADIUS = 58;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- the donut hole leaves enough room for segment readability.
const DONUT_INNER_RADIUS = 34;

function clamp(value: number, minimum: number, maximum: number) {
	return Math.min(Math.max(value, minimum), maximum);
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angle: number) {
	const angleInRadians = (angle - ARC_TOP_OFFSET_DEGREES) * (Math.PI / 180);
	return {
		x: centerX + radius * Math.cos(angleInRadians),
		y: centerY + radius * Math.sin(angleInRadians),
	};
}

function describeArc(
	centerX: number,
	centerY: number,
	radius: number,
	startAngle: number,
	endAngle: number,
) {
	const start = polarToCartesian(centerX, centerY, radius, endAngle);
	const end = polarToCartesian(centerX, centerY, radius, startAngle);
	const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

	return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${centerX} ${centerY} Z`;
}

function describeDonutSegment(
	centerX: number,
	centerY: number,
	outerRadius: number,
	innerRadius: number,
	startAngle: number,
	endAngle: number,
) {
	const outerStart = polarToCartesian(centerX, centerY, outerRadius, endAngle);
	const outerEnd = polarToCartesian(centerX, centerY, outerRadius, startAngle);
	const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle);
	const innerEnd = polarToCartesian(centerX, centerY, innerRadius, endAngle);
	const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

	return [
		`M ${outerStart.x} ${outerStart.y}`,
		`A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
		`L ${innerStart.x} ${innerStart.y}`,
		`A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
		'Z',
	].join(' ');
}

function buildPolylinePoints(
	values: number[],
	width: number,
	height: number,
	minimum: number,
	maximum: number,
) {
	if (values.length === 0) {
		return '';
	}

	const range = Math.max(1, maximum - minimum);
	const plotWidth = width - PADDING_X * 2;
	const plotHeight = height - PADDING_Y * 2;

	return values
		.map((value, index) => {
			const x =
				values.length === 1
					? width / 2
					: PADDING_X + (plotWidth / (values.length - 1)) * index;
			const y = PADDING_Y + plotHeight - ((value - minimum) / range) * plotHeight;
			return `${x},${y}`;
		})
		.join(' ');
}

export const DataChart = forwardRef<React.ElementRef<typeof View>, DataChartProps>(
	(
		{
			title,
			description,
			variant,
			categories = [],
			series = [],
			slices = [],
			points = [],
			heatmap = [],
			annotations = [],
			focusedSeriesId,
			defaultFocusedSeriesId,
			onFocusedSeriesChange,
			isLoading = false,
			hasError = false,
			emptyTitle = 'No chart data yet',
			emptyDescription,
			density = 'default',
			style,
			testID,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const [uncontrolledFocusedSeriesId, setUncontrolledFocusedSeriesId] = useState(
			defaultFocusedSeriesId ?? series[0]?.id,
		);

		const palette = theme.collections.chartQualitativeColors;
		const resolvedFocusedSeriesId = focusedSeriesId ?? uncontrolledFocusedSeriesId;
		const height = variant === 'sparkline' ? SPARKLINE_HEIGHT : CHART_HEIGHT;

		const chartSeries = useMemo(
			() =>
				series.map((entry, index) => ({
					...entry,
					color: entry.color ?? palette[index % palette.length] ?? theme.colors.primary,
				})),
			[palette, series, theme.colors.primary],
		);

		const chartSlices = useMemo(
			() =>
				slices.map((entry, index) => ({
					...entry,
					color: entry.color ?? palette[index % palette.length] ?? theme.colors.primary,
				})),
			[palette, slices, theme.colors.primary],
		);

		const allSeriesValues = chartSeries.flatMap((entry) => entry.values);
		const minValue = Math.min(
			...(allSeriesValues.length > 0 ? allSeriesValues : points.map((point) => point.y)),
			0,
		);
		const maxValue = Math.max(
			...(allSeriesValues.length > 0 ? allSeriesValues : points.map((point) => point.y)),
			1,
		);
		const xMax = Math.max(...points.map((point) => point.x), 1);
		const yMax = Math.max(...points.map((point) => point.y), 1);

		const setFocusedSeries = (seriesId: string) => {
			if (focusedSeriesId === undefined) {
				setUncontrolledFocusedSeriesId(seriesId);
			}
			onFocusedSeriesChange?.(seriesId);
		};

		if (isLoading) {
			return (
				<View ref={ref} testID={testID} style={[style, { gap: theme.spacing.sm }]}>
					<SkeletonBlock
						testID={testID ? `${testID}-title-skeleton` : 'data-chart-title-skeleton'}
						width="45%"
						height={18}
					/>
					<SkeletonBlock
						testID={testID ? `${testID}-body-skeleton` : 'data-chart-body-skeleton'}
						width="100%"
						height={height}
					/>
				</View>
			);
		}

		if (hasError) {
			return (
				<ErrorState
					variant="server"
					style={style}
					actionLabel={RETRY_CHART_LABEL}
					onAction={() => undefined}
				/>
			);
		}

		const hasContent =
			chartSeries.some((entry) => entry.values.length > 0) ||
			chartSlices.length > 0 ||
			points.length > 0 ||
			heatmap.length > 0;

		if (!hasContent) {
			return (
				<EmptyState
					title={emptyTitle}
					description={emptyDescription}
					style={style}
					testID={testID ? `${testID}-empty` : undefined}
				/>
			);
		}

		return (
			<View
				ref={ref}
				testID={testID}
				accessible={true}
				accessibilityRole="image"
				accessibilityLabel={[title, description].filter(Boolean).join('. ')}
				style={[styles.container, { gap: theme.spacing.sm }, style]}
			>
				<View style={{ gap: theme.spacing.xxs }}>
					<ThemedText variant="bodyStrong" style={{ color: theme.colors.onSurface }}>
						{title}
					</ThemedText>
					{description ? (
						<ThemedText
							variant="caption"
							style={{ color: theme.colors.onSurfaceVariant }}
						>
							{description}
						</ThemedText>
					) : null}
				</View>

				{chartSeries.length > 1 ? (
					<View style={styles.legendRow}>
						{chartSeries.map((entry) => (
							<Chip
								key={entry.id}
								label={entry.label}
								selected={resolvedFocusedSeriesId === entry.id}
								onPress={() => setFocusedSeries(entry.id)}
								style={{ backgroundColor: entry.color }}
							/>
						))}
					</View>
				) : null}

				<Svg
					width={CHART_WIDTH}
					height={height}
					testID={testID ? `${testID}-svg` : 'data-chart-svg'}
				>
					{variant !== 'pie' && variant !== 'donut' ? (
						<>
							{Array.from({ length: 4 }, (_, index) => {
								const y = PADDING_Y + ((height - PADDING_Y * 2) / 3) * index;
								return (
									<Line
										key={`grid-${index}`}
										x1={PADDING_X}
										y1={y}
										x2={CHART_WIDTH - PADDING_X}
										y2={y}
										stroke={theme.visual.data.quietGrid}
										strokeWidth={1}
									/>
								);
							})}
							{annotations.map((annotation) => {
								const range = Math.max(1, maxValue - minValue);
								const plotHeight = height - PADDING_Y * 2;
								const annotationY =
									PADDING_Y +
									plotHeight -
									((annotation.value - minValue) / range) * plotHeight;

								return (
									<G key={annotation.label}>
										<Line
											x1={PADDING_X}
											y1={annotationY}
											x2={CHART_WIDTH - PADDING_X}
											y2={annotationY}
											stroke={theme.visual.data.annotation}
											strokeWidth={1}
											strokeDasharray="4 4"
										/>
										<SvgText
											x={CHART_WIDTH - PADDING_X}
											y={annotationY - 4}
											textAnchor="end"
											fontSize={12}
											fill={theme.visual.data.annotation}
										>
											{annotation.label}
										</SvgText>
									</G>
								);
							})}
						</>
					) : null}

					{(variant === 'line' || variant === 'area' || variant === 'sparkline') &&
						chartSeries.map((entry) => {
							const lineOpacity =
								resolvedFocusedSeriesId && resolvedFocusedSeriesId !== entry.id
									? MUTED_SERIES_OPACITY
									: 1;
							const pointsString = buildPolylinePoints(
								entry.values,
								CHART_WIDTH,
								height,
								minValue,
								maxValue,
							);

							return (
								<G key={entry.id} opacity={lineOpacity}>
									{variant === 'area' ? (
										<Path
											d={`${pointsString
												.split(' ')
												.map((point, index) =>
													index === 0 ? `M ${point}` : `L ${point}`,
												)
												.join(
													' ',
												)} L ${CHART_WIDTH - PADDING_X},${height - PADDING_Y} L ${PADDING_X},${height - PADDING_Y} Z`}
											fill={entry.color}
											opacity={0.18}
										/>
									) : null}
									<Polyline
										points={pointsString}
										fill="none"
										stroke={entry.color}
										strokeWidth={variant === 'sparkline' ? 2 : 3}
									/>
								</G>
							);
						})}

					{variant === 'bar' &&
						chartSeries.map((entry, seriesIndex) => {
							const range = Math.max(1, maxValue - minValue);
							const plotWidth = CHART_WIDTH - PADDING_X * 2;
							const plotHeight = height - PADDING_Y * 2;
							const groupWidth = plotWidth / Math.max(entry.values.length, 1);
							const barWidth =
								groupWidth / Math.max(chartSeries.length, MIN_BAR_GROUP_DIVISOR);
							const lineOpacity =
								resolvedFocusedSeriesId && resolvedFocusedSeriesId !== entry.id
									? MUTED_BAR_OPACITY
									: 1;

							return entry.values.map((value, index) => {
								const barHeight = ((value - minValue) / range) * plotHeight;
								return (
									<Rect
										key={`${entry.id}-${index}`}
										x={PADDING_X + groupWidth * index + barWidth * seriesIndex}
										y={height - PADDING_Y - barHeight}
										width={barWidth - 4}
										height={barHeight}
										rx={4}
										fill={entry.color}
										opacity={lineOpacity}
									/>
								);
							});
						})}

					{variant === 'scatter' &&
						points.map((point, index) => {
							const x =
								PADDING_X +
								(point.x / Math.max(1, xMax)) * (CHART_WIDTH - PADDING_X * 2);
							const y =
								height -
								PADDING_Y -
								(point.y / Math.max(1, yMax)) * (height - PADDING_Y * 2);
							const color =
								point.seriesId &&
								chartSeries.find((entry) => entry.id === point.seriesId)?.color
									? chartSeries.find((entry) => entry.id === point.seriesId)
											?.color
									: (palette[index % palette.length] ?? theme.colors.primary);
							const pointOpacity =
								point.seriesId &&
								resolvedFocusedSeriesId &&
								resolvedFocusedSeriesId !== point.seriesId
									? MUTED_SERIES_OPACITY
									: 1;
							return (
								<Circle
									key={point.id ?? index}
									cx={x}
									cy={y}
									r={5}
									fill={color}
									opacity={pointOpacity}
								/>
							);
						})}

					{variant === 'heatmap' &&
						(() => {
							const rows = Array.from(new Set(heatmap.map((cell) => cell.row)));
							const columns = Array.from(new Set(heatmap.map((cell) => cell.column)));
							const cellWidth =
								(CHART_WIDTH - PADDING_X * 2) / Math.max(1, columns.length);
							const cellHeight = (height - PADDING_Y * 2) / Math.max(1, rows.length);
							const maximum = Math.max(...heatmap.map((cell) => cell.value), 1);

							return heatmap.map((cell) => {
								const rowIndex = rows.indexOf(cell.row);
								const columnIndex = columns.indexOf(cell.column);
								const opacity = clamp(cell.value / maximum, HEATMAP_MIN_OPACITY, 1);
								return (
									<Rect
										key={`${cell.row}-${cell.column}`}
										x={PADDING_X + columnIndex * cellWidth}
										y={PADDING_Y + rowIndex * cellHeight}
										width={cellWidth - 4}
										height={cellHeight - 4}
										rx={6}
										fill={theme.visual.data.focusSeries}
										opacity={opacity}
									/>
								);
							});
						})()}

					{(variant === 'pie' || variant === 'donut') &&
						(() => {
							const total = chartSlices.reduce((sum, slice) => sum + slice.value, 0);
							let startAngle = 0;
							return chartSlices.map((slice) => {
								const sweep = (slice.value / Math.max(total, 1)) * 360;
								const endAngle = startAngle + sweep;
								const path =
									variant === 'donut'
										? describeDonutSegment(
												CHART_WIDTH / 2,
												height / 2,
												POLAR_CHART_RADIUS,
												DONUT_INNER_RADIUS,
												startAngle,
												endAngle,
											)
										: describeArc(
												CHART_WIDTH / 2,
												height / 2,
												POLAR_CHART_RADIUS,
												startAngle,
												endAngle,
											);
								startAngle = endAngle;
								return <Path key={slice.id} d={path} fill={slice.color} />;
							});
						})()}

					{variant !== 'sparkline' && categories.length > 0 ? (
						<G>
							{categories.slice(0, 4).map((category, index) => {
								const x =
									PADDING_X +
									((CHART_WIDTH - PADDING_X * 2) /
										Math.max(categories.length - 1, 1)) *
										index;
								return (
									<SvgText
										key={category}
										x={x}
										y={height - 4}
										fontSize={12}
										textAnchor="middle"
										fill={theme.colors.onSurfaceVariant}
									>
										{category}
									</SvgText>
								);
							})}
						</G>
					) : null}
				</Svg>

				{variant !== 'sparkline' ? (
					<ThemedText
						variant={density === 'compact' ? 'caption' : 'metadata'}
						style={{ color: theme.colors.onSurfaceVariant }}
					>
						Charts stay text-backed and quiet-first so interpretation wins over
						decoration.
					</ThemedText>
				) : null}
			</View>
		);
	},
);

DataChart.displayName = 'DataChart';

const styles = StyleSheet.create({
	container: {
		alignSelf: 'stretch',
	},
	legendRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING_PX.sm,
	},
});
