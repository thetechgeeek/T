import React from 'react';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { TrendingUp } from 'lucide-react-native';
import { StatCard } from '../StatCard';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

describe('StatCard', () => {
	it('renders label and value', () => {
		const { getByText } = renderWithTheme(<StatCard label="Today's Sales" value="₹12,500" />);
		expect(getByText("Today's Sales")).toBeTruthy();
		expect(getByText('₹12,500')).toBeTruthy();
	});

	it('renders numeric value', () => {
		const { getByText } = renderWithTheme(<StatCard label="Invoice Count" value={42} />);
		expect(getByText('42')).toBeTruthy();
	});

	it('renders zero value as "0" (not empty)', () => {
		const { getByText } = renderWithTheme(<StatCard label="Overdue" value={0} />);
		expect(getByText('0')).toBeTruthy();
	});

	it('renders icon when provided', () => {
		const { toJSON } = renderWithTheme(
			<StatCard label="Revenue" value="₹5000" icon={TrendingUp} />,
		);
		const json = JSON.stringify(toJSON());
		expect(json).toContain('TrendingUp');
	});

	it('does not render icon container when icon is not provided', () => {
		const { toJSON } = renderWithTheme(<StatCard label="Label" value="Val" />);
		const json = JSON.stringify(toJSON());
		expect(json).not.toContain('TrendingUp');
	});

	it('renders positive trend with + prefix', () => {
		const { getByText } = renderWithTheme(
			<StatCard label="Growth" value="₹1000" trend="+12%" trendLabel="vs last week" />,
		);
		expect(getByText('+12%')).toBeTruthy();
		expect(getByText('vs last week')).toBeTruthy();
	});

	it('renders negative trend', () => {
		const { getByText } = renderWithTheme(
			<StatCard label="Decline" value="₹500" trend="-5%" trendLabel="vs yesterday" />,
		);
		expect(getByText('-5%')).toBeTruthy();
	});

	it('does not render trend row when trend is undefined', () => {
		const { queryByText } = renderWithTheme(<StatCard label="Label" value="Val" />);
		expect(queryByText(/vs/)).toBeNull();
	});

	it('has accessible=true on the container', () => {
		const { toJSON } = renderWithTheme(<StatCard label="Stat" value="100" />);
		const json = JSON.stringify(toJSON());
		expect(json).toContain('"accessible":true');
	});

	it('surfaces comparison context, updated time, and sparkline metadata', () => {
		const { getByLabelText, getByTestId, getByText } = renderWithTheme(
			<StatCard
				label="Collections"
				value="₹9999"
				comparisonBaseline="vs last week"
				updatedAtLabel="Updated 3m ago"
				sparklineValues={[12, 18, 16, 22]}
			/>,
		);

		expect(getByTestId('stat-card-sparkline')).toBeTruthy();
		expect(getByText('vs last week')).toBeTruthy();
		expect(getByText('Updated 3m ago')).toBeTruthy();
		expect(getByLabelText('Collections. ₹9999. vs last week. Updated 3m ago')).toBeTruthy();
	});

	it('renders loading and error states', () => {
		const { getByTestId, getByText, queryByText, rerender } = renderWithTheme(
			<StatCard label="Loading stat" value="₹0" isLoading testID="loading-stat" />,
		);

		expect(getByTestId('loading-stat')).toBeTruthy();
		expect(queryByText('Loading stat')).toBeNull();

		rerender(
			<StatCard
				label="Errored stat"
				value="₹450"
				errorMessage="Could not refresh just now."
			/>,
		);

		expect(getByText('Could not refresh just now.')).toBeTruthy();
	});

	it('applies custom style prop', () => {
		const { toJSON } = renderWithTheme(
			<StatCard label="L" value="V" style={{ marginTop: SPACING_PX.xl }} />,
		);
		const json = JSON.stringify(toJSON());
		expect(json).toContain(String(SPACING_PX.xl));
	});
});
