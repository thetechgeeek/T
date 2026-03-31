import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { calculateInvoiceTotals } from '@/src/utils/gstCalculator';
import logger from '@/src/utils/logger';
import type { InvoiceLineItemInput } from '@/src/types/invoice';

export interface CustomerDraft {
	id?: string;
	name: string;
	phone?: string;
	gstin?: string;
	address?: string;
}

export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'credit';

export function useInvoiceCreateFlow() {
	const router = useRouter();

	// Step state
	const [step, setStep] = useState(1);

	// Step 1 — customer
	const [customer, setCustomer] = useState<CustomerDraft | null>(null);
	const [isInterState, setIsInterState] = useState(false);

	// Step 2 — line items + inventory search
	const { items: inventoryItems, loading: inventoryLoading, setFilters } = useInventoryStore();
	const [lineItems, setLineItems] = useState<InvoiceLineItemInput[]>([]);
	const [isAddingItem, setIsAddingItem] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedItem, setSelectedItem] = useState<(typeof inventoryItems)[0] | null>(null);
	const [inputQuantity, setInputQuantity] = useState('1');
	const [inputDiscount, setInputDiscount] = useState('0');

	// Step 3 — payment
	const [amountPaid, setAmountPaid] = useState('');
	const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');

	// Submission
	const [submitting, setSubmitting] = useState(false);

	// Load inventory on mount
	useEffect(() => {
		useInventoryStore.getState().fetchItems();
	}, []);

	// Debounced search
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	useEffect(() => {
		if (!isAddingItem) return;
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			setFilters({ search: searchQuery });
		}, 400);
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [searchQuery, isAddingItem, setFilters]);

	// Totals
	const invoiceTotals = calculateInvoiceTotals(lineItems, isInterState);
	const grandTotal = invoiceTotals.grand_total;
	const amountPaidNum = parseFloat(amountPaid) || 0;

	// Navigation
	const handleNext = useCallback(() => {
		const canNext = (step === 1 && !!customer?.name) || (step === 2 && lineItems.length > 0);
		if (canNext) {
			setStep((s) => Math.min(s + 1, 3));
		}
	}, [step, customer, lineItems]);
	const handleBack = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);

	// Line item management
	const addLineItem = useCallback(() => {
		if (!selectedItem) return;

		const quantity = parseInt(inputQuantity) || 1;

		// UI-level stock validation
		if (quantity > selectedItem.box_count) {
			Alert.alert(
				'Insufficient Stock',
				`You only have ${selectedItem.box_count} boxes of ${selectedItem.design_name} available.`,
				[{ text: 'OK' }],
			);
			return;
		}

		setLineItems((prev) => [
			...prev,
			{
				item_id: selectedItem.id,
				design_name: selectedItem.design_name,
				quantity,
				rate_per_unit: selectedItem.selling_price || 0,
				discount: parseFloat(inputDiscount) || 0,
				gst_rate: 18,
				tile_image_url: selectedItem.tile_image_url,
			},
		]);
		setSelectedItem(null);
		setIsAddingItem(false);
		setSearchQuery('');
		setInputQuantity('1');
		setInputDiscount('0');
	}, [selectedItem, inputQuantity, inputDiscount]);

	const removeLineItem = useCallback((index: number) => {
		setLineItems((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const selectInventoryItem = useCallback((item: (typeof inventoryItems)[0]) => {
		setSelectedItem(item);
		setInputQuantity('1');
		setInputDiscount('0');
	}, []);

	// Submit
	const submitInvoice = useCallback(async () => {
		if (!customer || lineItems.length === 0) return;
		setSubmitting(true);
		try {
			const newInvoice = await useInvoiceStore.getState().createInvoice({
				customer_id: customer.id,
				customer_name: customer.name,
				customer_phone: customer.phone,
				customer_address: customer.address,
				customer_gstin: customer.gstin,
				is_inter_state: isInterState,
				line_items: lineItems,
				invoice_date: new Date().toISOString().split('T')[0],
				payment_status:
					amountPaidNum >= grandTotal ? 'paid' : amountPaidNum > 0 ? 'partial' : 'unpaid',
				payment_mode: amountPaidNum > 0 ? paymentMode : undefined,
				amount_paid: amountPaidNum,
			});
			router.replace(`/(app)/invoices/${newInvoice.id}`);
		} catch (e: unknown) {
			logger.error('Failed to create invoice', e instanceof Error ? e : new Error(String(e)));
			Alert.alert(
				'Error Creating Invoice',
				e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.',
				[{ text: 'OK' }],
			);
		} finally {
			setSubmitting(false);
		}
	}, [customer, lineItems, isInterState, amountPaidNum, grandTotal, paymentMode, router]);

	return {
		// Step navigation
		step,
		handleNext,
		handleBack,
		canGoNext: (step === 1 && !!customer?.name) || (step === 2 && lineItems.length > 0),

		// Customer step
		customer,
		setCustomer,
		isInterState,
		setIsInterState,

		// Line items step
		lineItems,
		addLineItem,
		removeLineItem,
		isAddingItem,
		setIsAddingItem,
		inventoryItems,
		inventoryLoading,
		searchQuery,
		setSearchQuery,
		selectedItem,
		selectInventoryItem,
		cancelItemSelection: () => setSelectedItem(null),
		inputQuantity,
		setInputQuantity,
		inputDiscount,
		setInputDiscount,

		// Payment step
		grandTotal,
		amountPaid,
		setAmountPaid,
		amountPaidNum,
		paymentMode,
		setPaymentMode,

		// Submission
		submitting,
		submitInvoice,
	};
}
