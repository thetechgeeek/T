import React, { useEffect, useRef } from 'react';
import { AppState, InteractionManager, type AppStateStatus } from 'react-native';
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

	const fetchCriticalTabData = React.useCallback(async () => {
		// Critical path first — dashboard stats and inventory are shown on the first visible tab.
		await Promise.allSettled([
			useDashboardStore.getState().fetchStats(),
			useInventoryStore.getState().fetchItems(true),
		]);
	}, []);

	const preloadNextTabData = React.useCallback(() => {
		// Once the current screen is interactive, warm the next tab surfaces in the background.
		return InteractionManager.runAfterInteractions(() => {
			void Promise.allSettled([
				useInvoiceStore.getState().fetchInvoices(1),
				useCustomerStore.getState().fetchCustomers(true),
				useFinanceStore.getState().initialize(),
				useOrderStore.getState().fetchOrders(),
			]);
		});
	}, []);

	// Prefetch on mount
	useEffect(() => {
		let interactionTask: { cancel?: () => void } | undefined;

		void fetchCriticalTabData().then(() => {
			interactionTask = preloadNextTabData();
		});

		return () => {
			interactionTask?.cancel?.();
		};
	}, [fetchCriticalTabData, preloadNextTabData]);

	// Refresh when app comes back to foreground
	useEffect(() => {
		const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
			if (appState.current.match(/inactive|background/) && nextState === 'active') {
				void fetchCriticalTabData().then(() => {
					preloadNextTabData();
				});
			}
			appState.current = nextState;
		});
		return () => subscription.remove();
	}, [fetchCriticalTabData, preloadNextTabData]);

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: theme.colors.background },
			}}
		/>
	);
}
