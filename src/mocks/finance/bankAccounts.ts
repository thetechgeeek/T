/** Demo bank accounts (balances in major currency units). */
export const MOCK_BANK_ACCOUNTS = [
	{
		id: '1',
		bank_name: 'HDFC Bank',
		account_type: 'Current',
		account_number: '50100123456789',
		account_holder: 'Ravi Tiles & Ceramics',
		balance: 285000,
		is_primary: true,
	},
	{
		id: '2',
		bank_name: 'SBI',
		account_type: 'Savings',
		account_number: '32101234567890',
		account_holder: 'Ravi Kumar',
		balance: 52000,
		is_primary: false,
	},
	{
		id: '3',
		bank_name: 'ICICI Bank',
		account_type: 'Overdraft',
		account_number: '006201234567',
		account_holder: 'Ravi Tiles & Ceramics',
		balance: -15000,
		is_primary: false,
	},
] as const;
