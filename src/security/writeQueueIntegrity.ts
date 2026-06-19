import * as SecureStore from 'expo-secure-store';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes, randomBytes, utf8ToBytes } from '@noble/hashes/utils';
import { AppError } from '@/src/errors/AppError';

export const WRITE_QUEUE_SIGNATURE_VERSION = 1;

const HMAC_KEY_BYTES = 32;
export const WRITE_QUEUE_HMAC_KEY = 'write-queue.hmac-key.v1';

const secureStoreOptions: SecureStore.SecureStoreOptions = {
	keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

let cachedKeyHex: string | undefined;

export interface SignableQueuedMutation {
	id: string;
	type: string;
	table: string;
	payload: Record<string, unknown>;
	idempotencyKey: string;
	pendingAt?: string;
	priority?: number;
}

export interface WriteQueueSignatureFields {
	signature: string;
	signatureVersion: typeof WRITE_QUEUE_SIGNATURE_VERSION;
	signedAt: string;
}

function normalizeForCanonicalJson(value: unknown): unknown {
	if (value === null) return null;

	const valueType = typeof value;
	if (valueType === 'string' || valueType === 'boolean') return value;
	if (valueType === 'number') return Number.isFinite(value) ? value : null;

	if (Array.isArray(value)) {
		return value.map((item) =>
			typeof item === 'undefined' || typeof item === 'function'
				? null
				: normalizeForCanonicalJson(item),
		);
	}

	if (valueType === 'object') {
		const normalized: Record<string, unknown> = {};
		const source = value as Record<string, unknown>;
		for (const key of Object.keys(source).sort()) {
			const item = source[key];
			if (typeof item === 'undefined' || typeof item === 'function') continue;
			normalized[key] = normalizeForCanonicalJson(item);
		}
		return normalized;
	}

	return null;
}

export function canonicalizeQueuedMutation(mutation: SignableQueuedMutation): string {
	return JSON.stringify(
		normalizeForCanonicalJson({
			id: mutation.id,
			type: mutation.type,
			table: mutation.table,
			payload: mutation.payload,
			idempotencyKey: mutation.idempotencyKey,
			pendingAt: mutation.pendingAt,
			priority: mutation.priority,
		}),
	);
}

async function getOrCreateHmacKey(): Promise<Uint8Array> {
	if (cachedKeyHex) return hexToBytes(cachedKeyHex);

	const stored = await SecureStore.getItemAsync(WRITE_QUEUE_HMAC_KEY, secureStoreOptions);
	if (stored) {
		cachedKeyHex = stored;
		return hexToBytes(stored);
	}

	try {
		cachedKeyHex = bytesToHex(randomBytes(HMAC_KEY_BYTES));
	} catch (error: unknown) {
		throw new AppError(
			'Unable to create offline queue signing key',
			'WRITE_QUEUE_SIGNATURE_KEY_UNAVAILABLE',
			'Offline changes cannot be saved securely on this device.',
			error,
		);
	}

	await SecureStore.setItemAsync(WRITE_QUEUE_HMAC_KEY, cachedKeyHex, secureStoreOptions);
	return hexToBytes(cachedKeyHex);
}

export async function signQueuedMutation(
	mutation: SignableQueuedMutation,
	now = new Date(),
): Promise<WriteQueueSignatureFields> {
	const key = await getOrCreateHmacKey();
	const signature = bytesToHex(
		hmac(sha256, key, utf8ToBytes(canonicalizeQueuedMutation(mutation))),
	);

	return {
		signature,
		signatureVersion: WRITE_QUEUE_SIGNATURE_VERSION,
		signedAt: now.toISOString(),
	};
}

export async function verifyQueuedMutationSignature(
	mutation: SignableQueuedMutation & Partial<WriteQueueSignatureFields>,
): Promise<boolean> {
	if (
		mutation.signatureVersion !== WRITE_QUEUE_SIGNATURE_VERSION ||
		typeof mutation.signature !== 'string' ||
		mutation.signature.length === 0
	) {
		return false;
	}

	const expected = await signQueuedMutation(mutation);
	return timingSafeEqualHex(expected.signature, mutation.signature);
}

export async function resetWriteQueueIntegrityKey(): Promise<void> {
	cachedKeyHex = undefined;
	await SecureStore.deleteItemAsync(WRITE_QUEUE_HMAC_KEY, secureStoreOptions);
}

export function clearWriteQueueIntegrityKeyCacheForTests(): void {
	cachedKeyHex = undefined;
}

function timingSafeEqualHex(left: string, right: string): boolean {
	if (left.length !== right.length) return false;

	let diff = 0;
	for (let index = 0; index < left.length; index += 1) {
		diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
	}
	return diff === 0;
}
