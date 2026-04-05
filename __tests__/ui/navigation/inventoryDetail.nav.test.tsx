import React from 'react';
import { waitFor, fireEvent, act } from '@testing-library/react-native';
import ItemDetailScreen from '@/app/(app)/inventory/[id]';
import { inventoryService } from '@/src/services/inventoryService';
import { renderWithTheme } from '../../utils/renderWithTheme';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Override useFocusEffect to call the callback in a deferred manner to avoid
// "Too many re-renders" errors from synchronous state updates during initial render.
jest.mock('expo-router', () => {
	const React = require('react');
	const push = jest.fn();
	const back = jest.fn();
	return {
		useRouter: jest.fn(() => ({ push, back })),
		useLocalSearchParams: jest.fn(),
		useNavigation: jest.fn(() => ({
			navigate: jest.fn(),
			goBack: back,
			setOptions: jest.fn(),
		})),
		useFocusEffect: jest.fn((cb: () => void) => {
			React.useEffect(() => {
				const cleanup = cb();
				return cleanup;
				// eslint-disable-next-line react-hooks/exhaustive-deps
			}, []);
		}),
		Tabs: Object.assign(() => null, { Screen: () => null }),
		Stack: Object.assign(() => null, { Screen: () => null }),
	};
});

// Only mock what's NOT in jest.setup.ts or what needs specific override
jest.mock('@/src/services/inventoryService', () => ({
	inventoryService: {
		fetchItemById: jest.fn(),
		fetchStockHistory: jest.fn(),
	},
}));

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockItem = {
	id: 'item-123',
	design_name: 'Marble Premium Gold',
	base_item_number: 'MPG-001',
	box_count: 50,
};

beforeEach(() => {
	jest.clearAllMocks();

	// Rely on global expo-router mock but set specific return values
	(useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack });
	(useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'item-123' });

	(inventoryService.fetchItemById as jest.Mock).mockResolvedValue(mockItem);
	(inventoryService.fetchStockHistory as jest.Mock).mockResolvedValue([]);
});

describe('InventoryDetail Navigation Wiring', () => {
	it('Press back -> router.back() called', async () => {
		const { getByLabelText } = renderWithTheme(<ItemDetailScreen />);
		// Assuming there's a back button with this label (standard in our AppHeader/Screen)
		await waitFor(() => expect(getByLabelText('back-button')).toBeTruthy());
		fireEvent.press(getByLabelText('back-button'));
		expect(mockBack).toHaveBeenCalled();
	});

	it('Press "Stock In" -> router.push(expect.stringContaining("type=stock_in")) called', async () => {
		const { getByText } = renderWithTheme(<ItemDetailScreen />);
		await waitFor(() => expect(getByText('Stock In')).toBeTruthy());
		fireEvent.press(getByText('Stock In'));
		expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('type=stock_in'));
		expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('id=item-123'));
	});

	it('Press "Stock Out" -> router.push(expect.stringContaining("type=stock_out")) called', async () => {
		const { getByText } = renderWithTheme(<ItemDetailScreen />);
		await waitFor(() => expect(getByText('Stock Out')).toBeTruthy());
		fireEvent.press(getByText('Stock Out'));
		expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('type=stock_out'));
		expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('id=item-123'));
	});
});
