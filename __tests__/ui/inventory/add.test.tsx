import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddItemScreen from '@/app/(app)/inventory/add';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { renderWithTheme } from '../../utils/renderWithTheme';

// Mock values
const mockCreateItem = jest.fn();
const mockUpdateItem = jest.fn();

jest.mock('@/src/stores/inventoryStore', () => ({
	useInventoryStore: jest.fn(),
}));

jest.mock('expo-router', () => ({
	useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })),
	useLocalSearchParams: () => ({}),
	useNavigation: jest.fn(() => ({
		navigate: jest.fn(),
		setOptions: jest.fn(),
		addListener: jest.fn(() => jest.fn()),
	})),
	useFocusEffect: jest.fn((cb) => cb()),
}));

describe('AddItemScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(useInventoryStore as unknown as jest.Mock).mockReturnValue({
			createItem: mockCreateItem,
			updateItem: mockUpdateItem,
		});
	});

	it('renders correctly for adding a new item', () => {
		const { getByText, getByPlaceholderText, getByLabelText } = renderWithTheme(
			<AddItemScreen />,
		);

		expect(getByText('Add Item')).toBeTruthy();
		expect(getByPlaceholderText(/सफेद ग्लॉसी टाइल|e.g. 10526/i)).toBeTruthy();
		expect(getByText(/Opening Stock/i)).toBeTruthy();
	});

	it('shows validation errors for required fields', async () => {
		const { getByText, findByText, getByLabelText } = renderWithTheme(<AddItemScreen />);

		// Press save without filling anything
		fireEvent.press(getByLabelText(/save item/i));

		// findByText already waits.
		expect(await findByText('Required')).toBeTruthy();
	});

	it('successfully submits the form to create an item', async () => {
		const { getByText, getByPlaceholderText, getByLabelText } = renderWithTheme(
			<AddItemScreen />,
		);

		fireEvent.changeText(getByPlaceholderText(/सफेद ग्लॉसी टाइल|e.g. 10526/i), 'Marble 101');
		fireEvent.changeText(getByLabelText(/Sale Price/i), '500');
		fireEvent.changeText(getByLabelText(/Opening Stock/i), '100');
		fireEvent.changeText(getByLabelText(/Low Stock/i), '15');
		fireEvent.press(getByText('12%'));

		// Select category FLOOR (default is GLOSSY)
		fireEvent.press(getByText('FLOOR'));

		fireEvent.press(getByText('Save Item'));

		await waitFor(() => {
			expect(mockCreateItem).toHaveBeenCalledWith(
				expect.objectContaining({
					design_name: 'Marble 101',
					category: 'FLOOR',
					selling_price: 500,
					box_count: 100,
					low_stock_threshold: 15,
					gst_rate: 12,
				}),
			);
		});
	});

	it('shows an alert when item creation fails', async () => {
		const errorMessage = "Could not find the table 'public.inventory_items'";
		mockCreateItem.mockRejectedValue(new Error(errorMessage));

		const { getByText, getByPlaceholderText, getByLabelText } = renderWithTheme(
			<AddItemScreen />,
		);

		fireEvent.changeText(getByPlaceholderText(/सफेद ग्लॉसी टाइल|e.g. 10526/i), 'Error Item');
		fireEvent.changeText(getByLabelText(/Sale Price/i), '500');
		fireEvent.changeText(getByLabelText(/Opening Stock/i), '100');
		fireEvent.changeText(getByLabelText(/Low Stock/i), '15');
		fireEvent.press(getByText('12%'));

		fireEvent.press(getByText('Save Item'));

		await waitFor(() => {
			expect(mockCreateItem).toHaveBeenCalled();
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error',
				expect.stringContaining(errorMessage),
				expect.any(Array),
			);
		});
	});

	// ─── Phase 3: Loading state tests ────────────────────────────────────────

	it('shows full-screen ActivityIndicator while submitting (loading=true)', async () => {
		// createItem never resolves — simulates in-flight request
		mockCreateItem.mockReturnValue(new Promise(() => {}));

		const { getByText, getByPlaceholderText, getByLabelText, UNSAFE_getByType } =
			renderWithTheme(<AddItemScreen />);

		fireEvent.changeText(getByPlaceholderText(/सफेद ग्लॉसी टाइल|e.g. 10526/i), 'Marble 101');
		fireEvent.changeText(getByLabelText(/Sale Price/i), '500');
		fireEvent.changeText(getByLabelText(/Opening Stock/i), '100');
		fireEvent.changeText(getByLabelText(/Low Stock/i), '15');
		fireEvent.press(getByText('12%'));
		fireEvent.press(getByText('Save Item'));

		const { ActivityIndicator } = require('react-native');
		await waitFor(() => expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy());
	});

	it('form re-appears after createItem rejects — loading clears via finally', async () => {
		mockCreateItem.mockRejectedValue(new Error('DB error'));

		const { getByText, getByPlaceholderText, getByLabelText, queryByText } = renderWithTheme(
			<AddItemScreen />,
		);

		fireEvent.changeText(getByPlaceholderText(/सफेद ग्लॉसी टाइल|e.g. 10526/i), 'Marble 101');
		fireEvent.changeText(getByLabelText(/Sale Price/i), '500');
		fireEvent.changeText(getByLabelText(/Opening Stock/i), '100');
		fireEvent.changeText(getByLabelText(/Low Stock/i), '15');
		fireEvent.press(getByText('12%'));
		fireEvent.press(getByText('Save Item'));

		await waitFor(() => {
			// Form is visible again — Save Item button re-appears
			expect(queryByText('Save Item')).toBeTruthy();
		});
	});
});
