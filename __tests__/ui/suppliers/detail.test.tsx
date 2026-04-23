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

beforeEach(() => {
	jest.clearAllMocks();
	(useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: jest.fn() });
	(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'supplier-123' });
	(supplierRepository.findById as jest.Mock).mockResolvedValue({
		id: 'supplier-123',
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
			expect(supplierRepository.findById).toHaveBeenCalledWith('supplier-123');
		});
		expect(toJSON()).not.toBeNull();
	});

	it('renders nothing when no supplier loads after the fetch completes', async () => {
		(supplierRepository.findById as jest.Mock).mockResolvedValueOnce(null);

		const { toJSON } = renderWithTheme(<SupplierDetailScreen />);

		await waitFor(() => {
			expect(supplierRepository.findById).toHaveBeenCalledWith('supplier-123');
		});
		await waitFor(() => {
			expect(toJSON()).toBeNull();
		});
	});
});
