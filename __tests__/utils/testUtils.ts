import { useAuthStore } from '../../src/stores/authStore';
import { useCustomerStore } from '../../src/stores/customerStore';
import { useInvoiceStore } from '../../src/stores/invoiceStore';
import { useInventoryStore } from '../../src/stores/inventoryStore';
import { useFinanceStore } from '../../src/stores/financeStore';
import { useDashboardStore } from '../../src/stores/dashboardStore';
import { useNotificationStore } from '../../src/stores/notificationStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Reset all Zustand stores and clear persistent storage.
 * This is "safe" because it doesn't clear the global eventBus listeners
 * which are often added at the module level and needed for cross-store logic.
 */
export async function resetAllStores() {
	// Call .reset() on all stores that implement it
	// These only reset the internal state (values), not subscribers
	useAuthStore.getState().reset();
	useCustomerStore.getState().reset();
	useInvoiceStore.getState().reset();
	useInventoryStore.getState().reset();
	useFinanceStore.getState().reset();
	useDashboardStore.getState().reset();
	useNotificationStore.getState().reset();

	// Clear AsyncStorage to prevent persistence leakage between tests
	await AsyncStorage.clear();
}
