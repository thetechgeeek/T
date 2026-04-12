import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { LineItemsStep } from '../LineItemsStep';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import type { InvoiceLineItemInput } from '@/src/types/invoice';
import type { InventoryItem } from '@/src/types/inventory';

const mockRemoveLineItem = jest.fn();
const mockSetIsAddingItem = jest.fn();
const mockSetSearchQuery = jest.fn();
const mockSelectInventoryItem = jest.fn();
const mockCancelItemSelection = jest.fn();
const mockSetInputQuantity = jest.fn();
const mockSetInputDiscount = jest.fn();
const mockAddLineItem = jest.fn();

const sampleItem: InventoryItem = {
	id: 'item-1',
	design_name: 'Marble White 60x60',
	base_item_number: 'MW-001',
	category: 'GLOSSY',
	size_name: '60x60',
	box_count: 50,
	has_batch_tracking: false,
	has_serial_tracking: false,
	selling_price: 1500,
	cost_price: 1000,
	gst_rate: 18,
	hsn_code: '6908',
	low_stock_threshold: 10,
	created_at: '',
	updated_at: '',
};

const sampleLineItem: InvoiceLineItemInput = {
	design_name: 'Marble White 60x60',
	quantity: 10,
	rate_per_unit: 1500,
	discount: 0,
	gst_rate: 18,
	item_id: 'item-1',
};

function makeProps(overrides = {}) {
	return {
		lineItems: [],
		removeLineItem: mockRemoveLineItem,
		isAddingItem: false,
		setIsAddingItem: mockSetIsAddingItem,
		inventoryItems: [],
		inventoryLoading: false,
		searchQuery: '',
		setSearchQuery: mockSetSearchQuery,
		selectedItem: null,
		selectInventoryItem: mockSelectInventoryItem,
		cancelItemSelection: mockCancelItemSelection,
		inputQuantity: '',
		setInputQuantity: mockSetInputQuantity,
		inputDiscount: '',
		setInputDiscount: mockSetInputDiscount,
		addLineItem: mockAddLineItem,
		...overrides,
	};
}

beforeEach(() => jest.clearAllMocks());

describe('LineItemsStep', () => {
	it('renders Line Items heading', () => {
		const { getByText } = renderWithTheme(<LineItemsStep {...makeProps()} />);
		expect(getByText('Line Items')).toBeTruthy();
	});

	it('renders + Add Item button', () => {
		const { getByText } = renderWithTheme(<LineItemsStep {...makeProps()} />);
		expect(getByText('+ Add Item')).toBeTruthy();
	});

	it('shows empty state when no line items', () => {
		const { getByText } = renderWithTheme(<LineItemsStep {...makeProps()} />);
		expect(getByText('No items added yet.')).toBeTruthy();
	});

	it('calls setIsAddingItem(true) when + Add Item pressed', () => {
		const { getByText } = renderWithTheme(<LineItemsStep {...makeProps()} />);
		fireEvent.press(getByText('+ Add Item'));
		expect(mockSetIsAddingItem).toHaveBeenCalledWith(true);
	});

	it('renders added line item design name', () => {
		const { getByText } = renderWithTheme(
			<LineItemsStep {...makeProps({ lineItems: [sampleLineItem] })} />,
		);
		expect(getByText('Marble White 60x60')).toBeTruthy();
	});

	it('renders quantity and rate for added line item', () => {
		const { getByText } = renderWithTheme(
			<LineItemsStep {...makeProps({ lineItems: [sampleLineItem] })} />,
		);
		expect(getByText('10 units @ ₹1500')).toBeTruthy();
	});

	it('calls removeLineItem with correct index on Remove press', () => {
		const { getByText } = renderWithTheme(
			<LineItemsStep {...makeProps({ lineItems: [sampleLineItem] })} />,
		);
		fireEvent.press(getByText('Remove'));
		expect(mockRemoveLineItem).toHaveBeenCalledWith(0);
	});

	it('shows search panel when isAddingItem=true', () => {
		const { getByText } = renderWithTheme(
			<LineItemsStep {...makeProps({ isAddingItem: true })} />,
		);
		expect(getByText('Select from Inventory')).toBeTruthy();
	});

	it('renders inventory item in search results', () => {
		const { getByText } = renderWithTheme(
			<LineItemsStep {...makeProps({ isAddingItem: true, inventoryItems: [sampleItem] })} />,
		);
		expect(getByText('Marble White 60x60')).toBeTruthy();
	});

	it('calls selectInventoryItem when item row tapped', () => {
		const { getByText } = renderWithTheme(
			<LineItemsStep {...makeProps({ isAddingItem: true, inventoryItems: [sampleItem] })} />,
		);
		fireEvent.press(getByText('Marble White 60x60'));
		expect(mockSelectInventoryItem).toHaveBeenCalledWith(sampleItem);
	});

	it('shows quantity and discount fields after item selected', () => {
		const { getByPlaceholderText } = renderWithTheme(
			<LineItemsStep {...makeProps({ isAddingItem: true, selectedItem: sampleItem })} />,
		);
		expect(getByPlaceholderText('Enter quantity')).toBeTruthy();
		expect(getByPlaceholderText('Enter discount amount')).toBeTruthy();
	});

	it('calls addLineItem on Confirm press', () => {
		const { getByText } = renderWithTheme(
			<LineItemsStep
				{...makeProps({
					isAddingItem: true,
					selectedItem: sampleItem,
					inputQuantity: '5',
				})}
			/>,
		);
		fireEvent.press(getByText('Confirm'));
		expect(mockAddLineItem).toHaveBeenCalled();
	});

	it('calls cancelItemSelection on Cancel press', () => {
		const { getByText } = renderWithTheme(
			<LineItemsStep {...makeProps({ isAddingItem: true, selectedItem: sampleItem })} />,
		);
		fireEvent.press(getByText('Cancel'));
		expect(mockCancelItemSelection).toHaveBeenCalled();
	});

	it('shows stock exceeded error when quantity > box_count', () => {
		const { getByText } = renderWithTheme(
			<LineItemsStep
				{...makeProps({
					isAddingItem: true,
					selectedItem: sampleItem,
					inputQuantity: '999',
				})}
			/>,
		);
		expect(getByText('Exceeds available stock (50)')).toBeTruthy();
	});

	it('shows "No items found." when inventory is empty and not loading', () => {
		const { getByText } = renderWithTheme(
			<LineItemsStep
				{...makeProps({ isAddingItem: true, inventoryItems: [], inventoryLoading: false })}
			/>,
		);
		expect(getByText('No items found.')).toBeTruthy();
	});
});
