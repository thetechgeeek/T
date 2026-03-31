import React from 'react';
import { renderWithTheme } from '../../../../__tests__/utils/renderWithTheme';
import { OfflineBanner } from '../OfflineBanner';

/**
 * OfflineBanner uses useNetworkStatus() internally (no isConnected prop).
 * We mock the hook to control connectivity state.
 */
jest.mock('@/src/hooks/useNetworkStatus', () => ({
	useNetworkStatus: jest.fn(),
}));

import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';

describe('OfflineBanner', () => {
	it('does NOT render when isConnected=true', () => {
		(useNetworkStatus as jest.Mock).mockReturnValue({ isConnected: true });

		const { queryByText } = renderWithTheme(<OfflineBanner />);
		expect(queryByText(/offline/i)).toBeNull();
		expect(queryByText(/no internet/i)).toBeNull();
	});

	it('DOES render when isConnected=false', () => {
		(useNetworkStatus as jest.Mock).mockReturnValue({ isConnected: false });

		const { getByText } = renderWithTheme(<OfflineBanner />);
		expect(getByText(/no internet connection/i)).toBeTruthy();
	});
});
