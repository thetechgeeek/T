import React from 'react';
import { render } from '@testing-library/react-native';
import InventoryTab from '@/app/(app)/(tabs)/inventory';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock the inventory store
jest.mock('@/src/stores/inventoryStore', () => ({
	useInventoryStore: (selector: any) =>
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
		t: (key: string) => key,
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
	useFocusEffect: jest.fn((cb) => cb()),
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
		const searchInput = await findByLabelText('inventory-search-input');
		expect(searchInput.props.accessibilityHint).toContain('Search by design name');
	});

	it('has accessible category filter chips', async () => {
		const { findByLabelText } = renderWithTheme(<InventoryTab />);
		expect(await findByLabelText('category-chip-ALL')).toBeTruthy();
		expect(await findByLabelText('category-chip-GLOSSY')).toBeTruthy();
	});

	it('has an identifiable Add Inventory FAB', async () => {
		const { findByLabelText } = renderWithTheme(<InventoryTab />);
		const fab = await findByLabelText('add-inventory-button');
		expect(fab.props.accessibilityRole).toBe('button');
		expect(fab.props.accessibilityHint).toContain('Add a new inventory item');
	});
});
