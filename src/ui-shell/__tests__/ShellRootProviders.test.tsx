import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { ShellRootProviders } from '../ShellRootProviders';

jest.mock('expo-status-bar', () => ({
	StatusBar: () => null,
}));

const baseEnvironment = {
	translate: (key: string, fallback?: string) => fallback ?? key,
	isConnected: true,
	syncStatus: {
		lastSyncedAt: null,
		isSyncing: false,
		pendingCount: 0,
	},
	openSyncLog: jest.fn(),
};

describe('ShellRootProviders', () => {
	it('renders children through the shell provider stack', () => {
		const { getByText } = render(
			<ShellRootProviders environment={baseEnvironment}>
				<Text>Shell Child</Text>
			</ShellRootProviders>,
		);

		expect(getByText('Shell Child')).toBeTruthy();
	});

	it('shows the offline banner when connectivity is down', () => {
		const { getByText } = render(
			<ShellRootProviders
				environment={{
					...baseEnvironment,
					isConnected: false,
				}}
			>
				<Text>Shell Child</Text>
			</ShellRootProviders>,
		);

		expect(getByText('No internet connection')).toBeTruthy();
	});

	it('can hide the offline banner for isolated routes like the workbench', () => {
		const { queryByText } = render(
			<ShellRootProviders
				environment={{
					...baseEnvironment,
					isConnected: false,
				}}
				hideOfflineBanner
			>
				<Text>Shell Child</Text>
			</ShellRootProviders>,
		);

		expect(queryByText('No internet connection')).toBeNull();
	});
});
