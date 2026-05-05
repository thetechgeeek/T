import {
	migrateCustomerStore,
	migrateDashboardStore,
	migrateFinanceStore,
	migrateInventoryStore,
	migrateInvoiceStore,
} from './persistedStoreMigrations';

describe('persisted store migrations', () => {
	it('migrates old invoice snapshots by dropping volatile search/customer filters', () => {
		expect(
			migrateInvoiceStore({
				filters: {
					search: 'private customer',
					customer_id: 'customer-1',
					payment_status: 'unpaid',
				},
			}),
		).toEqual({
			filters: {
				search: undefined,
				customer_id: undefined,
				payment_status: 'unpaid',
			},
		});
	});

	it('migrates old customer snapshots to non-PII filter defaults', () => {
		expect(
			migrateCustomerStore({
				filters: {
					search: 'phone number',
					type: 'dealer',
				},
			}),
		).toEqual({
			filters: {
				search: '',
				type: 'dealer',
				sortBy: 'name',
				sortDir: 'asc',
			},
		});
	});

	it('migrates old inventory snapshots while clearing search text', () => {
		expect(
			migrateInventoryStore({
				filters: {
					search: 'marble',
					category: 'MATT',
					lowStockOnly: true,
				},
			}),
		).toEqual({
			filters: {
				search: '',
				category: 'MATT',
				lowStockOnly: true,
				sortBy: 'created_at',
				sortDir: 'desc',
			},
		});
	});

	it('migrates finance date-range snapshots and drops invalid shapes', () => {
		expect(
			migrateFinanceStore({
				dateRange: { startDate: '2026-04-01', endDate: '2027-03-31' },
			}),
		).toEqual({
			dateRange: { startDate: '2026-04-01', endDate: '2027-03-31' },
		});

		expect(migrateFinanceStore({ dateRange: { startDate: 1 } })).toEqual({
			dateRange: { startDate: '', endDate: '' },
		});
	});

	it('drops unknown future versions to safe minimal cache state', () => {
		expect(migrateInvoiceStore({ filters: { payment_status: 'paid' } }, 99)).toEqual({
			filters: {},
		});
		expect(migrateCustomerStore({ filters: { type: 'dealer' } }, 99)).toEqual({
			filters: { search: '', type: 'ALL', sortBy: 'name', sortDir: 'asc' },
		});
		expect(migrateInventoryStore({ filters: { category: 'MATT' } }, 99)).toEqual({
			filters: {
				search: '',
				category: 'ALL',
				lowStockOnly: false,
				sortBy: 'created_at',
				sortDir: 'desc',
			},
		});
		expect(migrateFinanceStore({ dateRange: { startDate: 'x', endDate: 'y' } }, 99)).toEqual({
			dateRange: { startDate: '', endDate: '' },
		});
		expect(migrateDashboardStore()).toEqual({});
	});
});
