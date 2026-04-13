import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '@/app/(app)/(tabs)/_layout';
import { renderWithTheme } from '../../utils/renderWithTheme';

jest.mock('expo-router', () => {
	return {
		Tabs: () => null,
	};
});

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => {
			const map: Record<string, string> = {
				'common.error': 'Error',
				'common.retry': 'Retry',
			};
			return map[key] ?? key;
		},
	}),
}));

describe('TabLayout ErrorBoundary', () => {
	it('renders the error message and retries', () => {
		const retry = jest.fn();
		const { getByText } = renderWithTheme(
			<ErrorBoundary error={new Error('Tab failed')} retry={retry} />,
		);

		expect(getByText('Error')).toBeTruthy();
		expect(getByText('Tab failed')).toBeTruthy();

		fireEvent.press(getByText('Retry'));

		expect(retry).toHaveBeenCalled();
	});
});
