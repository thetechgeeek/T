import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { calculateInvoiceTotals } from '@/src/utils/gstCalculator';
import logger from '@/src/utils/logger';
import { useLocale } from '@/src/hooks/useLocale';
import { isInvoiceCustomerPhoneValid } from '@/src/schemas/invoice';
import type { InvoiceLineItemInput } from '@/src/types/invoice';
import { buildInvoiceCreatePayload } from './buildInvoiceCreatePayload';
import type { CustomerDraft, PaymentMode } from './invoiceCreateTypes';

export type { CustomerDraft, PaymentMode } from './invoiceCreateTypes';

export function useInvoiceCreateFlow() {
	const router = useRouter();
	const { t } = useLocale();

	// Step state
	const [step, setStep] = useState(1);

	// Step 1 — customer
	const [customer, setCustomer] = useState<CustomerDraft | null>(null);
	const [isInterState, setIsInterState] = useState(false);
	const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
	const [invoiceNumber, setInvoiceNumber] = useState<string>('INV-001');
	const [isCashSale, setIsCashSale] = useState(false);

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

	const step1Complete =
		isCashSale || (!!customer?.name && isInvoiceCustomerPhoneValid(customer.phone));

	// Navigation
	const handleNext = useCallback(() => {
		const canNext = (step === 1 && step1Complete) || (step === 2 && lineItems.length > 0);
		if (canNext) {
			setStep((s) => Math.min(s + 1, 3));
		}
	}, [step, customer, lineItems, isCashSale, step1Complete]);
	const handleBack = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);

	// Line item management
	const addLineItem = useCallback(() => {
		if (!selectedItem) return;

		const quantity = parseInt(inputQuantity) || 1;

		// UI-level stock validation
		if (quantity > selectedItem.box_count) {
			Alert.alert(
				t('invoice.errors.insufficientStock'),
				t('invoice.errors.stockLimitReached', {
					count: selectedItem.box_count,
					name: selectedItem.design_name,
				}),
				[{ text: t('common.ok') }],
			);
			return;
		}

		const ratePerUnit = selectedItem.selling_price ?? 0;
		if (!(ratePerUnit > 0)) {
			Alert.alert(
				t('common.errorTitle'),
				t('invoice.errors.noSellingPrice', { name: selectedItem.design_name }),
				[{ text: t('common.ok') }],
			);
			return;
		}

		setLineItems((prev) => [
			...prev,
			{
				item_id: selectedItem.id,
				design_name: selectedItem.design_name,
				quantity,
				rate_per_unit: ratePerUnit,
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
	}, [selectedItem, inputQuantity, inputDiscount, t]);

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
		if (!isCashSale && (!customer || !isInvoiceCustomerPhoneValid(customer.phone))) return;
		if (lineItems.length === 0) return;
		setSubmitting(true);
		try {
			const newInvoice = await useInvoiceStore.getState().createInvoice(
				buildInvoiceCreatePayload({
					isCashSale,
					customer,
					isInterState,
					lineItems,
					invoiceDate,
					invoiceNumber,
					amountPaidNum,
					grandTotal,
					paymentMode,
				}),
			);
			router.replace(`/(app)/invoices/${newInvoice.id}`);
		} catch (e: unknown) {
			logger.error('Failed to create invoice', e instanceof Error ? e : new Error(String(e)));
			Alert.alert(
				t('invoice.errors.createFailed'),
				e instanceof Error ? e.message : t('common.unexpectedError'),
				[{ text: t('common.ok') }],
			);
		} finally {
			setSubmitting(false);
		}
	}, [
		customer,
		isCashSale,
		lineItems,
		isInterState,
		invoiceDate,
		invoiceNumber,
		amountPaidNum,
		grandTotal,
		paymentMode,
		router,
		t,
	]);

	return {
		// Step navigation
		step,
		handleNext,
		handleBack,
		canGoNext: (step === 1 && step1Complete) || (step === 2 && lineItems.length > 0),

		// Customer step
		customer,
		setCustomer,
		isInterState,
		setIsInterState,
		invoiceDate,
		setInvoiceDate,
		invoiceNumber,
		setInvoiceNumber,
		isCashSale,
		setIsCashSale,

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
