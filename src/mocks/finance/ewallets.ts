/** Demo e-wallet records (balances in major currency units). */
export const MOCK_EWALLETS = [
	{
		id: '1',
		type: 'phonePe' as const,
		name: 'PhonePe',
		phone: '98765XXXXX',
		balance: 12500,
		emoji: '📱',
	},
	{
		id: '2',
		type: 'gpay' as const,
		name: 'GPay',
		phone: '98765XXXXX',
		balance: 4800,
		emoji: '📱',
	},
] as const;
