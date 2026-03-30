import type { Customer } from '../../src/types/customer';

export type CustomerInput = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;

export function makeCustomer(overrides?: Partial<Customer>): Customer {
	return {
		id: 'cust-uuid-001',
		name: 'Test Customer',
		phone: '9876543210',
		gstin: '',
		address: '123 Test St',
		city: 'Mumbai',
		state: 'Maharashtra',
		type: 'retail',
		credit_limit: 0,
		created_at: '2026-01-01T00:00:00.000Z',
		updated_at: '2026-01-01T00:00:00.000Z',
		...overrides,
	};
}

export function makeCustomerInput(overrides?: Partial<CustomerInput>): CustomerInput {
	const { id: _id, created_at: _ca, updated_at: _ua, ...base } = makeCustomer();
	return { ...base, ...overrides };
}
