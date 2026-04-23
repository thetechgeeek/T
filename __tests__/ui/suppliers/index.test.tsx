import React from 'react';
import { waitFor } from '@testing-library/react-native';
import SupplierListScreen from '@/app/(app)/suppliers/index';
import { supplierRepository } from '@/src/repositories/supplierRepository';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

jest.mock('@/src/repositories/supplierRepository', () => ({
	supplierRepository: {
		findMany: jest.fn(),
	},
}));

const mockBack = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: jest.fn() });
	(supplierRepository.findMany as jest.Mock).mockResolvedValue({ data: [] });
});

describe('SupplierListScreen', () => {
	it('renders Suppliers heading', async () => {
		const { getByText } = renderWithTheme(<SupplierListScreen />);
		await waitFor(() => {
			expect(supplierRepository.findMany).toHaveBeenCalled();
		});
		expect(getByText('Suppliers')).toBeTruthy();
	});

	it('renders without crashing', async () => {
		const { toJSON } = renderWithTheme(<SupplierListScreen />);
		await waitFor(() => {
			expect(supplierRepository.findMany).toHaveBeenCalled();
		});
		expect(toJSON()).not.toBeNull();
	});
});
