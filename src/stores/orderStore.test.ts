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

	// ─── fetchOrders: loading lifecycle & error ───────────────────────────────

	it('fetchOrders: loading=true during fetch, false after success', async () => {
		let resolve!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolve = r;
		});
		(orderService.fetchOrders as jest.Mock).mockReturnValue(p);

		const fetchPromise = useOrderStore.getState().fetchOrders();
		expect(useOrderStore.getState().loading).toBe(true);

		resolve([]);
		await fetchPromise;

		expect(useOrderStore.getState().loading).toBe(false);
	});

	it('fetchOrders error: loading=false, error set, orders unchanged', async () => {
		useOrderStore.setState({ orders: [{ id: 'o1' }] as any[] });
		(orderService.fetchOrders as jest.Mock).mockRejectedValue(new Error('Network error'));

		await useOrderStore.getState().fetchOrders();

		const state = useOrderStore.getState();
		expect(state.loading).toBe(false);
		expect(state.error).toBeTruthy();
		expect(state.orders).toHaveLength(1);
	});

	// ─── parseDocument ────────────────────────────────────────────────────────

	it('parseDocument: isParsing=true during call, false after', async () => {
		let resolve!: (v: unknown) => void;
		const p = new Promise((r) => {
			resolve = r;
		});
		(pdfService.parseDocumentWithLLM as jest.Mock).mockReturnValue(p);

		const parsePromise = useOrderStore.getState().parseDocument('uri', 'application/pdf');
		expect(useOrderStore.getState().isParsing).toBe(true);

		resolve([]);
		await parsePromise;

		expect(useOrderStore.getState().isParsing).toBe(false);
	});

	it('parseDocument error: isParsing=false, error set', async () => {
		(pdfService.parseDocumentWithLLM as jest.Mock).mockRejectedValue(new Error('Parse failed'));

		try {
			await useOrderStore.getState().parseDocument('bad-uri', 'application/pdf');
		} catch {
			// parseDocument re-throws
		}

		const state = useOrderStore.getState();
		expect(state.isParsing).toBe(false);
		expect(state.error).toBe('Parse failed');
	});

	// ─── importParsedData ────────────────────────────────────────────────────

	it('importParsedData error: loading=false, error set', async () => {
		(orderService.importOrder as jest.Mock).mockRejectedValue(new Error('Import failed'));

		await expect(useOrderStore.getState().importParsedData('Party', [])).rejects.toThrow(
			'Import failed',
		);

		const state = useOrderStore.getState();
		expect(state.loading).toBe(false);
		expect(state.error).toBeTruthy();
	});

	it('importParsedData refreshes order list after success', async () => {
		(orderService.importOrder as jest.Mock).mockResolvedValue({ id: 'o2' });
		(orderService.fetchOrders as jest.Mock).mockResolvedValue([{ id: 'o2' }]);

		await useOrderStore.getState().importParsedData('Party', []);

		expect(orderService.fetchOrders).toHaveBeenCalled();
		expect(useOrderStore.getState().orders).toHaveLength(1);
	});
});
