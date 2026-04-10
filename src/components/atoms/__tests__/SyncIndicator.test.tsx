import React from 'react';
import { render } from '@testing-library/react-native';
import { SyncIndicator } from '../SyncIndicator';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

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
});
