import AsyncStorage from '@react-native-async-storage/async-storage';
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
});
