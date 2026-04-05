import type { UUID } from '../types/common';

/**
 * Lightweight UUID v4 generator for React Native/Expo environments
 * where the global `crypto.randomUUID` might be missing.
 */
export function generateUUID(): UUID {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	}) as UUID;
}
