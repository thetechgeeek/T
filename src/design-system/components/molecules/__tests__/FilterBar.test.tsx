import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterBar } from '../FilterBar';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

const FILTERS = [
	{ label: 'All', value: 'all' },
	{ label: 'Paid', value: 'paid' },
	{ label: 'Unpaid', value: 'unpaid' },
];

describe('FilterBar', () => {
	it('renders all filter chips', () => {
		const { getByText } = renderWithTheme(
			<FilterBar filters={FILTERS} activeValue="all" onSelect={jest.fn()} />,
		);
		expect(getByText('All')).toBeTruthy();
		expect(getByText('Paid')).toBeTruthy();
		expect(getByText('Unpaid')).toBeTruthy();
	});

	it('calls onSelect with chip value when pressed', () => {
		const onSelect = jest.fn();
		const { getByText } = renderWithTheme(
			<FilterBar filters={FILTERS} activeValue="all" onSelect={onSelect} />,
		);
		fireEvent.press(getByText('Paid'));
		expect(onSelect).toHaveBeenCalledWith('paid');
	});

	it('marks active chip with testID active', () => {
		const { getByTestId } = renderWithTheme(
			<FilterBar filters={FILTERS} activeValue="paid" onSelect={jest.fn()} />,
		);
		expect(getByTestId('chip-paid-active')).toBeTruthy();
	});

	it('shows Clear All when non-default filter active and defaultValue provided', () => {
		const { getByText } = renderWithTheme(
			<FilterBar
				filters={FILTERS}
				activeValue="paid"
				onSelect={jest.fn()}
				defaultValue="all"
				onClear={jest.fn()}
			/>,
		);
		expect(getByText('Clear')).toBeTruthy();
	});

	it('does not show Clear when active is default', () => {
		const { queryByText } = renderWithTheme(
			<FilterBar
				filters={FILTERS}
				activeValue="all"
				onSelect={jest.fn()}
				defaultValue="all"
				onClear={jest.fn()}
			/>,
		);
		expect(queryByText('Clear')).toBeNull();
	});

	it('calls onClear when Clear chip pressed', () => {
		const onClear = jest.fn();
		const { getByText } = renderWithTheme(
			<FilterBar
				filters={FILTERS}
				activeValue="paid"
				onSelect={jest.fn()}
				defaultValue="all"
				onClear={onClear}
			/>,
		);
		fireEvent.press(getByText('Clear'));
		expect(onClear).toHaveBeenCalledTimes(1);
	});
});
