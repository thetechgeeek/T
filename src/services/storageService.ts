import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import logger from '../utils/logger';

export type StorageBucket = 'branding' | 'order-pdfs';

export const storageService = {
	/**
	 * Upload a file from a URI to Supabase Storage.
	 * Handles URI -> base64 -> Uint8Array conversion for Supabase compatibility in React Native.
	 */
	async uploadFile(
		bucket: StorageBucket,
		uri: string,
		fileName: string,
		options: { contentType?: string; upsert?: boolean } = {},
	): Promise<string> {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error('User not authenticated');

			// Path: userId/filename
			const storagePath = `${user.id}/${fileName}`;

			// Read file as base64
			const base64 = await FileSystem.readAsStringAsync(uri, {
				encoding: FileSystem.EncodingType.Base64,
			});

			// Convert base64 -> Uint8Array
			// Note: Buffer is not globally available in standard RN, but atob is usually polyfilled
			const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

			const { data, error } = await supabase.storage
				.from(bucket)
				.upload(storagePath, binary, {
					contentType: options.contentType || 'application/octet-stream',
					upsert: options.upsert ?? true,
				});

			if (error) {
				logger.error(`Storage upload failed to bucket ${bucket}`, new Error(error.message));
				throw new Error(error.message);
			}

			return data.path;
		} catch (e) {
			logger.error(
				'storageService.uploadFile exception',
				e instanceof Error ? e : new Error(String(e)),
			);
			throw e;
		}
	},

	/**
	 * Get the public URL for a file in a storage bucket.
	 */
	getPublicUrl(bucket: StorageBucket, path: string): string {
		const {
			data: { publicUrl },
		} = supabase.storage.from(bucket).getPublicUrl(path);
		return publicUrl;
	},

	/**
	 * Delete a file from storage.
	 */
	async deleteFile(bucket: StorageBucket, path: string): Promise<void> {
		const { error } = await supabase.storage.from(bucket).remove([path]);
		if (error) {
			logger.error(`Failed to delete file from ${bucket}`, new Error(error.message));
			throw new Error(error.message);
		}
	},
};
