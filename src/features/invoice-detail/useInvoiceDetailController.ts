import { useCallback, useEffect, useState } from 'react';
import { ActionSheetIOS, Alert, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { pdfService } from '@/src/services/pdfService';

export function useInvoiceDetailController(
	t: (key: string) => string,
	formatDateShort: (date: string | Date) => string,
) {
	const { id } = useLocalSearchParams();
	const router = useRouter();
	const { currentInvoice, fetchInvoiceById, loading, error, clearCurrentInvoice } =
		useInvoiceStore();
	const [sharing, setSharing] = useState(false);
	const [paymentModalVisible, setPaymentModalVisible] = useState(false);
	const [paymentsExpanded, setPaymentsExpanded] = useState(true);

	useEffect(() => {
		if (id) fetchInvoiceById(id as string);
		return () => clearCurrentInvoice();
	}, [id, fetchInvoiceById, clearCurrentInvoice]);

	const handleShare = useCallback(async () => {
		if (!currentInvoice) return;
		setSharing(true);
		await pdfService.printAndShareInvoice(currentInvoice, t, formatDateShort);
		setSharing(false);
	}, [currentInvoice, t, formatDateShort]);

	const handleCall = useCallback((phone: string) => {
		Linking.openURL(`tel:${phone}`).catch(() =>
			Alert.alert('Error', 'Unable to open phone dialer'),
		);
	}, []);

	const handlePrintComingSoon = useCallback(() => {
		Alert.alert('Print', 'Print feature coming soon');
	}, []);

	const handleKebab = useCallback(() => {
		const options = ['Edit Invoice', 'Print', 'Cancel'];
		if (Platform.OS === 'ios') {
			ActionSheetIOS.showActionSheetWithOptions({ options, cancelButtonIndex: 2 }, (idx) => {
				if (idx === 0) router.push(`/(app)/invoices/create?edit=${currentInvoice?.id}`);
				if (idx === 1) handlePrintComingSoon();
			});
		} else {
			Alert.alert('Options', '', [
				{
					text: 'Edit Invoice',
					onPress: () => router.push(`/(app)/invoices/create?edit=${currentInvoice?.id}`),
				},
				{ text: 'Print', onPress: handlePrintComingSoon },
				{ text: 'Cancel', style: 'cancel' },
			]);
		}
	}, [currentInvoice, handlePrintComingSoon, router]);

	return {
		id,
		router,
		currentInvoice,
		fetchInvoiceById,
		loading,
		error,
		sharing,
		paymentModalVisible,
		setPaymentModalVisible,
		paymentsExpanded,
		setPaymentsExpanded,
		handleShare,
		handleCall,
		handleKebab,
		handlePrintComingSoon,
	};
}
