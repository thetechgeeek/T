import * as SecureStore from 'expo-secure-store';

const secureStoreOptions: SecureStore.SecureStoreOptions = {
	keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

export const secureSupabaseStorage = {
	async getItem(key: string) {
		return SecureStore.getItemAsync(key, secureStoreOptions);
	},

	async setItem(key: string, value: string) {
		await SecureStore.setItemAsync(key, value, secureStoreOptions);
	},

	async removeItem(key: string) {
		await SecureStore.deleteItemAsync(key, secureStoreOptions);
	},
};
