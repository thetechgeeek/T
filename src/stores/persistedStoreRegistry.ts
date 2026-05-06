import AsyncStorage from '@react-native-async-storage/async-storage';
import { writeQueue } from '@/src/services/writeQueueService';

export const BUSINESS_PERSISTED_STORE_KEYS = [
	'invoice-storage',
	'customer-storage',
	'inventory-storage',
	'finance-storage',
	'dashboard-storage',
];

export async function clearPersistedBusinessStores() {
	await Promise.all([
		...BUSINESS_PERSISTED_STORE_KEYS.map((key) => AsyncStorage.removeItem(key)),
		writeQueue.clearAllPersistence(),
	]);
}
