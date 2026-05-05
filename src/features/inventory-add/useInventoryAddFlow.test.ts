import { Alert } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { inventoryService } from '@/src/services/inventoryService';
import { useInventoryAddFlow } from './useInventoryAddFlow';
import {
	buildInventoryItemPayload,
	generateInventoryItemCode,
	INVENTORY_ADD_DEFAULT_VALUES,
} from './inventoryAddFormModel';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
	useRouter: jest.fn(() => ({ back: mockBack })),
	useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock('@/src/stores/inventoryStore', () => ({
	useInventoryStore: jest.fn(),
}));

jest.mock('@/src/services/inventoryService', () => ({
	inventoryService: {
		fetchItemById: jest.fn(),
	},
}));

const t = (key: string) => key;

describe('useInventoryAddFlow', () => {
	const mockCreateItem = jest.fn();
	const mockUpdateItem = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		mockCreateItem.mockResolvedValue({ id: 'item-1' });
		mockUpdateItem.mockResolvedValue({ id: 'item-1' });
		(useLocalSearchParams as jest.Mock).mockReturnValue({});
		(inventoryService.fetchItemById as jest.Mock).mockResolvedValue({
			id: 'item-1',
			design_name: 'Existing Tile',
			category: 'GLOSSY',
			selling_price: 500,
			cost_price: 300,
			gst_rate: 18,
			hsn_code: '6908',
			box_count: 5,
			low_stock_threshold: 1,
			has_batch_tracking: false,
			has_serial_tracking: false,
		});
		(useInventoryStore as unknown as jest.Mock).mockImplementation((selector) =>
			selector({ createItem: mockCreateItem, updateItem: mockUpdateItem }),
		);
		jest.spyOn(Alert, 'alert').mockImplementation(() => {});
	});

	it('submits a create request shaped by the feature model', async () => {
		const { result } = renderHook(() => useInventoryAddFlow(t));

		act(() => {
			result.current.form.setValue('design_name', 'Glossy White');
			result.current.form.setValue('selling_price', '500');
		});

		await act(async () => {
			await result.current.submitForm();
		});

		expect(mockCreateItem).toHaveBeenCalledWith(
			expect.objectContaining({
				design_name: 'Glossy White',
				selling_price: 500,
				gst_rate: 18,
				track_stock: true,
			}),
		);
		expect(mockBack).toHaveBeenCalled();
	});

	it('keeps request shaping outside the screen component', () => {
		expect(
			buildInventoryItemPayload({
				...INVENTORY_ADD_DEFAULT_VALUES,
				design_name: 'No Stock Tile',
				selling_price: '120',
				track_stock: false,
				box_count: '99',
			}),
		).toEqual(expect.objectContaining({ box_count: 0, low_stock_threshold: 0 }));
	});

	it('generates stable item-code format from injected time and randomness', () => {
		expect(generateInventoryItemCode(new Date('2026-05-05T00:00:00Z'), () => 0)).toBe(
			'20260505-AAAA',
		);
	});
});
