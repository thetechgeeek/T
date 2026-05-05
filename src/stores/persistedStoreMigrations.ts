import type { CustomerFilters } from '../types/customer';
import type { InventoryFilters } from '../types/inventory';

export const BUSINESS_PERSISTED_STORE_VERSION = 1;

const DEFAULT_CUSTOMER_FILTERS: CustomerFilters = {
	search: '',
	type: 'ALL',
	sortBy: 'name',
	sortDir: 'asc',
};

const DEFAULT_INVENTORY_FILTERS: InventoryFilters = {
	search: '',
	category: 'ALL',
	lowStockOnly: false,
	sortBy: 'created_at',
	sortDir: 'desc',
};

function isFutureVersion(persistedVersion?: number) {
	return (
		typeof persistedVersion === 'number' && persistedVersion > BUSINESS_PERSISTED_STORE_VERSION
	);
}

function asRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function nestedRecord(value: unknown, key: string): Record<string, unknown> {
	return asRecord(asRecord(value)[key]);
}

export function migrateInvoiceStore(persistedState: unknown, persistedVersion?: number) {
	if (isFutureVersion(persistedVersion)) {
		return { filters: {} };
	}

	const filters = nestedRecord(persistedState, 'filters');
	return {
		filters: {
			...filters,
			search: undefined,
			customer_id: undefined,
		},
	};
}

export function migrateCustomerStore(persistedState: unknown, persistedVersion?: number) {
	if (isFutureVersion(persistedVersion)) {
		return { filters: DEFAULT_CUSTOMER_FILTERS };
	}

	const filters = nestedRecord(persistedState, 'filters');
	return {
		filters: {
			search: '',
			type: filters.type ?? DEFAULT_CUSTOMER_FILTERS.type,
			sortBy: filters.sortBy ?? DEFAULT_CUSTOMER_FILTERS.sortBy,
			sortDir: filters.sortDir ?? DEFAULT_CUSTOMER_FILTERS.sortDir,
		},
	};
}

export function migrateInventoryStore(persistedState: unknown, persistedVersion?: number) {
	if (isFutureVersion(persistedVersion)) {
		return { filters: DEFAULT_INVENTORY_FILTERS };
	}

	const filters = nestedRecord(persistedState, 'filters');
	return {
		filters: {
			...DEFAULT_INVENTORY_FILTERS,
			...filters,
			search: '',
		},
	};
}

export function migrateFinanceStore(persistedState: unknown, persistedVersion?: number) {
	if (isFutureVersion(persistedVersion)) {
		return { dateRange: { startDate: '', endDate: '' } };
	}

	const dateRange = nestedRecord(persistedState, 'dateRange');
	return {
		dateRange:
			typeof dateRange.startDate === 'string' && typeof dateRange.endDate === 'string'
				? dateRange
				: { startDate: '', endDate: '' },
	};
}

export function migrateDashboardStore() {
	return {};
}
