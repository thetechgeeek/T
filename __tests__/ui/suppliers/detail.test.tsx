import React from 'react';
import SupplierDetailScreen from '@/app/(app)/suppliers/[id]';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

const mockBack = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: jest.fn() });
});

describe('SupplierDetailScreen', () => {
	it('renders Supplier Detail heading', () => {
		const { getByText } = renderWithTheme(<SupplierDetailScreen />);
		expect(getByText('Supplier Detail')).toBeTruthy();
	});

	it('renders coming soon placeholder', () => {
		const { getByText } = renderWithTheme(<SupplierDetailScreen />);
		expect(getByText('Supplier Detail — coming soon')).toBeTruthy();
	});

	it('renders without crashing', () => {
		const { toJSON } = renderWithTheme(<SupplierDetailScreen />);
		expect(toJSON()).not.toBeNull();
	});
});
