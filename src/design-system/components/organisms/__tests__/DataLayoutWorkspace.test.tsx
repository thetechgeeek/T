import React from 'react';
import { act, fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { DataLayoutWorkspace } from '../DataLayoutWorkspace';

describe('DataLayoutWorkspace', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	it('switches drill-down focus, refreshes sectioned lists, and records swipe interactions', () => {
		const { getAllByTestId, getByTestId, getByText } = renderWithTheme(<DataLayoutWorkspace />);

		fireEvent.press(getByTestId('data-layout-workspace-metric-blocked-orders'));

		expect(getByText('Blocked orders drill-down')).toBeTruthy();
		expect(getByText('Approval queue')).toBeTruthy();

		fireEvent.press(getAllByTestId('swipeable-archive-btn')[0]);
		expect(getByText('Latest interaction')).toBeTruthy();

		fireEvent.press(getByText('Refresh'));
		act(() => {
			jest.runOnlyPendingTimers();
		});

		expect(getByText('Updated just now')).toBeTruthy();
	});
});
