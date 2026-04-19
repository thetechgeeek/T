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

	it('supports external-keyboard navigation with arrows, Home, and End', () => {
		const onChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<Tabs
				testID="tabs"
				options={[
					{ label: 'Overview', value: 'overview' },
					{ label: 'Approvals', value: 'approvals' },
					{ label: 'History', value: 'history' },
				]}
				onChange={onChange}
			/>,
		);

		fireEvent(getByTestId('tabs-overview'), 'keyPress', {
			nativeEvent: { key: 'ArrowRight' },
		});
		fireEvent(getByTestId('tabs-approvals'), 'keyPress', {
			nativeEvent: { key: 'End' },
		});
		fireEvent(getByTestId('tabs-history'), 'keyPress', {
			nativeEvent: { key: 'Home' },
		});

		expect(getByTestId('tabs-overview').props.focusable).toBe(true);
		expect(onChange).toHaveBeenNthCalledWith(1, 'approvals');
		expect(onChange).toHaveBeenNthCalledWith(2, 'history');
		expect(onChange).toHaveBeenNthCalledWith(3, 'overview');
	});
});
