import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { buildTheme } from '@/src/theme/colors';
import { DataChart } from '../DataChart';

const lightTheme = buildTheme(false);

const categories = ['Jan', 'Feb', 'Mar', 'Apr'];
const series = [
	{ id: 'primary-series', label: 'Collections', values: [12, 18, 15, 24] },
	{ id: 'secondary-series', label: 'Returns', values: [4, 6, 3, 5] },
];
const slices = [
	{ id: 'paid', label: 'Paid', value: 72 },
	{ id: 'due', label: 'Due', value: 28 },
];
const points = [
	{ id: 'point-1', x: 1, y: 4, seriesId: 'primary-series' },
	{ id: 'point-2', x: 2, y: 7, seriesId: 'secondary-series' },
];
const heatmap = [
	{ row: 'Week 1', column: 'East', value: 0.4 },
	{ row: 'Week 1', column: 'West', value: 0.9 },
	{ row: 'Week 2', column: 'East', value: 0.7 },
	{ row: 'Week 2', column: 'West', value: 0.2 },
];

describe('DataChart', () => {
	it('renders accessible chart copy, annotation markers, and focus-series controls', () => {
		const onFocusedSeriesChange = jest.fn();
		const { getByLabelText, getByText, toJSON } = renderWithTheme(
			<DataChart
				title="Collections trend"
				description="Weekly comparison across two series."
				variant="line"
				categories={categories}
				series={series}
				annotations={[{ label: 'Target', value: 20 }]}
				focusedSeriesId="primary-series"
				onFocusedSeriesChange={onFocusedSeriesChange}
				testID="line-chart"
			/>,
		);

		expect(
			getByLabelText('Collections trend. Weekly comparison across two series.'),
		).toBeTruthy();
		expect(getByText('Target')).toBeTruthy();

		fireEvent.press(getByText('Returns'));

		expect(onFocusedSeriesChange).toHaveBeenCalledWith('secondary-series');
		expect(JSON.stringify(toJSON())).toContain(
			lightTheme.collections.chartQualitativeColors[0] ?? '',
		);
		expect(JSON.stringify(toJSON())).toContain('"opacity":0.28');
		expect(JSON.stringify(toJSON())).toContain('"strokeDasharray":"8 4"');
	});

	it('uses patterns, stroke changes, and shape changes so charts do not rely on color alone', () => {
		const { toJSON } = renderWithTheme(
			<>
				<DataChart
					title="Pattern bars"
					variant="bar"
					categories={categories}
					series={series}
					testID="pattern-bars"
				/>
				<DataChart title="Pattern pie" variant="pie" slices={slices} testID="pattern-pie" />
				<DataChart
					title="Marker scatter"
					variant="scatter"
					points={points}
					series={series}
					testID="marker-scatter"
				/>
			</>,
		);

		const renderedTree = JSON.stringify(toJSON());

		expect(renderedTree).toContain('url(#pattern-bars-pattern-primary-series)');
		expect(renderedTree).toContain('url(#pattern-pie-pattern-paid)');
		expect(renderedTree).toContain('"width":10');
		expect(renderedTree).toContain('"strokeWidth":1.5');
	});

	it('renders every supported chart family through the shared SVG surface', () => {
		const variants = [
			{
				variant: 'line' as const,
				props: { categories, series },
			},
			{
				variant: 'bar' as const,
				props: { categories, series },
			},
			{
				variant: 'area' as const,
				props: { categories, series },
			},
			{
				variant: 'pie' as const,
				props: { slices },
			},
			{
				variant: 'donut' as const,
				props: { slices },
			},
			{
				variant: 'scatter' as const,
				props: { points, series },
			},
			{
				variant: 'heatmap' as const,
				props: { heatmap },
			},
			{
				variant: 'sparkline' as const,
				props: { series: [series[0]] },
			},
		];

		for (const entry of variants) {
			const { getByTestId, unmount } = renderWithTheme(
				<DataChart
					title={`Chart ${entry.variant}`}
					variant={entry.variant}
					testID={`chart-${entry.variant}`}
					{...entry.props}
				/>,
			);

			expect(getByTestId(`chart-${entry.variant}-svg`)).toBeTruthy();
			unmount();
		}
	});

	it('covers loading, empty, and error states', () => {
		const { getByTestId, getByText, rerender } = renderWithTheme(
			<DataChart title="Chart loading" variant="line" isLoading testID="loading-chart" />,
		);

		expect(
			getByTestId('loading-chart-title-skeleton', { includeHiddenElements: true }),
		).toBeTruthy();
		expect(
			getByTestId('loading-chart-body-skeleton', { includeHiddenElements: true }),
		).toBeTruthy();

		rerender(<DataChart title="Chart empty" variant="line" testID="empty-chart" />);
		expect(getByTestId('empty-chart-empty')).toBeTruthy();

		rerender(<DataChart title="Chart error" variant="line" hasError testID="error-chart" />);
		expect(getByText('Server error')).toBeTruthy();
		expect(getByText('Retry chart')).toBeTruthy();
	});
});
