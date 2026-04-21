import React from 'react';
import { Text } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import { ShellPermissionBoundary } from '../ShellPermissionBoundary';

describe('ShellPermissionBoundary', () => {
	it('renders children when access is allowed', () => {
		const { getByText } = renderWithTheme(
			<ShellPermissionBoundary capability="inventory.read">
				<Text>Allowed content</Text>
			</ShellPermissionBoundary>,
		);

		expect(getByText('Allowed content')).toBeTruthy();
	});

	it('renders the denied fallback and uses requestAccess when needed', () => {
		const requestAccess = jest.fn();
		const { getByText } = renderWithTheme(
			<ShellPermissionBoundary capability="settings.users" />,
			{
				shellEnvironment: {
					permissions: {
						resolve: () => ({
							state: 'denied',
							title: 'Admin access required',
							description: 'Only admins can open this screen.',
						}),
						requestAccess,
					},
				},
			},
		);

		fireEvent.press(getByText('Request access'));

		expect(getByText('Admin access required')).toBeTruthy();
		expect(requestAccess).toHaveBeenCalledWith('settings.users');
	});

	it('shows the loading fallback while permissions resolve', () => {
		const { queryByText } = renderWithTheme(
			<ShellPermissionBoundary capability="inventory.write">
				<Text>Hidden content</Text>
			</ShellPermissionBoundary>,
			{
				shellEnvironment: {
					permissions: {
						resolve: () => ({ state: 'loading' }),
					},
				},
			},
		);

		expect(queryByText('Hidden content')).toBeNull();
	});
});
