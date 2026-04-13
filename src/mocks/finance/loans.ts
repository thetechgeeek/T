/** Demo loan record (amounts in major currency units, rate in % per annum). */
export const MOCK_LOAN = {
	id: '1',
	lenderName: 'State Bank of India',
	loanType: 'Term Loan',
	principalAmount: 500000,
	outstandingAmount: 423180,
	interestRate: 10.5,
	tenureMonths: 60,
	disbursementDate: '2024-01-15',
	nextEmiDate: '2026-05-15',
} as const;
