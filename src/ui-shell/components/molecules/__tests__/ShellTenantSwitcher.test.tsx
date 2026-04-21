import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import { ShellTenantSwitcher } from '../ShellTenantSwitcher';

describe('ShellTenantSwitcher', () => {
	it('renders tenant details and switch action when supported', () => {
		const switchTenant = jest.fn();
		const track = jest.fn();
		const { getByText } = renderWithTheme(<ShellTenantSwitcher />, {
			shellEnvironment: {
				tenant: {
					current: {
						id: 'ops-console',
						name: 'Operations Console',
						accentLabel: 'Ops',
						canSwitch: true,
					},
					switchTenant,
				},
				analytics: {
					track,
				},
			},
		});

		fireEvent.press(getByText('Switch workspace'));

		expect(getByText('Operations Console')).toBeTruthy();
		expect(switchTenant).toHaveBeenCalledTimes(1);
		expect(track).toHaveBeenCalledWith('shell.tenant.switch');
	});
});
