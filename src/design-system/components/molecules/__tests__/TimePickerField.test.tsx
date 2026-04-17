import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { TimePickerField } from '../TimePickerField';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('TimePickerField', () => {
	it('renders the formatted time', () => {
		const { getByText } = renderWithTheme(
			<TimePickerField label="Meeting time" value="14:30" onChange={jest.fn()} />,
		);
		expect(getByText(/2:30/i)).toBeTruthy();
	});

	it('calls onChange when the native picker changes', () => {
		const onChange = jest.fn();
		const { getByLabelText, getByTestId } = renderWithTheme(
			<TimePickerField label="Meeting time" value="09:00" onChange={onChange} />,
		);
		fireEvent.press(getByLabelText(/Meeting time/i));
		fireEvent(
			getByTestId('native-time-picker'),
			'onChange',
			{
				type: 'set',
			},
			new Date(2026, 0, 1, 16, 45),
		);
		expect(onChange).toHaveBeenCalledWith('16:45');
	});
});
