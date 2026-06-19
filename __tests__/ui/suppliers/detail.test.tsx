import React from 'react';
import { waitFor } from '@testing-library/react-native';
import SupplierDetailScreen from '@/app/(app)/suppliers/[id]';
import { supplierRepository } from '@/src/repositories/supplierRepository';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter, useLocalSearchParams } from 'expo-router';

jest.mock('@/src/repositories/supplierRepository', () => ({
	supplierRepository: {
		findById: jest.fn(),
	},
}));

const mockBack = jest.fn();
const SUPPLIER_ID = '44444444-4444-4444-8444-444444444444';

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: jest.fn() });
	(useLocalSearchParams as jest.Mock).mockReturnValue({ id: SUPPLIER_ID });
	(supplierRepository.findById as jest.Mock).mockResolvedValue({
		id: SUPPLIER_ID,
		name: 'Morbi Ceramics',
		phone: '9876543210',
		city: 'Morbi',
		state: 'Gujarat',
	});
});

describe('SupplierDetailScreen', () => {
	it('renders without crashing', async () => {
		const { toJSON } = renderWithTheme(<SupplierDetailScreen />);
		await waitFor(() => {
			expect(supplierRepository.findById).toHaveBeenCalledWith(SUPPLIER_ID);
		});
		expect(toJSON()).not.toBeNull();
	});

	it('renders nothing when no supplier loads after the fetch completes', async () => {
		(supplierRepository.findById as jest.Mock).mockResolvedValueOnce(null);

		const { toJSON } = renderWithTheme(<SupplierDetailScreen />);

		await waitFor(() => {
			expect(supplierRepository.findById).toHaveBeenCalledWith(SUPPLIER_ID);
		});
		await waitFor(() => {
			expect(toJSON()).toBeNull();
		});
	});
});
