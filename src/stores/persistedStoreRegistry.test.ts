import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
	BUSINESS_PERSISTED_STORE_KEYS,
	clearPersistedBusinessStores,
} from './persistedStoreRegistry';
import { WRITE_QUEUE_HMAC_KEY } from '@/src/security/writeQueueIntegrity';

describe('persistedStoreRegistry', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('clears all registered business cache keys', async () => {
		await clearPersistedBusinessStores();

		for (const key of BUSINESS_PERSISTED_STORE_KEYS) {
			expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);
		}
	});

	it('clears offline queue payloads and rotates the queue signing key', async () => {
		await clearPersistedBusinessStores();

		expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@writeQueue/mutations');
		expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@writeQueue/deadLetter');
		expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@writeQueue/diagnostics');
		expect(WRITE_QUEUE_HMAC_KEY).toMatch(/^[A-Za-z0-9._-]+$/);
		expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
			WRITE_QUEUE_HMAC_KEY,
			expect.objectContaining({
				keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
			}),
		);
	});
});
