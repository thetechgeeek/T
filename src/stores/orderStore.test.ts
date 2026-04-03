import { useOrderStore } from './orderStore';
import { orderService } from '../services/orderService';
import { pdfService } from '../services/pdfService';
import { eventBus } from '../events/appEvents';

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
		useOrderStore.getState().reset();
	});

	it('fetchOrders updates store', async () => {
		const mockOrders = [{ id: 'o1', party_name: 'Party' }] as any[];
		(orderService.fetchOrders as jest.Mock).mockResolvedValue(mockOrders);

		await useOrderStore.getState().fetchOrders();

		expect(useOrderStore.getState().orders).toEqual(mockOrders);
		expect(useOrderStore.getState().loading).toBe(false);
	});

	it('parseDocument updates parsedData and rawResponse', async () => {
		const mockParsed = [{ design_name: 'Tile A', description: 'desc', quantity: 10 }];
		(pdfService.parseDocumentWithLLM as jest.Mock).mockResolvedValue(mockParsed);

		await useOrderStore.getState().parseDocument('uri', 'application/pdf');

		const state = useOrderStore.getState();
		expect(state.parsedData).toEqual(mockParsed);
		expect(state.rawResponse).toEqual(mockParsed);
		expect(state.isParsing).toBe(false);
	});

	it('importParsedData calls service and emits event', async () => {
		(orderService.importOrder as jest.Mock).mockResolvedValue({ id: 'o1' });
		(orderService.fetchOrders as jest.Mock).mockResolvedValue([{ id: 'o1' }]);
		const emitSpy = jest.spyOn(eventBus, 'emit');

		await useOrderStore.getState().importParsedData('Party', []);

		expect(orderService.importOrder).toHaveBeenCalled();
		expect(emitSpy).toHaveBeenCalledWith({ type: 'STOCK_CHANGED', itemId: '' });
		emitSpy.mockRestore();
	});

	it('clearParsedData resets parsing related state', () => {
		useOrderStore.setState({
			parsedData: [{ design_name: 'X' }] as any,
			rawResponse: { some: 'data' },
		});

		useOrderStore.getState().clearParsedData();

		expect(useOrderStore.getState().parsedData).toBeNull();
		expect(useOrderStore.getState().rawResponse).toBeNull();
	});

	it('reset clears all state', () => {
		useOrderStore.setState({
			orders: [{ id: '1' }] as any[],
			loading: true,
			error: 'error',
			parsedData: [] as any[],
		});

		useOrderStore.getState().reset();

		const state = useOrderStore.getState();
		expect(state.orders).toEqual([]);
		expect(state.loading).toBe(false);
		expect(state.error).toBeNull();
		expect(state.parsedData).toBeNull();
	});
});
