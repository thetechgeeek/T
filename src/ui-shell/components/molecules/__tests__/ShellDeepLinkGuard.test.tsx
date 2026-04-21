import React from 'react';
import { Text } from 'react-native';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import { ShellDeepLinkGuard } from '../ShellDeepLinkGuard';

describe('ShellDeepLinkGuard', () => {
	it('renders children when the shell accepts the deep link', () => {
		const { getByText } = renderWithTheme(
			<ShellDeepLinkGuard url="/ops/health">
				<Text>Deep link accepted</Text>
			</ShellDeepLinkGuard>,
			{
				shellEnvironment: {
					deepLinks: {
						resolve: () => ({
							status: 'handled',
							href: '/ops/health',
						}),
					},
				},
			},
		);

		expect(getByText('Deep link accepted')).toBeTruthy();
	});

	it('renders safe unauthorized and invalid fallback states', () => {
		const { getByText } = renderWithTheme(
			<ShellDeepLinkGuard url="/settings/users">
				<Text>Deep link accepted</Text>
			</ShellDeepLinkGuard>,
			{
				shellEnvironment: {
					deepLinks: {
						resolve: () => ({
							status: 'unauthorized',
							reason: 'The current session cannot open that route.',
						}),
					},
				},
			},
		);

		expect(getByText('Access blocked')).toBeTruthy();

		const invalidState = renderWithTheme(
			<ShellDeepLinkGuard url="/unknown">
				<Text>Deep link accepted</Text>
			</ShellDeepLinkGuard>,
			{
				shellEnvironment: {
					deepLinks: {
						resolve: () => ({
							status: 'invalid',
							reason: 'The shell could not map this link to a safe destination.',
						}),
					},
				},
			},
		);

		expect(invalidState.getByText('Link unavailable')).toBeTruthy();
	});
});
