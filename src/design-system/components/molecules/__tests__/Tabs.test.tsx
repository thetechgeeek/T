import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { Tabs } from '../Tabs';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('Tabs', () => {
	it('renders labels and badges', () => {
		const { getByText } = renderWithTheme(
			<Tabs
				options={[
					{ label: 'Overview', value: 'overview', badgeCount: 3 },
					{ label: 'Approvals', value: 'approvals' },
				]}
				onChange={jest.fn()}
			/>,
		);
		expect(getByText('Overview')).toBeTruthy();
		expect(getByText('3')).toBeTruthy();
	});

	it('changes the active tab on press', () => {
		const onChange = jest.fn();
		const { getByText } = renderWithTheme(
			<Tabs
				options={[
					{ label: 'Overview', value: 'overview' },
					{ label: 'Approvals', value: 'approvals' },
				]}
				onChange={onChange}
			/>,
		);
		fireEvent.press(getByText('Approvals'));
		expect(onChange).toHaveBeenCalledWith('approvals');
	});
});
