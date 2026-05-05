import { Alert } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { pdfService } from '@/src/services/pdfService';
import { useInvoiceDetailController } from './useInvoiceDetailController';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
	useRouter: jest.fn(() => ({ push: mockPush, back: jest.fn() })),
	useLocalSearchParams: jest.fn(() => ({ id: 'inv-1' })),
}));

jest.mock('@/src/stores/invoiceStore', () => ({
	useInvoiceStore: jest.fn(),
}));

jest.mock('@/src/services/pdfService', () => ({
	pdfService: {
		printAndShareInvoice: jest.fn(),
	},
}));

const t = (key: string) => key;
const formatDateShort = (date: string | Date) => String(date);

describe('useInvoiceDetailController', () => {
	const mockFetchInvoiceById = jest.fn();
	const mockClearCurrentInvoice = jest.fn();
	const invoice = {
		id: 'inv-1',
		invoice_number: 'TM/2026-27/0001',
		grand_total: 100,
		amount_paid: 0,
		payment_status: 'unpaid',
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockFetchInvoiceById.mockResolvedValue(undefined);
		(useInvoiceStore as unknown as jest.Mock).mockReturnValue({
			currentInvoice: invoice,
			fetchInvoiceById: mockFetchInvoiceById,
			loading: false,
			error: null,
			clearCurrentInvoice: mockClearCurrentInvoice,
		});
		(pdfService.printAndShareInvoice as jest.Mock).mockResolvedValue(undefined);
		jest.spyOn(Alert, 'alert').mockImplementation(() => {});
	});

	it('fetches invoice detail on mount and clears on unmount', () => {
		const { unmount } = renderHook(() => useInvoiceDetailController(t, formatDateShort));

		expect(mockFetchInvoiceById).toHaveBeenCalledWith('inv-1');

		unmount();
		expect(mockClearCurrentInvoice).toHaveBeenCalled();
	});

	it('shares the current invoice through the PDF service', async () => {
		const { result } = renderHook(() => useInvoiceDetailController(t, formatDateShort));

		await act(async () => {
			await result.current.handleShare();
		});

		expect(pdfService.printAndShareInvoice).toHaveBeenCalledWith(invoice, t, formatDateShort);
	});

	it('owns print placeholder action outside the screen component', () => {
		const { result } = renderHook(() => useInvoiceDetailController(t, formatDateShort));

		act(() => {
			result.current.handlePrintComingSoon();
		});

		expect(Alert.alert).toHaveBeenCalledWith('Print', 'Print feature coming soon');
	});
});
