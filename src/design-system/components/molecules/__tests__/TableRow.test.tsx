import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { TableRow } from '../TableRow';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('TableRow', () => {
	it('renders header labels for header variant', () => {
		const { getByText } = renderWithTheme(
			<TableRow
				variant="header"
				columns={[{ label: 'Col A' }, { label: 'Col B' }, { label: 'Col C' }]}
			/>,
		);
		expect(getByText('Col A')).toBeTruthy();
		expect(getByText('Col B')).toBeTruthy();
		expect(getByText('Col C')).toBeTruthy();
	});

	it('renders values for default variant', () => {
		const { getByText } = renderWithTheme(
			<TableRow
				columns={[
					{ label: 'A', value: '1' },
					{ label: 'B', value: '2' },
				]}
			/>,
		);
		expect(getByText('1')).toBeTruthy();
		expect(getByText('2')).toBeTruthy();
	});

	it('supports width-based columns and text color overrides', () => {
		const { toJSON, getByText } = renderWithTheme(
			<TableRow
				variant="header"
				textColor="#ffffff"
				columns={[
					{ label: 'Date', width: 42 },
					{ label: 'Amount', width: 68, align: 'right' },
				]}
			/>,
		);

		expect(getByText('Date')).toBeTruthy();
		const json = toJSON() as {
			children: Array<{
				props: { style: Record<string, unknown> | Record<string, unknown>[] };
			}>;
		};
		const firstCellStyle = Array.isArray(json.children[0].props.style)
			? Object.assign({}, ...json.children[0].props.style)
			: json.children[0].props.style;
		expect(firstCellStyle.width).toBe(42);
	});

	it('shows a long-press tooltip when a dense label would otherwise truncate', () => {
		const longLabel =
			'Betriebsabschlussubersicht mit ausfuhrlicher Hierarchie und Eskalationshinweis';
		const { getByTestId, getByText } = renderWithTheme(
			<TableRow
				testID="table-row-overflow"
				variant="header"
				columns={[{ label: longLabel }]}
			/>,
		);

		fireEvent(getByText(longLabel), 'longPress');

		expect(getByTestId('table-row-overflow-tooltip-0')).toBeTruthy();
	});
});
