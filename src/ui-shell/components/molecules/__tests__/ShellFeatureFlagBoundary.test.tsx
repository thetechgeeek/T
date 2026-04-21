import React from 'react';
import { Text } from 'react-native';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import { ShellFeatureFlagBoundary } from '../ShellFeatureFlagBoundary';

describe('ShellFeatureFlagBoundary', () => {
	it('renders children when the flag is enabled', () => {
		const { getByText } = renderWithTheme(
			<ShellFeatureFlagBoundary flag="OPS_EXPORTS">
				<Text>Enabled content</Text>
			</ShellFeatureFlagBoundary>,
		);

		expect(getByText('Enabled content')).toBeTruthy();
	});

	it('renders the provided fallback when the flag is disabled', () => {
		const { getByText, queryByText } = renderWithTheme(
			<ShellFeatureFlagBoundary flag="OPS_EXPORTS" fallback={<Text>Disabled content</Text>}>
				<Text>Enabled content</Text>
			</ShellFeatureFlagBoundary>,
			{
				shellEnvironment: {
					featureFlags: {
						isEnabled: () => false,
					},
				},
			},
		);

		expect(getByText('Disabled content')).toBeTruthy();
		expect(queryByText('Enabled content')).toBeNull();
	});
});
