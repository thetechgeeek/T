import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import InventoryTab from '@/app/(app)/(tabs)/inventory';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { inventoryService } from '@/src/services/inventoryService';
import { advanceDebounce, renderScreen, waitForSettledUpdates } from '../utils/screenHarness';

jest.mock('@/src/services/inventoryService', () => ({
	inventoryService: {
		fetchItems: jest.fn(),
		exportToExcel: jest.fn(),
		createItem: jest.fn(),
		updateItem: jest.fn(),
		fetchItemById: jest.fn(),
		performStockOperation: jest.fn(),
		deleteItem: jest.fn(),
	},
}));

const marbleItem = {
	id: 'item-1',
	base_item_number: 'MARBLE-001',
	design_name: 'Marble Gold',
	category: 'GLOSSY',
	size_name: '60x60',
	box_count: 12,
	has_batch_tracking: false,
	has_serial_tracking: false,
	selling_price: 1500,
	cost_price: 1000,
	gst_rate: 18,
	hsn_code: '6908',
	low_stock_threshold: 4,
};

const satinItem = {
	...marbleItem,
	id: 'item-2',
	base_item_number: 'SATIN-002',
	design_name: 'Satin Ivory',
	category: 'SATIN',
};

describe('Inventory screen live wiring', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	it('debounces search through the real store without retriggering an infinite loop', async () => {
		(inventoryService.fetchItems as jest.Mock)
			.mockResolvedValueOnce({ data: [marbleItem, satinItem], count: 2 })
			.mockResolvedValue({ data: [marbleItem], count: 1 });

		const screen = await renderScreen(<InventoryTab />);

		await waitFor(() => {
			expect(inventoryService.fetchItems).toHaveBeenCalledTimes(1);
		});

		fireEvent.changeText(screen.getByLabelText('inventory-search-input'), 'Marble');
		await advanceDebounce(400);

		await waitFor(() => {
			expect(inventoryService.fetchItems).toHaveBeenCalledTimes(2);
		});

		expect(inventoryService.fetchItems).toHaveBeenLastCalledWith(
			expect.objectContaining({ search: 'Marble' }),
			1,
			20,
		);
		expect(useInventoryStore.getState().filters.search).toBe('Marble');

		await advanceDebounce(400);
		await waitForSettledUpdates();

		expect(inventoryService.fetchItems).toHaveBeenCalledTimes(2);
	});
});
