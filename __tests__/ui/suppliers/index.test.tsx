import React from 'react';
import SupplierListScreen from '@/app/(app)/suppliers/index';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

const mockBack = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: jest.fn() });
});

describe('SupplierListScreen', () => {
	it('renders Suppliers heading', () => {
		const { getByText } = renderWithTheme(<SupplierListScreen />);
		expect(getByText('Suppliers')).toBeTruthy();
	});

	it('renders without crashing', () => {
		const { toJSON } = renderWithTheme(<SupplierListScreen />);
		expect(toJSON()).not.toBeNull();
	});
});
