import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import InventoryTab from '@/app/(app)/(tabs)/inventory';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

// Only mock what's NOT in jest.setup.ts or what needs specific override
jest.mock('@/src/stores/inventoryStore', () => ({
	useInventoryStore: jest.fn(),
}));

const mockPush = jest.fn();

beforeEach(() => {
	jest.clearAllMocks();

	// Rely on global expo-router mock but set specific return values
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });

	(useInventoryStore as unknown as jest.Mock).mockImplementation((selector: (s: any) => any) => {
		const state = {
			items: [],
			loading: false,
			hasMore: false,
			filters: { category: 'ALL', search: '' },
			page: 1,
			fetchItems: jest.fn().mockResolvedValue(undefined),
			setFilters: jest.fn().mockResolvedValue(undefined),
		};
		return typeof selector === 'function' ? selector(state) : state;
	});
});

describe('InventoryTab Navigation Wiring', () => {
	it('Press FAB (+) -> router.push("/(app)/inventory/add") called', async () => {
		const { getByLabelText } = renderWithTheme(<InventoryTab />);
		await waitFor(() => expect(getByLabelText('add-inventory-button')).toBeTruthy());
		fireEvent.press(getByLabelText('add-inventory-button'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/inventory/add');
	});

	it('Category chip press does NOT call router (no navigation)', () => {
		const { getByText } = renderWithTheme(<InventoryTab />);
		fireEvent.press(getByText('ALL'));
		expect(mockPush).not.toHaveBeenCalled();
	});

	it('Press a TileSetCard item variant -> router.push("/(app)/inventory/i1") called', async () => {
		const mockItem = {
			id: 'i1',
			base_item_number: 'B001',
			design_name: 'Classic-Design',
			category: 'GLOSSY',
			box_count: 10,
			has_batch_tracking: false,
			has_serial_tracking: false,
		};

		(useInventoryStore as unknown as jest.Mock).mockImplementation(
			(selector: (state: any) => any) =>
				selector({
					items: [mockItem],
					loading: false,
					hasMore: false,
					filters: { category: 'ALL', search: '' },
					page: 1,
					fetchItems: jest.fn(),
					setFilters: jest.fn(),
				}),
		);

		const { getByText } = renderWithTheme(<InventoryTab />);
		await waitFor(() => expect(getByText('Classic-Design')).toBeTruthy());
		fireEvent.press(getByText('Classic-Design'));

		// The variant row is pressable and navigates to detail
		expect(mockPush).toHaveBeenCalledWith('/(app)/inventory/i1');
	});
});
