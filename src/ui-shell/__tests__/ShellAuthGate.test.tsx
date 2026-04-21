import React from 'react';
import { render } from '@testing-library/react-native';
import { ShellAuthGate } from '../ShellAuthGate';

describe('ShellAuthGate', () => {
	it('initializes auth state when active', () => {
		const initialize = jest.fn();

		render(
			<ShellAuthGate
				loading={true}
				isAuthenticated={false}
				inAuthArea={false}
				initialize={initialize}
				onAuthRequired={jest.fn()}
				onAuthenticated={jest.fn()}
			>
				<></>
			</ShellAuthGate>,
		);

		expect(initialize).toHaveBeenCalledTimes(1);
	});

	it('redirects to auth when unauthenticated outside auth area', () => {
		const onAuthRequired = jest.fn();

		render(
			<ShellAuthGate
				loading={false}
				isAuthenticated={false}
				inAuthArea={false}
				onAuthRequired={onAuthRequired}
				onAuthenticated={jest.fn()}
			>
				<></>
			</ShellAuthGate>,
		);

		expect(onAuthRequired).toHaveBeenCalledTimes(1);
	});

	it('redirects to the app when authenticated inside auth area', () => {
		const onAuthenticated = jest.fn();

		render(
			<ShellAuthGate
				loading={false}
				isAuthenticated={true}
				inAuthArea={true}
				onAuthRequired={jest.fn()}
				onAuthenticated={onAuthenticated}
			>
				<></>
			</ShellAuthGate>,
		);

		expect(onAuthenticated).toHaveBeenCalledTimes(1);
	});

	it('skips initialization and redirects when explicitly bypassed', () => {
		const initialize = jest.fn();
		const onAuthRequired = jest.fn();
		const onAuthenticated = jest.fn();

		render(
			<ShellAuthGate
				loading={false}
				isAuthenticated={false}
				inAuthArea={false}
				skip
				initialize={initialize}
				onAuthRequired={onAuthRequired}
				onAuthenticated={onAuthenticated}
			>
				<></>
			</ShellAuthGate>,
		);

		expect(initialize).not.toHaveBeenCalled();
		expect(onAuthRequired).not.toHaveBeenCalled();
		expect(onAuthenticated).not.toHaveBeenCalled();
	});
});
