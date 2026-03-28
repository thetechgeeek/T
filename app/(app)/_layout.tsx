import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useOrderStore } from '@/src/stores/orderStore';

export default function AppLayout() {
	const { theme } = useTheme();

	// Pre-fetch all major data stores on app load
	React.useEffect(() => {
		const prefetchData = async () => {
			try {
				await Promise.all([
					useInventoryStore.getState().fetchItems(true),
					useInvoiceStore.getState().fetchInvoices(1),
					useCustomerStore.getState().fetchCustomers(true),
					useFinanceStore.getState().fetchExpenses(),
					useFinanceStore.getState().fetchPurchases(),
					useFinanceStore.getState().fetchSummary(),
					useOrderStore.getState().fetchOrders(),
				]);
			} catch (err) {
				console.error('Failed to pre-fetch app data:', err);
			}
		};

		prefetchData();
	}, []);

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: theme.colors.background },
			}}
		/>
	);
}
