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
});
