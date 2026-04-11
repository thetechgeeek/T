import React from 'react';
import SettingsScreen from '@/app/(app)/settings/index';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

const mockBack = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: jest.fn() });
});

describe('SettingsScreen', () => {
	it('renders Settings heading', () => {
		const { getByText } = renderWithTheme(<SettingsScreen />);
		expect(getByText('Settings')).toBeTruthy();
	});

	it('renders General section', () => {
		const { getByText } = renderWithTheme(<SettingsScreen />);
		expect(getByText('General')).toBeTruthy();
	});

	it('renders without crashing', () => {
		const { toJSON } = renderWithTheme(<SettingsScreen />);
		expect(toJSON()).not.toBeNull();
	});
});
