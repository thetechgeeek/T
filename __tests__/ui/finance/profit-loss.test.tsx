import React from 'react';
import ProfitLossScreen from '@/app/(app)/finance/profit-loss';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

const mockBack = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: jest.fn() });
});

describe('ProfitLossScreen', () => {
	it('renders Profit & Loss heading', () => {
		const { getByText } = renderWithTheme(<ProfitLossScreen />);
		expect(getByText('Profit & Loss')).toBeTruthy();
	});

	it('renders coming soon placeholder', () => {
		const { getByText } = renderWithTheme(<ProfitLossScreen />);
		expect(getByText('Profit & Loss — coming soon')).toBeTruthy();
	});

	it('renders without crashing', () => {
		const { toJSON } = renderWithTheme(<ProfitLossScreen />);
		expect(toJSON()).not.toBeNull();
	});
});
