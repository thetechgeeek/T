import React from 'react';
import { Platform } from 'react-native';
import { render } from '@testing-library/react-native';
import DesignSystemLayout from '@/app/design-system/_layout';

const mockStackSpy = jest.fn();

jest.mock('expo-router', () => ({
	Stack: (props: Record<string, unknown>) => {
		mockStackSpy(props);
		return null;
	},
}));

jest.mock('@/src/hooks/useThemeTokens', () => ({
	useThemeTokens: () => ({
		c: {
			background: '#101828',
		},
	}),
}));

describe('design-system route layout', () => {
	beforeEach(() => {
		mockStackSpy.mockClear();
	});

	it('keeps the workbench on a gesture-enabled native stack shell', () => {
		render(<DesignSystemLayout />);
		const recordedProps = mockStackSpy.mock.calls[0]?.[0] as
			| Record<string, unknown>
			| undefined;

		expect(mockStackSpy).toHaveBeenCalledTimes(1);
		expect(recordedProps).toEqual(
			expect.objectContaining({
				screenOptions: expect.objectContaining({
					headerShown: false,
					gestureEnabled: true,
					fullScreenGestureEnabled: Platform.OS === 'ios',
					contentStyle: { backgroundColor: '#101828' },
				}),
			}),
		);
	});
});
