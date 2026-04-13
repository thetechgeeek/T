/** Demo cheque records (amounts in major currency units). */

export type ChequeStatus = 'open' | 'deposited' | 'bounced' | 'cancelled';

export interface Cheque {
	id: string;
	party_name: string;
	cheque_number: string;
	bank_name: string;
	cheque_date: string;
	amount: number;
	status: ChequeStatus;
}

export const MOCK_CHEQUES_RECEIVED: Cheque[] = [
	{
		id: '1',
		party_name: 'Rajesh Kumar',
		cheque_number: '123456',
		bank_name: 'SBI',
		cheque_date: '2025-04-10',
		amount: 25000,
		status: 'open',
	},
	{
		id: '2',
		party_name: 'Sharma Tiles',
		cheque_number: '789012',
		bank_name: 'HDFC',
		cheque_date: '2025-04-12',
		amount: 50000,
		status: 'open',
	},
	{
		id: '3',
		party_name: 'Patel & Sons',
		cheque_number: '345678',
		bank_name: 'ICICI',
		cheque_date: '2025-03-28',
		amount: 15000,
		status: 'deposited',
	},
];

export const MOCK_CHEQUES_ISSUED: Cheque[] = [
	{
		id: '4',
		party_name: 'Kajaria Ceramics',
		cheque_number: '654321',
		bank_name: 'SBI',
		cheque_date: '2025-04-15',
		amount: 80000,
		status: 'open',
	},
];
