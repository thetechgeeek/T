import React from 'react';
import { render } from '@testing-library/react-native';
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
});
