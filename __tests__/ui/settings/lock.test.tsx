import React from 'react';
import SecurityLockScreen from '@/app/(app)/settings/lock';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

const mockBack = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: jest.fn() });
});

describe('SecurityLockScreen', () => {
	it('renders Security & Lock heading', () => {
		const { getByText } = renderWithTheme(<SecurityLockScreen />);
		expect(getByText('Security & Lock')).toBeTruthy();
	});

	it('renders coming soon placeholder', () => {
		const { getByText } = renderWithTheme(<SecurityLockScreen />);
		expect(getByText('Security & Lock — coming soon')).toBeTruthy();
	});

	it('renders without crashing', () => {
		const { toJSON } = renderWithTheme(<SecurityLockScreen />);
		expect(toJSON()).not.toBeNull();
	});
});
