import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { DateRangePickerField } from '../DateRangePickerField';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('DateRangePickerField', () => {
	it('renders preset ranges', () => {
		const { getByText } = renderWithTheme(
			<DateRangePickerField label="Date range" onChange={jest.fn()} />,
		);
		expect(getByText('Last 7 days')).toBeTruthy();
		expect(getByText('This month')).toBeTruthy();
	});

	it('applies a preset range', () => {
		const onChange = jest.fn();
		const { getByText } = renderWithTheme(
			<DateRangePickerField label="Date range" onChange={onChange} />,
		);
		fireEvent.press(getByText('Last 7 days'));
		expect(onChange).toHaveBeenCalled();
	});
});
