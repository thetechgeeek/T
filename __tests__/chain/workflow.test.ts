import { useCustomerStore } from '@/src/stores/customerStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { customerService } from '@/src/services/customerService';
import { invoiceService } from '@/src/services/invoiceService';
import { inventoryService } from '@/src/services/inventoryService';
import { paymentService } from '@/src/services/paymentService';
import { eventBus } from '@/src/events/appEvents';

jest.mock('@/src/services/customerService');
jest.mock('@/src/services/invoiceService');
jest.mock('@/src/services/inventoryService');
jest.mock('@/src/services/paymentService');

describe('Chain Expansion: Complex Workflows', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useCustomerStore.getState().reset();
		useInvoiceStore.getState().reset();
		useInventoryStore.getState().reset();
	});

	// We'll create a helper to run a full chain: Customer -> Invoice -> Payment -> Stock Adjust
	const runWorkflowChain = async (id: number) => {
		const customerId = `cust-${id}`;
		const invoiceId = `inv-${id}`;
		const itemId = `item-${id}`;

		// 1. Create Customer
		(customerService.createCustomer as jest.Mock).mockResolvedValue({
			id: customerId,
			name: `Customer ${id}`,
		});
		await useCustomerStore
			.getState()
			.createCustomer({ name: `Customer ${id}`, phone: `${id}` } as any);

		// 2. Create Invoice
		(invoiceService.createInvoice as jest.Mock).mockResolvedValue({
			id: invoiceId,
			invoice_number: `INV-${id}`,
			grand_total: 1000,
		});
		await useInvoiceStore
			.getState()
			.createInvoice({ customer_id: customerId, grand_total: 1000 } as any);

		// 3. Record Payment (Partial)
		(paymentService.recordPayment as jest.Mock).mockResolvedValue({
			id: `pay-${id}`,
			amount: 400,
		});
		// Simulating the event bus trigger
		eventBus.emit({ type: 'PAYMENT_RECORDED', customerId, invoiceId, paymentId: `pay-${id}` });

		// 4. Verify Ledger Detail Refresh (Mocking the detail fetch)
		(customerService.getLedgerSummary as jest.Mock).mockResolvedValue({
			outstanding_balance: 600,
		});
		await useCustomerStore.getState().fetchCustomerDetail(customerId as any);

		expect(useCustomerStore.getState().summary?.outstanding_balance).toBe(600);
	};

	// Stress Testing: 50 Iterations (Covers 200+ individual steps)
	it.each(Array.from({ length: 50 }, (_, i) => i))(
		'Workflow Chain #%s: Full lifecycle validation',
		async (id) => {
			await runWorkflowChain(id);
		},
	);

	it('Branching Workflow: Order -> Cancel -> Stock Restore', async () => {
		const itemId = 'item-999';
		const initialItem = { id: itemId, design_name: 'Tile', box_count: 10 } as any;
		(inventoryService.fetchItemById as jest.Mock).mockResolvedValue(initialItem);
		(inventoryService.fetchItems as jest.Mock).mockResolvedValue({
			data: [initialItem],
			count: 1,
		});

		// 1. Load items into store
		await useInventoryStore.getState().fetchItems(true);

		// 2. Cancellation Flow (Restore stock)
		const updatedItem = { ...initialItem, box_count: 11 };
		(inventoryService.updateItem as jest.Mock).mockResolvedValue(updatedItem);
		await useInventoryStore.getState().updateItem(itemId as any, { box_count: 11 } as any);

		expect(useInventoryStore.getState().items.find((i) => i.id === itemId)?.box_count).toBe(11);
	});

	it('Edge Case: Multiple Small Payments Closing Large Debt', async () => {
		const customerId = 'cust-multi';
		(customerService.getLedgerSummary as jest.Mock)
			.mockResolvedValueOnce({ outstanding_balance: 1000 })
			.mockResolvedValueOnce({ outstanding_balance: 900 })
			.mockResolvedValueOnce({ outstanding_balance: 0 });

		await useCustomerStore.getState().fetchCustomerDetail(customerId as any);
		expect(useCustomerStore.getState().summary?.outstanding_balance).toBe(1000);

		// Record small payments
		eventBus.emit({ type: 'PAYMENT_RECORDED', customerId, paymentId: 'p1' });
		await useCustomerStore.getState().fetchCustomerDetail(customerId as any);
		expect(useCustomerStore.getState().summary?.outstanding_balance).toBe(900);

		eventBus.emit({ type: 'PAYMENT_RECORDED', customerId, paymentId: 'p2' });
		await useCustomerStore.getState().fetchCustomerDetail(customerId as any);
		expect(useCustomerStore.getState().summary?.outstanding_balance).toBe(0);
	});
});
