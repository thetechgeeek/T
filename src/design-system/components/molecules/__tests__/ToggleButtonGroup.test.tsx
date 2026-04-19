import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { ToggleButtonGroup } from '../ToggleButtonGroup';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

const OPTIONS = [
	{ label: 'Day', value: 'day' },
	{ label: 'Week', value: 'week' },
	{ label: 'Month', value: 'month' },
];

describe('ToggleButtonGroup', () => {
	it('supports radio-style selection', () => {
		const onChange = jest.fn();
		const { getByText } = renderWithTheme(
			<ToggleButtonGroup options={OPTIONS} onChange={onChange} />,
		);
		fireEvent.press(getByText('Week'));
		expect(onChange).toHaveBeenCalledWith('week');
	});

	it('supports multi-select toggling', () => {
		const onChange = jest.fn();
		const { getByText } = renderWithTheme(
			<ToggleButtonGroup
				options={OPTIONS}
				multiple
				onChange={onChange}
				defaultValue={['day']}
			/>,
		);
		fireEvent.press(getByText('Week'));
		expect(onChange).toHaveBeenCalledWith(['day', 'week']);
	});

	it('supports external-keyboard arrows and Enter for single-select groups', () => {
		const onChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<ToggleButtonGroup testID="toggle-group" options={OPTIONS} onChange={onChange} />,
		);

		fireEvent(getByTestId('toggle-group-day'), 'keyPress', {
			nativeEvent: { key: 'ArrowRight' },
		});
		fireEvent(getByTestId('toggle-group-week'), 'keyPress', {
			nativeEvent: { key: 'End' },
		});
		fireEvent(getByTestId('toggle-group-month'), 'keyPress', {
			nativeEvent: { key: 'Home' },
		});
		fireEvent(getByTestId('toggle-group-day'), 'keyPress', {
			nativeEvent: { key: 'Enter' },
		});

		expect(getByTestId('toggle-group-day').props.focusable).toBe(true);
		expect(onChange).toHaveBeenNthCalledWith(1, 'week');
		expect(onChange).toHaveBeenNthCalledWith(2, 'month');
		expect(onChange).toHaveBeenNthCalledWith(3, 'day');
		expect(onChange).toHaveBeenCalledTimes(3);
	});
});
