/** Demo account list used in the transfer screen (balances in major currency units). */
export const MOCK_TRANSFER_ACCOUNTS = [
	{ id: 'cash', name: 'Cash in Hand', balance: 15000, type: 'Cash' },
	{ id: 'sbi', name: 'SBI Savings', balance: 85000, type: 'Bank' },
	{ id: 'hdfc', name: 'HDFC Current', balance: 230000, type: 'Bank' },
] as const;
