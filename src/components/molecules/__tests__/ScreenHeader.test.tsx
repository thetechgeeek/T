import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import { ScreenHeader } from '../ScreenHeader';

jest.mock('react-native-safe-area-context', () => ({
	useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
	SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/src/stores/syncStore', () => ({
	useSyncStore: jest.fn(() => ({
		lastSyncedAt: null,
		isSyncing: false,
		pendingCount: 0,
	})),
}));

jest.mock('@/src/hooks/useNetworkStatus', () => ({
	useNetworkStatus: jest.fn(() => ({ isConnected: true })),
}));

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: jest.fn(() => ({
		t: (key: string) => {
			switch (key) {
				case 'common.syncedJustNow':
					return 'Just now';
				case 'common.minsAgo':
					return 'mins ago';
				case 'common.syncedLongAgo':
					return 'Synced a while ago';
				default:
					return key;
			}
		},
	})),
}));

describe('ScreenHeader', () => {
	it('renders the title and handles the back action', () => {
		const onBack = jest.fn();
		const { getByText, getByLabelText } = renderWithTheme(
			<ScreenHeader title="Design Library" onBack={onBack} showSyncStatus={false} />,
		);

		expect(getByText('Design Library')).toBeTruthy();
		fireEvent.press(getByLabelText('Go back'));
		expect(onBack).toHaveBeenCalledTimes(1);
	});

	it('shows the sync helper text when sync status is enabled', () => {
		const { useSyncStore } = jest.requireMock('@/src/stores/syncStore') as {
			useSyncStore: jest.Mock;
		};

		useSyncStore.mockReturnValue({
			lastSyncedAt: new Date().toISOString(),
			isSyncing: false,
			pendingCount: 0,
		});

		const { getByText } = renderWithTheme(<ScreenHeader title="Design Library" />);

		expect(getByText('Just now')).toBeTruthy();
	});
});
