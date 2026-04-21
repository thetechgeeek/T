import React from 'react';
import { Text } from 'react-native';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import { ShellAssetGate } from '../ShellAssetGate';

describe('ShellAssetGate', () => {
	it('renders children when required assets are ready', () => {
		const { getByText } = renderWithTheme(
			<ShellAssetGate>
				<Text>Shell ready</Text>
			</ShellAssetGate>,
		);

		expect(getByText('Shell ready')).toBeTruthy();
	});

	it('renders the default loading surface when assets are still loading', () => {
		const { getByText } = renderWithTheme(
			<ShellAssetGate>
				<Text>Shell ready</Text>
			</ShellAssetGate>,
			{
				shellEnvironment: {
					assets: {
						ready: false,
						requiredAssets: ['lucide-react-native'],
					},
				},
			},
		);

		expect(getByText('Preparing the workspace')).toBeTruthy();
		expect(getByText(/shell assets are still loading/i)).toBeTruthy();
	});

	it('prefers a custom fallback when the consumer provides one', () => {
		const { getByText, queryByText } = renderWithTheme(
			<ShellAssetGate fallback={<Text>Custom asset fallback</Text>}>
				<Text>Shell ready</Text>
			</ShellAssetGate>,
			{
				shellEnvironment: {
					assets: {
						ready: false,
						requiredAssets: ['lucide-react-native'],
					},
				},
			},
		);

		expect(getByText('Custom asset fallback')).toBeTruthy();
		expect(queryByText('Preparing the workspace')).toBeNull();
	});
});
