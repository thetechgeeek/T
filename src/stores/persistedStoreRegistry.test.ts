import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
	BUSINESS_PERSISTED_STORE_KEYS,
	clearPersistedBusinessStores,
} from './persistedStoreRegistry';

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
		expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
			'write-queue:hmac-key:v1',
			expect.objectContaining({
				keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
			}),
		);
	});
});
