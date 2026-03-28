import { useOrderStore } from './orderStore';
import { orderService } from '../services/orderService';

jest.mock('../services/orderService', () => ({
	orderService: {
		fetchOrders: jest.fn(),
		importOrder: jest.fn(),
	},
}));

jest.mock('../services/pdfService', () => ({
	pdfService: {
		parseDocumentWithLLM: jest.fn(),
	},
}));

describe('orderStore', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useOrderStore.setState({
			orders: [],
			loading: false,
			error: null,
			parsedData: null,
		});
	});

	it('fetchOrders updates store', async () => {
		const mockOrders = [{ id: 'o1', party_name: 'Party' }];
		(orderService.fetchOrders as jest.Mock).mockResolvedValue(mockOrders);

		await useOrderStore.getState().fetchOrders();

		expect(useOrderStore.getState().orders).toEqual(mockOrders);
		expect(useOrderStore.getState().loading).toBe(false);
	});

	it('importParsedData calls service and refreshes orders', async () => {
		(orderService.importOrder as jest.Mock).mockResolvedValue({ id: 'o1' });
		(orderService.fetchOrders as jest.Mock).mockResolvedValue([{ id: 'o1' }]);

		await useOrderStore.getState().importParsedData('Party', []);

		expect(orderService.importOrder).toHaveBeenCalledWith('Party', [], null);
		expect(orderService.fetchOrders).toHaveBeenCalled();
	});
});
