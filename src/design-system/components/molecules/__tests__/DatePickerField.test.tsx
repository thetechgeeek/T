import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DatePickerField } from '../DatePickerField';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('DatePickerField', () => {
	it('renders the label', () => {
		const { getByText } = renderWithTheme(
			<DatePickerField label="Invoice Date" value="2025-04-05" onChange={jest.fn()} />,
		);
		expect(getByText('Invoice Date')).toBeTruthy();
	});

	it('displays date in DD MMM YYYY format', () => {
		const { getByText } = renderWithTheme(
			<DatePickerField label="Date" value="2025-04-05" onChange={jest.fn()} />,
		);
		expect(getByText('Apr 05, 2025')).toBeTruthy();
	});

	it('shows Today shortcut chip', () => {
		const { getByText } = renderWithTheme(
			<DatePickerField label="Date" value="2025-04-05" onChange={jest.fn()} showShortcuts />,
		);
		expect(getByText('Today')).toBeTruthy();
	});

	it('calls onChange with today ISO string when Today pressed', () => {
		const onChange = jest.fn();
		const { getByText } = renderWithTheme(
			<DatePickerField label="Date" value="2025-01-01" onChange={onChange} showShortcuts />,
		);
		fireEvent.press(getByText('Today'));
		expect(onChange).toHaveBeenCalledTimes(1);
		// The value should be a valid ISO date string
		const call = onChange.mock.calls[0][0] as string;
		expect(call).toMatch(/^\d{4}-\d{2}-\d{2}/);
	});

	it('renders without crashing when value is empty', () => {
		const { getByText } = renderWithTheme(
			<DatePickerField label="Date" value="" onChange={jest.fn()} />,
		);
		expect(getByText('Date')).toBeTruthy();
	});

	it('renders a locale-aware calendar sheet with disabled dates', () => {
		const { getByLabelText, getByText, getByTestId } = renderWithTheme(
			<DatePickerField
				label="Date"
				value="2025-04-05"
				onChange={jest.fn()}
				locale="en-US"
				presentation="sheet"
				disabledDates={['2025-04-06']}
			/>,
		);
		fireEvent.press(getByLabelText(/Date:/));
		expect(getByText('Sun')).toBeTruthy();
		expect(getByTestId('calendar-day-2025-04-06')).toHaveProp('disabled', true);
	});

	it('uses the native picker when requested', () => {
		const onChange = jest.fn();
		const { getByLabelText, getByTestId } = renderWithTheme(
			<DatePickerField
				label="Date"
				value="2025-04-05"
				onChange={onChange}
				presentation="native"
			/>,
		);
		fireEvent.press(getByLabelText(/Date:/));
		fireEvent(
			getByTestId('native-date-picker'),
			'onChange',
			{ type: 'set' },
			new Date('2025-04-08T00:00:00.000Z'),
		);
		expect(onChange).toHaveBeenCalledWith('2025-04-08');
	});
});
