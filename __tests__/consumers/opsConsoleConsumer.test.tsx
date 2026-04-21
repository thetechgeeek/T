import React from 'react';
import { render } from '@testing-library/react-native';
import { OpsConsoleApp } from '@easydesign/ops-console';

jest.mock('expo-status-bar', () => ({
	StatusBar: () => null,
}));

describe('OpsConsoleApp', () => {
	it('renders the second EasyDesign consumer through public package entrypoints', () => {
		const { getByText } = render(<OpsConsoleApp />);

		expect(getByText('Ops Console')).toBeTruthy();
		expect(getByText('Operations Console')).toBeTruthy();
		expect(getByText('Ops billing is restricted')).toBeTruthy();
		expect(getByText('Exports are disabled')).toBeTruthy();
		expect(getByText('Access blocked')).toBeTruthy();
		expect(getByText('Notification center')).toBeTruthy();
	});
});
