import * as SecureStore from 'expo-secure-store';
import { secureSupabaseStorage } from './secureSupabaseStorage';

describe('secureSupabaseStorage', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('stores Supabase auth values in SecureStore', async () => {
		await secureSupabaseStorage.setItem('session-key', 'secret-token');

		expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
			'session-key',
			'secret-token',
			expect.objectContaining({
				keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
			}),
		);
	});

	it('reads Supabase auth values from SecureStore', async () => {
		(SecureStore.getItemAsync as jest.Mock).mockResolvedValue('secret-token');

		await expect(secureSupabaseStorage.getItem('session-key')).resolves.toBe('secret-token');
	});

	it('removes Supabase auth values from SecureStore', async () => {
		await secureSupabaseStorage.removeItem('session-key');

		expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
			'session-key',
			expect.objectContaining({
				keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
			}),
		);
	});
});
