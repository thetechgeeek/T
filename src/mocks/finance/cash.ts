/** Demo cash-ledger transactions (amounts in major currency units). */
export const MOCK_CASH_TRANSACTIONS = [
	{ id: '1', date: '2025-04-08', description: 'Sale INV-001', type: 'in' as const, amount: 5000 },
	{
		id: '2',
		date: '2025-04-08',
		description: 'Rent Expense',
		type: 'out' as const,
		amount: 2000,
	},
	{
		id: '3',
		date: '2025-04-07',
		description: 'Sale INV-002',
		type: 'in' as const,
		amount: 12000,
	},
	{
		id: '4',
		date: '2025-04-07',
		description: 'Labour Payment',
		type: 'out' as const,
		amount: 3500,
	},
	{ id: '5', date: '2025-04-06', description: 'Sale INV-003', type: 'in' as const, amount: 8000 },
	{
		id: '6',
		date: '2025-04-05',
		description: 'Packaging Materials',
		type: 'out' as const,
		amount: 1200,
	},
	{ id: '7', date: '2025-04-04', description: 'Sale INV-004', type: 'in' as const, amount: 4500 },
] as const;
