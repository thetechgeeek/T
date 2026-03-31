import React from 'react';
import BusinessProfileScreen from '@/app/(app)/settings/business-profile';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

const mockBack = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: jest.fn() });
});

describe('BusinessProfileScreen', () => {
	it('renders Business Profile heading', () => {
		const { getByText } = renderWithTheme(<BusinessProfileScreen />);
		expect(getByText('Business Profile')).toBeTruthy();
	});

	it('renders coming soon placeholder', () => {
		const { getByText } = renderWithTheme(<BusinessProfileScreen />);
		expect(getByText('Business Profile — coming soon')).toBeTruthy();
	});

	it('renders without crashing', () => {
		const { toJSON } = renderWithTheme(<BusinessProfileScreen />);
		expect(toJSON()).not.toBeNull();
	});
});
