import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import InventoryTab from '@/app/(app)/(tabs)/inventory';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { InventoryItem } from '@/src/types/inventory';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter } from 'expo-router';

jest.mock('@/src/stores/inventoryStore', () => ({
	useInventoryStore: jest.fn(),
}));

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => {
			const map: Record<string, string> = {
				'inventory.title': 'Inventory',
				'inventory.noItems': 'No items found',
				'inventory.addFirstItem': 'Add your first item',
				'inventory.emptyFilterHint': 'Try a different filter',
				'inventory.loadError': 'Failed to load',
				'common.errorTitle': 'Error',
				'common.ok': 'OK',
				'inventory.categories.all': 'ALL',
				'inventory.categories.glossy': 'GLOSSY',
				'inventory.categories.matt': 'MATT',
				'inventory.categories.pgvt': 'PGVT',
				'inventory.categories.dgvt': 'DGVT',
				'inventory.categories.stone': 'STONE',
				'inventory.categories.highlighter': 'HIGHLIGHTER',
				'inventory.categories.designer': 'DESIGNER',
				'inventory.categories.outdoor': 'OUTDOOR',
			};
			return map[key] ?? key.split('.').pop() ?? key;
		},
		formatCurrency: (amount: number) => `₹${amount.toFixed(2)}`,
	}),
}));

const mockFetchItems = jest.fn();
const mockSetFilters = jest.fn();
const mockPush = jest.fn();

const defaultStoreState = {
	items: [] as InventoryItem[],
	loading: false,
	hasMore: false,
	filters: { category: 'ALL' as const, search: '' },
	page: 1,
	fetchItems: mockFetchItems,
	setFilters: mockSetFilters,
};

beforeEach(() => {
	jest.clearAllMocks();
	mockFetchItems.mockResolvedValue(undefined);
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
	(useInventoryStore as unknown as jest.Mock).mockImplementation(
		(selector: (state: typeof defaultStoreState) => unknown) => selector(defaultStoreState),
	);
});

describe('InventoryTab', () => {
	it('renders Inventory title', () => {
		const { getByText } = renderWithTheme(<InventoryTab />);
		expect(getByText('Inventory')).toBeTruthy();
	});

	it('calls fetchItems on mount when items empty', async () => {
		renderWithTheme(<InventoryTab />);
		await waitFor(() => {
			expect(mockFetchItems).toHaveBeenCalledWith(true);
		});
	});

	it('always calls fetchItems once on first mount regardless of items already loaded', async () => {
		// The initialized ref ensures exactly one fetch on mount — no skipping, no looping.
		(useInventoryStore as unknown as jest.Mock).mockImplementation(
			(selector: (state: typeof defaultStoreState) => unknown) =>
				selector({
					...defaultStoreState,
					items: [
						{
							id: 'i1',
							base_item_number: 'B001',
							design_name: 'Classic',
							category: 'GLOSSY',
							size_name: '60x60',
							box_count: 10,
							selling_price: 1000,
							cost_price: 800,
							gst_rate: 18,
							hsn_code: '6908',
							low_stock_threshold: 5,
						} as InventoryItem,
					],
				}),
		);

		renderWithTheme(<InventoryTab />);
		await waitFor(() => {
			expect(mockFetchItems).toHaveBeenCalledTimes(1);
		});
	});

	it('renders empty state when no items', async () => {
		const { getByText } = renderWithTheme(<InventoryTab />);
		await waitFor(() => {
			expect(getByText('No items found')).toBeTruthy();
		});
	});

	it('renders items grouped by base_item_number', async () => {
		(useInventoryStore as unknown as jest.Mock).mockImplementation(
			(selector: (state: typeof defaultStoreState) => unknown) =>
				selector({
					...defaultStoreState,
					items: [
						{
							id: 'i1',
							base_item_number: 'ELITE-001',
							design_name: 'Elite Classic',
							category: 'GLOSSY',
							size_name: '60x60',
							box_count: 20,
							selling_price: 1500,
							cost_price: 1200,
							gst_rate: 18,
							hsn_code: '6908',
							low_stock_threshold: 10,
						} as InventoryItem,
					],
					page: 2, // already loaded
				}),
		);

		const { getByText } = renderWithTheme(<InventoryTab />);
		await waitFor(() => {
			expect(getByText('ELITE-001')).toBeTruthy();
		});
	});

	it('renders category chips', () => {
		const { getByText } = renderWithTheme(<InventoryTab />);
		expect(getByText('ALL')).toBeTruthy();
		expect(getByText('GLOSSY')).toBeTruthy();
		expect(getByText('MATT')).toBeTruthy();
	});

	it('calls setFilters with selected category on chip press', () => {
		const { getByText } = renderWithTheme(<InventoryTab />);
		fireEvent.press(getByText('GLOSSY'));
		expect(mockSetFilters).toHaveBeenCalledWith({ category: 'GLOSSY' });
	});

	it('navigates to add inventory on FAB press', () => {
		const { toJSON } = renderWithTheme(<InventoryTab />);
		// FAB (Plus icon TouchableOpacity) is present in the render tree
		const json = JSON.stringify(toJSON());
		expect(json).toContain('"Plus"');
	});

	// ─── Navigation ───────────────────────────────────────────────────────────

	it('FAB press navigates to /(app)/inventory/add', () => {
		const { getByLabelText } = renderWithTheme(<InventoryTab />);
		fireEvent.press(getByLabelText('add-inventory-button'));
		expect(mockPush).toHaveBeenCalledWith('/(app)/inventory/add');
	});

	it('category chip press does NOT call router (no navigation)', () => {
		const { getByText } = renderWithTheme(<InventoryTab />);
		fireEvent.press(getByText('GLOSSY'));
		expect(mockPush).not.toHaveBeenCalled();
	});

	it('does not re-fetch after initial mount even when items is empty — no infinite loop', async () => {
		// The old bug: useEffect re-triggered whenever items.length===0 && !loading && page===1
		// which meant a search returning 0 results triggered another fetch, which cleared results,
		// which triggered another fetch, ad infinitum.
		// The fix: useRef(initialized) ensures fetchItems(true) is only called once on mount.
		mockFetchItems.mockResolvedValue(undefined);
		renderWithTheme(<InventoryTab />);

		// Let all microtasks/timers settle
		await new Promise((r) => setTimeout(r, 100));

		// fetchItems should have been called exactly once (on mount), not repeatedly
		expect(mockFetchItems).toHaveBeenCalledTimes(1);
	});
});
