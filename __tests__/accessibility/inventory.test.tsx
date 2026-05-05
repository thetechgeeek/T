import React from 'react';
import { render } from '@testing-library/react-native';
import InventoryTab from '@/app/(app)/(tabs)/inventory';
import { ThemeProvider } from '@easydesign/design-system/foundation';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock the inventory store
jest.mock('@/src/stores/inventoryStore', () => ({
	useInventoryStore: (selector: (state: any) => any) =>
		selector({
			items: [
				{
					id: '1',
					design_name: 'Glossy White',
					base_item_number: 'GW001',
					category: 'GLOSSY',
					size: '12x18',
				},
				{
					id: '2',
					design_name: 'Matt Grey',
					base_item_number: 'MG002',
					category: 'MATT',
					size: '12x12',
				},
			],
			loading: false,
			hasMore: false,
			filters: { category: 'ALL' },
			page: 1,
			fetchItems: jest.fn().mockResolvedValue([]),
			setFilters: jest.fn(),
		}),
}));

// Mock useLocale
jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string, values?: Record<string, unknown>) => {
			const map: Record<string, string> = {
				'inventory.title': 'Inventory',
				'inventory.addItem': 'Add Item',
				'inventory.addHint': 'Add a new inventory item',
				'inventory.importExportActions': 'Inventory import and export actions',
				'inventory.importExportHint': 'Open import and export options',
				'inventory.searchLabel': 'Search inventory',
				'inventory.searchHint': 'Search by design name or item number',
				'inventory.searchPlaceholder': 'SKU, name, HSN code...',
				'inventory.filterLabel': 'Inventory filter options',
				'inventory.filterHint': 'Open category and filter options',
				'inventory.summaryLabel': 'Inventory summary',
				'inventory.stockValue': 'Stock value',
				'inventory.lowStockCount': 'Low stock',
				'inventory.outOfStockCount': 'Out of stock',
				'inventory.categoryFiltersLabel': 'Inventory category filters',
				'inventory.categoryFilterLabel': `Category filter: ${String(values?.label ?? '')}`,
				'inventory.lowStockFilterLabel': 'Low stock filter',
				'inventory.lowStockFilterWithCount': `Low stock · ${String(values?.count ?? 0)}`,
				'inventory.setsListLabel': 'Inventory sets list',
				'inventory.setsInCatalog': `${String(values?.count ?? 0)} sets in catalog`,
				'inventory.noItems': 'No items in inventory',
				'inventory.addFirstItem': 'Add your first item',
				'inventory.emptyFilterHint': 'Try adjusting your search or filters.',
				'inventory.categories.all': 'ALL',
				'inventory.categories.glossy': 'GLOSSY',
				'inventory.categories.matt': 'MATT',
				'inventory.categories.elevation': 'ELEVATION',
				'inventory.categories.floor': 'FLOOR',
				'inventory.categories.wooden': 'WOODEN',
				'inventory.categories.satin': 'SATIN',
				'inventory.categories.other': 'OTHER',
				'common.doubleTapToView': 'Double tap to view details',
			};
			return map[key] ?? key;
		},
		formatCurrency: (val: number) => `₹${val}`,
		currentLanguage: 'en',
	}),
}));

// Mock useRouter
jest.mock('expo-router', () => ({
	useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })),
	useNavigation: jest.fn(() => ({
		navigate: jest.fn(),
		setOptions: jest.fn(),
		addListener: jest.fn(() => jest.fn()),
	})),
	useFocusEffect: jest.fn((cb: () => void) => cb()),
}));

const renderWithTheme = (component: React.ReactElement) => {
	return render(
		<SafeAreaProvider
			initialMetrics={{
				frame: { x: 0, y: 0, width: 390, height: 844 },
				insets: { top: 0, bottom: 0, left: 0, right: 0 },
			}}
		>
			<ThemeProvider>{component}</ThemeProvider>
		</SafeAreaProvider>,
	);
};

describe('Inventory Accessibility', () => {
	it('has an identifiable header', async () => {
		const { findByLabelText } = renderWithTheme(<InventoryTab />);
		expect(await findByLabelText('inventory-screen')).toBeTruthy();
	});

	it('provides a search input with clear accessibility hints', async () => {
		const { findByLabelText } = renderWithTheme(<InventoryTab />);
		const searchInput = await findByLabelText('Search inventory');
		expect(searchInput.props.accessibilityHint).toContain('Search by design name');
	});

	it('has accessible category filter chips', async () => {
		const { findByLabelText } = renderWithTheme(<InventoryTab />);
		expect(await findByLabelText('Category filter: ALL')).toBeTruthy();
		expect(await findByLabelText('Category filter: GLOSSY')).toBeTruthy();
	});

	it('has an identifiable Add Inventory FAB', async () => {
		const { findByLabelText } = renderWithTheme(<InventoryTab />);
		const fab = await findByLabelText('Add Item');
		expect(fab.props.accessibilityRole).toBe('button');
		expect(fab.props.accessibilityHint).toContain('Add a new inventory item');
	});
});
