import React from 'react';
import * as Reanimated from 'react-native-reanimated';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import { OfflineBanner } from '../OfflineBanner';

describe('OfflineBanner', () => {
	it('does NOT render when isConnected=true', () => {
		const { queryByText } = renderWithTheme(<OfflineBanner />, {
			shellEnvironment: { isConnected: true },
		});
		expect(queryByText(/offline/i)).toBeNull();
		expect(queryByText(/no internet/i)).toBeNull();
	});

	it('DOES render when isConnected=false', () => {
		const { getByText } = renderWithTheme(<OfflineBanner />, {
			shellEnvironment: { isConnected: false },
		});
		expect(getByText(/no internet connection/i)).toBeTruthy();
	});

	it('skips banner entrance animation when reduced motion is enabled', () => {
		const springSpy = jest.spyOn(Reanimated, 'withSpring');
		const timingSpy = jest.spyOn(Reanimated, 'withTiming');

		const { getByText } = renderWithTheme(<OfflineBanner />, {
			shellEnvironment: { isConnected: false },
			themeProviderProps: {
				persist: false,
				runtimeOverrides: { reduceMotionEnabled: true },
			},
		});

		expect(getByText(/no internet connection/i)).toBeTruthy();
		expect(springSpy).not.toHaveBeenCalled();
		expect(timingSpy).not.toHaveBeenCalled();
	});
});
