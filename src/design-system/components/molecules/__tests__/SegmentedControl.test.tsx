import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { SegmentedControl } from '../SegmentedControl';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('SegmentedControl', () => {
	it('forwards single-select changes', () => {
		const onChange = jest.fn();
		const { getByText } = renderWithTheme(
			<SegmentedControl
				options={[
					{ label: 'List', value: 'list' },
					{ label: 'Board', value: 'board' },
				]}
				onChange={onChange}
			/>,
		);
		fireEvent.press(getByText('Board'));
		expect(onChange).toHaveBeenCalledWith('board');
	});
});
