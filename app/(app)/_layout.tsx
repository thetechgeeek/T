import React, { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { Stack } from 'expo-router';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useOrderStore } from '@/src/stores/orderStore';
import { useDashboardStore } from '@/src/stores/dashboardStore';

export default function AppLayout() {
	const { theme } = useThemeTokens();
	const appState = useRef(AppState.currentState);

	const prefetchData = React.useCallback(async () => {
		// Critical path first — dashboard stats and inventory are shown on first visible screen
		await Promise.allSettled([
			useDashboardStore.getState().fetchStats(),
			useInventoryStore.getState().fetchItems(true),
		]);

		// Deferred — finance and orders are not on the first tab
		void Promise.allSettled([
			useInvoiceStore.getState().fetchInvoices(1),
			useCustomerStore.getState().fetchCustomers(true),
			useFinanceStore.getState().initialize(),
			useOrderStore.getState().fetchOrders(),
		]);
	}, []);

	// Prefetch on mount
	useEffect(() => {
		void prefetchData();
	}, [prefetchData]);

	// Refresh when app comes back to foreground
	useEffect(() => {
		const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
			if (appState.current.match(/inactive|background/) && nextState === 'active') {
				void prefetchData();
			}
			appState.current = nextState;
		});
		return () => subscription.remove();
	}, [prefetchData]);

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: theme.colors.background },
			}}
		/>
	);
}
