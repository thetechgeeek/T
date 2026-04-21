import React from 'react';
import * as Reanimated from 'react-native-reanimated';
import { SyncIndicator } from '../SyncIndicator';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';

describe('SyncIndicator', () => {
	it('renders synced state', () => {
		const { getByTestId } = renderWithTheme(<SyncIndicator status="synced" />);
		expect(getByTestId('sync-indicator-synced')).toBeTruthy();
	});

	it('renders syncing state', () => {
		const { getByTestId } = renderWithTheme(<SyncIndicator status="syncing" />);
		expect(getByTestId('sync-indicator-syncing')).toBeTruthy();
	});

	it('renders offline state', () => {
		const { getByTestId } = renderWithTheme(<SyncIndicator status="offline" />);
		expect(getByTestId('sync-indicator-offline')).toBeTruthy();
	});

	it('shows pending count when syncing', () => {
		const { getByText } = renderWithTheme(<SyncIndicator status="syncing" pendingCount={3} />);
		expect(getByText('3')).toBeTruthy();
	});

	it('does not show pending count when 0', () => {
		const { queryByText } = renderWithTheme(<SyncIndicator status="synced" pendingCount={0} />);
		expect(queryByText('0')).toBeNull();
	});

	it('skips spin animation when reduced motion is enabled', () => {
		const repeatSpy = jest.spyOn(Reanimated, 'withRepeat');
		const timingSpy = jest.spyOn(Reanimated, 'withTiming');

		const { getByTestId } = renderWithTheme(<SyncIndicator status="syncing" />, {
			themeProviderProps: {
				persist: false,
				runtimeOverrides: { reduceMotionEnabled: true },
			},
		});

		expect(getByTestId('sync-indicator-syncing')).toBeTruthy();
		expect(repeatSpy).not.toHaveBeenCalled();
		expect(timingSpy).not.toHaveBeenCalled();
	});
});
