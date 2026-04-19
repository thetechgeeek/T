import React from 'react';
import { act, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { SearchFilterWorkspace } from '../SearchFilterWorkspace';

describe('SearchFilterWorkspace', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		act(() => {
			jest.runOnlyPendingTimers();
		});
		jest.useRealTimers();
	});

	it('supports suggestions, recent searches, and the mobile filter sheet', () => {
		const { getByLabelText, getByPlaceholderText, getByText } = renderWithTheme(
			<SearchFilterWorkspace />,
		);

		fireEvent.changeText(
			getByPlaceholderText('Search customers, projects, or approval packs'),
			'northwind',
		);
		act(() => {
			jest.runOnlyPendingTimers();
		});

		expect(getByText('northwind supplier onboarding')).toBeTruthy();
		expect(getByLabelText('northwind supplier onboarding')).toBeTruthy();
		expect(getByText('priority renewal')).toBeTruthy();

		fireEvent.press(getByText('Open mobile filters'));

		expect(getByText('Mobile filters')).toBeTruthy();
		expect(getByText('Active filters')).toBeTruthy();
		expect(getByText('Ops queue')).toBeTruthy();
	});

	it('uses debounce and escalates from no indicator to loading to progress based on latency', async () => {
		const { getByPlaceholderText, getByLabelText, getByText, queryByLabelText, queryByText } =
			renderWithTheme(<SearchFilterWorkspace />);
		const searchInput = getByPlaceholderText('Search customers, projects, or approval packs');

		fireEvent.changeText(searchInput, 'ops');
		act(() => {
			jest.advanceTimersByTime(300);
			jest.advanceTimersByTime(80);
		});
		expect(queryByLabelText('Search loading')).toBeNull();
		expect(queryByText('Large query progress')).toBeNull();

		fireEvent.changeText(searchInput, 'northwind');
		await act(async () => {
			jest.advanceTimersByTime(300);
			await Promise.resolve();
		});
		await waitFor(() => {
			expect(getByLabelText('Search loading')).toBeTruthy();
		});
		act(() => {
			jest.advanceTimersByTime(240);
		});
		expect(queryByLabelText('Search loading')).toBeNull();

		fireEvent.changeText(searchInput, 'northwind supplier onboarding');
		await act(async () => {
			jest.advanceTimersByTime(300);
			await Promise.resolve();
		});
		await waitFor(() => {
			expect(getByText('Large query progress')).toBeTruthy();
			expect(getByText('About 2s remaining')).toBeTruthy();
		});
	});
});
