import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { TileSetCard } from '../TileSetCard';
import type { TileSetGroup, InventoryItem } from '@/src/types/inventory';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
	return {
		id: 'item-001',
		design_name: 'GLOSSY WHITE 60x60',
		base_item_number: '10526',
		category: 'GLOSSY',
		box_count: 50,
		cost_price: 400,
		selling_price: 500,
		gst_rate: 18,
		hsn_code: '6908',
		low_stock_threshold: 10,
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-01T00:00:00Z',
		...overrides,
	};
}

function makeGroup(items: InventoryItem[]): TileSetGroup {
	return { baseItemNumber: items[0].base_item_number, items };
}

describe('TileSetCard', () => {
	it('renders the base item number as card header', () => {
		const group = makeGroup([makeItem()]);
		const { getByText } = renderWithTheme(
			<TileSetCard group={group} onPressItem={jest.fn()} />,
		);
		expect(getByText('10526')).toBeTruthy();
	});

	it('renders design name for each variant', () => {
		const group = makeGroup([
			makeItem(),
			makeItem({ id: 'item-002', design_name: 'GLOSSY BLACK 60x60' }),
		]);
		const { getByText } = renderWithTheme(
			<TileSetCard group={group} onPressItem={jest.fn()} />,
		);
		expect(getByText('GLOSSY WHITE 60x60')).toBeTruthy();
		expect(getByText('GLOSSY BLACK 60x60')).toBeTruthy();
	});

	it('shows correct total stock count', () => {
		const group = makeGroup([
			makeItem({ box_count: 20 }),
			makeItem({ id: 'item-002', design_name: 'VAR-2', box_count: 30 }),
		]);
		const { getByText } = renderWithTheme(
			<TileSetCard group={group} onPressItem={jest.fn()} />,
		);
		expect(getByText(/50 Boxes Total/)).toBeTruthy();
	});

	it('shows variant count in header', () => {
		const group = makeGroup([makeItem(), makeItem({ id: 'item-002', design_name: 'VAR-2' })]);
		const { getByText } = renderWithTheme(
			<TileSetCard group={group} onPressItem={jest.fn()} />,
		);
		expect(getByText(/2 Variants/)).toBeTruthy();
	});

	it('shows "1 Variant" for single item', () => {
		const group = makeGroup([makeItem()]);
		const { getByText } = renderWithTheme(
			<TileSetCard group={group} onPressItem={jest.fn()} />,
		);
		expect(getByText(/1 Variant[^s]/)).toBeTruthy();
	});

	it('shows LOW stock badge when any item is at or below threshold', () => {
		const group = makeGroup([makeItem({ box_count: 5, low_stock_threshold: 10 })]);
		const { getByText } = renderWithTheme(
			<TileSetCard group={group} onPressItem={jest.fn()} />,
		);
		expect(getByText('LOW')).toBeTruthy();
	});

	it('does not show LOW badge when all items are above threshold', () => {
		const group = makeGroup([makeItem({ box_count: 50, low_stock_threshold: 10 })]);
		const { queryByText } = renderWithTheme(
			<TileSetCard group={group} onPressItem={jest.fn()} />,
		);
		expect(queryByText('LOW')).toBeNull();
	});

	it('calls onPressItem with the correct item when a variant row is pressed', () => {
		const item = makeItem();
		const group = makeGroup([item]);
		const onPressItem = jest.fn();
		const { getByLabelText } = renderWithTheme(
			<TileSetCard group={group} onPressItem={onPressItem} />,
		);
		fireEvent.press(getByLabelText('GLOSSY WHITE 60x60, 50 boxes in stock'));
		expect(onPressItem).toHaveBeenCalledWith(item);
	});

	it('renders placeholder icon when no tile_image_url', () => {
		const group = makeGroup([makeItem({ tile_image_url: undefined })]);
		const { toJSON } = renderWithTheme(<TileSetCard group={group} onPressItem={jest.fn()} />);
		const json = JSON.stringify(toJSON());
		expect(json).toContain('Package');
	});

	it('renders Image when tile_image_url is provided', () => {
		const group = makeGroup([
			makeItem({
				tile_image_url: 'https://abc.supabase.co/storage/v1/object/public/tiles/img.jpg',
			}),
		]);
		const { toJSON } = renderWithTheme(<TileSetCard group={group} onPressItem={jest.fn()} />);
		const json = JSON.stringify(toJSON());
		expect(json).toContain('Image');
	});

	it('displays selling price for each variant', () => {
		const group = makeGroup([makeItem({ selling_price: 750 })]);
		const { getByText } = renderWithTheme(
			<TileSetCard group={group} onPressItem={jest.fn()} />,
		);
		// formatCurrency mock returns `₹${value}`
		expect(getByText('₹750')).toBeTruthy();
	});

	it('shows stock count per variant', () => {
		const group = makeGroup([makeItem({ box_count: 23 })]);
		const { getByText } = renderWithTheme(
			<TileSetCard group={group} onPressItem={jest.fn()} />,
		);
		expect(getByText('23 Box')).toBeTruthy();
	});
});
