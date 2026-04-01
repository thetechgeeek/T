import { renderHook, act } from '@testing-library/react-native';
import { useInvoiceCreateFlow } from '../useInvoiceCreateFlow';
import { useInvoiceStore } from '@/src/stores/invoiceStore';

// ─── Store mocks ─────────────────────────────────────────────────────────────
// Note: jest.mock factories are hoisted — variables must be defined inline or
// accessed via require() after mocking.

jest.mock('@/src/stores/inventoryStore', () => {
	const mockFetchItems = jest.fn().mockResolvedValue(undefined);
	const mockSetFilters = jest.fn();
	const getState = jest.fn(() => ({ fetchItems: mockFetchItems }));
	const useInventoryStore = jest.fn(() => ({
		items: [],
		loading: false,
		setFilters: mockSetFilters,
	})) as unknown as { getState: typeof getState } & jest.Mock;
	useInventoryStore.getState = getState;
	return { useInventoryStore };
});

jest.mock('@/src/stores/invoiceStore', () => {
	const mockCreateInvoice = jest.fn();
	const getState = jest.fn(() => ({ createInvoice: mockCreateInvoice }));
	const mStore = jest.fn(() => ({
		invoices: [],
		fetchInvoices: jest.fn(),
	})) as unknown as { getState: typeof getState } & jest.Mock;
	mStore.getState = getState;
	return { useInvoiceStore: mStore };
});

jest.mock('expo-router', () => ({
	useRouter: jest.fn(() => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() })),
	useLocalSearchParams: jest.fn(() => ({})),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sampleInventoryItem = {
	id: 'item-001',
	design_name: 'GLOSSY WHITE 60x60',
	selling_price: 500,
	box_count: 50,
	category: 'GLOSSY',
	tile_image_url: undefined,
};

describe('useInvoiceCreateFlow', () => {
	let mockCreateInvoice: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		mockCreateInvoice = (useInvoiceStore.getState as jest.Mock)().createInvoice;
		mockCreateInvoice.mockResolvedValue({ id: 'new-inv-001' });
	});

	it('initial state — step=1, customer=null, lineItems=[], submitting=false', () => {
		const { result } = renderHook(() => useInvoiceCreateFlow());

		expect(result.current.step).toBe(1);
		expect(result.current.customer).toBeNull();
		expect(result.current.lineItems).toEqual([]);
		expect(result.current.submitting).toBe(false);
	});

	it('handleNext without customerData does NOT advance (canGoNext=false)', () => {
		const { result } = renderHook(() => useInvoiceCreateFlow());

		act(() => {
			result.current.handleNext();
		});

		expect(result.current.step).toBe(1);
		expect(result.current.canGoNext).toBe(false);
	});

	it('setCustomer then handleNext advances to step 2', () => {
		const { result } = renderHook(() => useInvoiceCreateFlow());

		act(() => {
			result.current.setCustomer({ name: 'John', phone: '9876543210' });
		});

		expect(result.current.canGoNext).toBe(true);

		act(() => {
			result.current.handleNext();
		});

		expect(result.current.step).toBe(2);
	});

	it('handleNext at step 2 with no lineItems does NOT advance to step 3', () => {
		const { result } = renderHook(() => useInvoiceCreateFlow());

		// Advance to step 2
		act(() => {
			result.current.setCustomer({ name: 'John' });
		});
		act(() => {
			result.current.handleNext();
		});
		expect(result.current.step).toBe(2);

		// Try to advance without line items
		act(() => {
			result.current.handleNext();
		});

		expect(result.current.step).toBe(2);
		expect(result.current.canGoNext).toBe(false);
	});

	it('selectInventoryItem + addLineItem adds item to lineItems', () => {
		const { result } = renderHook(() => useInvoiceCreateFlow());

		act(() => {
			result.current.selectInventoryItem(
				sampleInventoryItem as Parameters<typeof result.current.selectInventoryItem>[0],
			);
		});
		act(() => {
			result.current.addLineItem();
		});

		expect(result.current.lineItems).toHaveLength(1);
		expect(result.current.lineItems[0].item_id).toBe('item-001');
	});

	it('selectInventoryItem + addLineItem twice results in 2 lineItems', () => {
		const { result } = renderHook(() => useInvoiceCreateFlow());

		act(() =>
			result.current.selectInventoryItem(
				sampleInventoryItem as Parameters<typeof result.current.selectInventoryItem>[0],
			),
		);
		act(() => result.current.addLineItem());
		act(() =>
			result.current.selectInventoryItem(
				sampleInventoryItem as Parameters<typeof result.current.selectInventoryItem>[0],
			),
		);
		act(() => result.current.addLineItem());

		expect(result.current.lineItems).toHaveLength(2);
	});

	it('removeLineItem(0) removes the first item and keeps the second', () => {
		const secondItem = { ...sampleInventoryItem, id: 'item-002', design_name: 'MATT GREY' };
		const { result } = renderHook(() => useInvoiceCreateFlow());

		act(() =>
			result.current.selectInventoryItem(
				sampleInventoryItem as Parameters<typeof result.current.selectInventoryItem>[0],
			),
		);
		act(() => result.current.addLineItem());
		act(() =>
			result.current.selectInventoryItem(
				secondItem as Parameters<typeof result.current.selectInventoryItem>[0],
			),
		);
		act(() => result.current.addLineItem());

		expect(result.current.lineItems).toHaveLength(2);

		act(() => {
			result.current.removeLineItem(0);
		});

		expect(result.current.lineItems).toHaveLength(1);
		expect(result.current.lineItems[0].item_id).toBe('item-002');
	});

	it('submitInvoice calls invoiceStore.createInvoice with merged data', async () => {
		const { result } = renderHook(() => useInvoiceCreateFlow());

		act(() => result.current.setCustomer({ name: 'Test Customer', phone: '9876543210' }));
		act(() =>
			result.current.selectInventoryItem(
				sampleInventoryItem as Parameters<typeof result.current.selectInventoryItem>[0],
			),
		);
		act(() => result.current.addLineItem());
		act(() => result.current.setAmountPaid('0'));

		await act(async () => {
			await result.current.submitInvoice();
		});

		expect(mockCreateInvoice).toHaveBeenCalledWith(
			expect.objectContaining({
				customer_name: 'Test Customer',
				line_items: expect.arrayContaining([
					expect.objectContaining({ item_id: 'item-001' }),
				]),
				payment_status: 'unpaid',
			}),
		);
	});

	it('submitInvoice sets submitting=true during submission, false after', async () => {
		let resolveSubmit!: (v: unknown) => void;
		const deferredPromise = new Promise((r) => {
			resolveSubmit = r;
		});
		mockCreateInvoice.mockReturnValueOnce(deferredPromise);

		const { result } = renderHook(() => useInvoiceCreateFlow());

		act(() => result.current.setCustomer({ name: 'Customer' }));
		act(() =>
			result.current.selectInventoryItem(
				sampleInventoryItem as Parameters<typeof result.current.selectInventoryItem>[0],
			),
		);
		act(() => result.current.addLineItem());

		// Start submit without awaiting
		act(() => {
			void result.current.submitInvoice();
		});

		expect(result.current.submitting).toBe(true);

		await act(async () => {
			resolveSubmit({ id: 'new-inv' });
			await deferredPromise;
		});

		expect(result.current.submitting).toBe(false);
	});

	it('submitInvoice on failure sets submitting=false', async () => {
		mockCreateInvoice.mockRejectedValueOnce(new Error('Submit failed'));

		const { result } = renderHook(() => useInvoiceCreateFlow());

		act(() => result.current.setCustomer({ name: 'Customer' }));
		act(() =>
			result.current.selectInventoryItem(
				sampleInventoryItem as Parameters<typeof result.current.selectInventoryItem>[0],
			),
		);
		act(() => result.current.addLineItem());

		await act(async () => {
			await result.current.submitInvoice();
		});

		expect(result.current.submitting).toBe(false);
	});
});
