import React, { useEffect, useRef } from 'react';
import { AppState, InteractionManager, type AppStateStatus } from 'react-native';
import { Stack } from 'expo-router';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { useInvoiceStore } from '@/src/stores/invoiceStore';
import { useFinanceStore } from '@/src/stores/financeStore';
import { useOrderStore } from '@/src/stores/orderStore';
import { useDashboardStore } from '@/src/stores/dashboardStore';
import {
	measureStartupWarmup,
	shouldRunStartupWarmup,
	STARTUP_CRITICAL_CALL_BUDGET,
	STARTUP_DEFERRED_CALL_BUDGET,
} from '@/src/orchestrators/startupWarmup';

export default function AppLayout() {
	const { theme } = useThemeTokens();
	const appState = useRef(AppState.currentState);
	const lastCriticalWarmupAt = useRef<number | null>(null);
	const lastDeferredWarmupAt = useRef<number | null>(null);

	const fetchCriticalTabData = React.useCallback(async (source: 'mount' | 'foreground') => {
		// Critical path first — dashboard stats and inventory are shown on the first visible tab.
		await measureStartupWarmup('critical', source, STARTUP_CRITICAL_CALL_BUDGET, () =>
			Promise.allSettled([
				useDashboardStore.getState().fetchStats(),
				useInventoryStore.getState().fetchItems(true),
			]),
		);
		lastCriticalWarmupAt.current = Date.now();
	}, []);

	const preloadNextTabData = React.useCallback((source: 'mount' | 'foreground') => {
		// Once the current screen is interactive, warm the next tab surfaces in the background.
		return InteractionManager.runAfterInteractions(() => {
			void measureStartupWarmup('deferred', source, STARTUP_DEFERRED_CALL_BUDGET, () =>
				Promise.allSettled([
					useInvoiceStore.getState().fetchInvoices(1),
					useFinanceStore.getState().initialize(),
					useOrderStore.getState().fetchOrders(),
				]),
			).then(() => {
				lastDeferredWarmupAt.current = Date.now();
			});
		});
	}, []);

	// Prefetch on mount
	useEffect(() => {
		let interactionTask: { cancel?: () => void } | undefined;

		void fetchCriticalTabData('mount').then(() => {
			interactionTask = preloadNextTabData('mount');
		});

		return () => {
			interactionTask?.cancel?.();
		};
	}, [fetchCriticalTabData, preloadNextTabData]);

	// Refresh when app comes back to foreground
	useEffect(() => {
		const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
			if (appState.current.match(/inactive|background/) && nextState === 'active') {
				if (shouldRunStartupWarmup(lastCriticalWarmupAt.current)) {
					void fetchCriticalTabData('foreground').then(() => {
						if (shouldRunStartupWarmup(lastDeferredWarmupAt.current)) {
							preloadNextTabData('foreground');
						}
					});
				} else if (shouldRunStartupWarmup(lastDeferredWarmupAt.current)) {
					preloadNextTabData('foreground');
				}
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
