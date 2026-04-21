import React from 'react';
import { AppState, Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
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

	it('runs session validation when the app returns to the foreground', () => {
		const validateOnResume = jest.fn();
		let handleAppStateChange: ((nextState: string) => void) | undefined;
		const subscription = { remove: jest.fn() };
		const appStateSpy = jest
			.spyOn(AppState, 'addEventListener')
			.mockImplementation((_, callback) => {
				handleAppStateChange = callback as (nextState: string) => void;
				return subscription as never;
			});

		render(
			<ShellRootProviders
				environment={{
					...baseEnvironment,
					session: {
						validateOnResume,
					},
				}}
			>
				<Text>Shell Child</Text>
			</ShellRootProviders>,
		);

		act(() => {
			handleAppStateChange?.('active');
		});

		expect(validateOnResume).toHaveBeenCalledTimes(1);

		appStateSpy.mockRestore();
	});
});
