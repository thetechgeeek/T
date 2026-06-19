/**
 * Tests for WriteQueueService — P0.8 Offline & Sync Infrastructure
 */

import { WriteQueueService, type QueuedMutation } from './writeQueueService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { allowExpectedConsoleError } from '@/__tests__/utils/runtimeNoise';
import {
	WRITE_QUEUE_HMAC_KEY,
	clearWriteQueueIntegrityKeyCacheForTests,
} from '../security/writeQueueIntegrity';
import { clearTelemetrySink, setTelemetrySink } from '../utils/logger';

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn((key: string) => Promise.resolve(mockStorage[key] ?? null)),
	setItem: jest.fn((key: string, value: string) => {
		mockStorage[key] = value;
		return Promise.resolve();
	}),
	removeItem: jest.fn((key: string) => {
		delete mockStorage[key];
		return Promise.resolve();
	}),
}));

describe('WriteQueueService', () => {
	let service: WriteQueueService;

	beforeEach(() => {
		// Clear storage between tests
		Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
		jest.clearAllMocks();
		clearWriteQueueIntegrityKeyCacheForTests();
		(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
		(SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
		(SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
		clearTelemetrySink();
		service = new WriteQueueService();
	});

	afterEach(() => {
		clearTelemetrySink();
	});

	it('enqueue adds a mutation to the queue', async () => {
		const mutation: QueuedMutation = {
			id: 'mut-1',
			type: 'insert',
			table: 'invoices',
			payload: { amount: 500 },
			idempotencyKey: 'inv-abc',
			retryCount: 0,
		};
		await service.enqueue(mutation);
		expect(await service.getPendingCount()).toBe(1);
	});

	it('signs queued mutations with a SecureStore-backed device key', async () => {
		await service.enqueue({
			id: 'signed',
			type: 'insert',
			table: 'invoices',
			payload: { amount: 500 },
			idempotencyKey: 'signed-key',
			retryCount: 0,
		});

		const storedQueue = JSON.parse(mockStorage['@writeQueue/mutations']) as QueuedMutation[];
		expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
			WRITE_QUEUE_HMAC_KEY,
			expect.stringMatching(/^[a-f0-9]{64}$/),
			expect.objectContaining({
				keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
			}),
		);
		expect(storedQueue[0]).toEqual(
			expect.objectContaining({
				signature: expect.stringMatching(/^[a-f0-9]{64}$/),
				signatureVersion: 1,
				signedAt: expect.any(String),
			}),
		);
	});

	it('getPendingCount returns 0 when queue is empty', async () => {
		expect(await service.getPendingCount()).toBe(0);
	});

	it('enqueue multiple mutations', async () => {
		await service.enqueue({
			id: 'mut-1',
			type: 'insert',
			table: 'invoices',
			payload: {},
			idempotencyKey: 'k1',
			retryCount: 0,
		});
		await service.enqueue({
			id: 'mut-2',
			type: 'update',
			table: 'customers',
			payload: {},
			idempotencyKey: 'k2',
			retryCount: 0,
		});
		expect(await service.getPendingCount()).toBe(2);
	});

	it('replay executes mutations with provided executor', async () => {
		await service.enqueue({
			id: 'mut-1',
			type: 'insert',
			table: 'invoices',
			payload: { id: '123' },
			idempotencyKey: 'k1',
			retryCount: 0,
		});

		const executor = jest.fn().mockResolvedValue(undefined);
		await service.replay(executor);

		expect(executor).toHaveBeenCalledTimes(1);
		expect(executor).toHaveBeenCalledWith(expect.objectContaining({ idempotencyKey: 'k1' }));
	});

	it('rejects a queued invoice mutation when the amount is changed before replay', async () => {
		const captureEvent = jest.fn();
		setTelemetrySink({ captureEvent });

		await service.enqueue({
			id: 'tampered-amount',
			type: 'insert',
			table: 'invoices',
			payload: { amount: 500 },
			idempotencyKey: 'amount-key',
			retryCount: 0,
		});
		const storedQueue = JSON.parse(mockStorage['@writeQueue/mutations']) as QueuedMutation[];
		storedQueue[0].payload = { amount: 50_000 };
		mockStorage['@writeQueue/mutations'] = JSON.stringify(storedQueue);

		const executor = jest.fn().mockResolvedValue(undefined);
		await service.replay(executor);

		expect(executor).not.toHaveBeenCalled();
		expect(await service.getPendingCount()).toBe(0);
		expect(await service.getDeadLetterCount()).toBe(1);
		await expect(service.getSupportSnapshot()).resolves.toEqual(
			expect.objectContaining({
				diagnostics: expect.objectContaining({
					lastReplayError: 'Offline queued mutation failed integrity verification',
					lastDeadLetterAt: expect.any(String),
				}),
				deadLetter: [
					expect.objectContaining({
						id: 'tampered-amount',
						lastError: 'Offline queued mutation failed integrity verification',
					}),
				],
			}),
		);
		expect(captureEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				message: 'offline_queue.integrity_rejected',
				meta: expect.objectContaining({ table: 'invoices', type: 'insert' }),
			}),
		);
	});

	it('rejects a queued stock mutation when the quantity is changed before replay', async () => {
		await service.enqueue({
			id: 'tampered-stock',
			type: 'update',
			table: 'stock_operations',
			payload: { quantity_change: 1.5 },
			idempotencyKey: 'stock-key',
			retryCount: 0,
		});
		const storedQueue = JSON.parse(mockStorage['@writeQueue/mutations']) as QueuedMutation[];
		storedQueue[0].payload = { quantity_change: 150 };
		mockStorage['@writeQueue/mutations'] = JSON.stringify(storedQueue);

		const executor = jest.fn().mockResolvedValue(undefined);
		await service.replay(executor);

		expect(executor).not.toHaveBeenCalled();
		expect(await service.getPendingCount()).toBe(0);
		expect(await service.getDeadLetterCount()).toBe(1);
	});

	it('does not treat the idempotency key as payload integrity', async () => {
		await service.enqueue({
			id: 'same-key-tamper',
			type: 'insert',
			table: 'invoices',
			payload: { amount: 100 },
			idempotencyKey: 'same-idempotency-key',
			retryCount: 0,
		});
		const storedQueue = JSON.parse(mockStorage['@writeQueue/mutations']) as QueuedMutation[];
		storedQueue[0].payload = { amount: 101 };
		mockStorage['@writeQueue/mutations'] = JSON.stringify(storedQueue);

		const executor = jest.fn().mockResolvedValue(undefined);
		await service.replay(executor);

		expect(executor).not.toHaveBeenCalled();
		expect(await service.getDeadLetterCount()).toBe(1);
	});

	it('does not let a tampered duplicate suppress a valid mutation with the same idempotency key', async () => {
		await service.enqueue({
			id: 'tampered-duplicate',
			type: 'insert',
			table: 'invoices',
			payload: { amount: 100 },
			idempotencyKey: 'shared-key',
			retryCount: 0,
			priority: 200,
		});
		await service.enqueue({
			id: 'valid-duplicate',
			type: 'insert',
			table: 'invoices',
			payload: { amount: 100 },
			idempotencyKey: 'shared-key',
			retryCount: 0,
			priority: 100,
		});
		const storedQueue = JSON.parse(mockStorage['@writeQueue/mutations']) as QueuedMutation[];
		storedQueue[0].payload = { amount: 999 };
		mockStorage['@writeQueue/mutations'] = JSON.stringify(storedQueue);

		const executor = jest.fn().mockResolvedValue(undefined);
		await service.replay(executor);

		expect(executor).toHaveBeenCalledTimes(1);
		expect(executor).toHaveBeenCalledWith(expect.objectContaining({ id: 'valid-duplicate' }));
		expect(await service.getDeadLetterCount()).toBe(1);
	});

	it('replay clears queue after successful execution', async () => {
		await service.enqueue({
			id: 'mut-1',
			type: 'insert',
			table: 'invoices',
			payload: {},
			idempotencyKey: 'k1',
			retryCount: 0,
		});

		await service.replay(jest.fn().mockResolvedValue(undefined));
		expect(await service.getPendingCount()).toBe(0);
	});

	it('replay skips duplicate idempotency keys', async () => {
		await service.enqueue({
			id: 'mut-1',
			type: 'insert',
			table: 'invoices',
			payload: {},
			idempotencyKey: 'same-key',
			retryCount: 0,
		});
		await service.enqueue({
			id: 'mut-2',
			type: 'insert',
			table: 'invoices',
			payload: {},
			idempotencyKey: 'same-key',
			retryCount: 0,
		});

		const executor = jest.fn().mockResolvedValue(undefined);
		await service.replay(executor);
		// Should only execute once despite 2 queued items with same key
		expect(executor).toHaveBeenCalledTimes(1);
	});

	it('getDeadLetterCount returns 0 initially', async () => {
		expect(await service.getDeadLetterCount()).toBe(0);
	});

	it('enforces MAX_QUEUE_SIZE', async () => {
		// Fill queue to 500
		for (let i = 0; i < 500; i++) {
			await service.enqueue({
				id: `mut-${i}`,
				type: 'insert',
				table: 't',
				payload: {},
				idempotencyKey: `k-${i}`,
				retryCount: 0,
			});
		}

		// 501st should throw
		await expect(
			service.enqueue({
				id: 'mut-overflow',
				type: 'insert',
				table: 't',
				payload: {},
				idempotencyKey: 'k-overflow',
				retryCount: 0,
			}),
		).rejects.toThrow(/queue is full/);
	});

	it('emits telemetry and diagnostics when the queue is full', async () => {
		const captureEvent = jest.fn();
		setTelemetrySink({ captureEvent });

		for (let i = 0; i < 500; i++) {
			await service.enqueue({
				id: `mut-${i}`,
				type: 'insert',
				table: 't',
				payload: {},
				idempotencyKey: `k-${i}`,
				retryCount: 0,
			});
		}

		await expect(
			service.enqueue({
				id: 'mut-overflow',
				type: 'insert',
				table: 't',
				payload: {},
				idempotencyKey: 'k-overflow',
				retryCount: 0,
			}),
		).rejects.toThrow(/queue is full/);

		expect(captureEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				level: 'telemetry',
				message: 'offline_queue.full',
				meta: expect.objectContaining({ pendingCount: 500 }),
			}),
		);
		await expect(service.getDiagnostics()).resolves.toEqual(
			expect.objectContaining({
				pendingCount: 500,
				deadLetterCount: 0,
				lastQueueFullAt: expect.any(String),
			}),
		);
	});

	it('replay executes in priority order (high to low)', async () => {
		// Lower priority added first
		await service.enqueue({
			id: 'low-prio',
			type: 'update',
			table: 'items',
			payload: {},
			idempotencyKey: 'k1',
			retryCount: 0,
			priority: 100,
		});

		// Higher priority added second
		await service.enqueue({
			id: 'high-prio',
			type: 'insert',
			table: 'invoices',
			payload: {},
			idempotencyKey: 'k2',
			retryCount: 0,
			priority: 200,
		});

		const executionOrder: string[] = [];
		const executor = jest.fn((m: QueuedMutation) => {
			executionOrder.push(m.id);
			return Promise.resolve();
		});

		await service.replay(executor);

		// Should have executed high-prio (200) before low-prio (100)
		expect(executionOrder).toEqual(['high-prio', 'low-prio']);
	});

	it('maintains FIFO within the same priority level', async () => {
		const now = new Date();
		const earlier = new Date(now.getTime() - 1000).toISOString();
		const later = now.toISOString();

		// Add two with same priority 100
		await service.enqueue({
			id: 'second-added',
			type: 'update',
			table: 'items',
			payload: {},
			idempotencyKey: 'k2',
			retryCount: 0,
			priority: 100,
			pendingAt: later,
		});

		await service.enqueue({
			id: 'first-added',
			type: 'update',
			table: 'items',
			payload: {},
			idempotencyKey: 'k1',
			retryCount: 0,
			priority: 100,
			pendingAt: earlier,
		});

		const executionOrder: string[] = [];
		const executor = jest.fn((m: QueuedMutation) => {
			executionOrder.push(m.id);
			return Promise.resolve();
		});

		await service.replay(executor);

		// Within same priority 100, earlier pendingAt should execute first
		expect(executionOrder).toEqual(['first-added', 'second-added']);
	});

	it('moves exhausted retries to dead letter and exposes a support snapshot', async () => {
		const captureEvent = jest.fn();
		setTelemetrySink({ captureEvent });
		await service.enqueue({
			id: 'will-dead-letter',
			type: 'update',
			table: 'invoices',
			payload: { customer_phone: '9876543210' },
			idempotencyKey: 'dead-letter-key',
			retryCount: 2,
			lastAttemptAt: new Date(Date.now() - 30_000).toISOString(),
		});

		await service.replay(jest.fn().mockRejectedValue(new Error('network down')));

		expect(await service.getPendingCount()).toBe(0);
		expect(await service.getDeadLetterCount()).toBe(1);
		await expect(service.getSupportSnapshot()).resolves.toEqual(
			expect.objectContaining({
				diagnostics: expect.objectContaining({
					pendingCount: 0,
					deadLetterCount: 1,
					lastReplayError: 'network down',
					lastDeadLetterAt: expect.any(String),
				}),
				deadLetter: [
					expect.objectContaining({
						id: 'will-dead-letter',
						table: 'invoices',
						retryCount: 3,
						lastError: 'network down',
					}),
				],
			}),
		);
		expect(captureEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				message: 'offline_queue.dead_letter',
				meta: expect.objectContaining({ table: 'invoices', retryCount: 3 }),
			}),
		);
	});

	it('does not retry dead-letter mutations rejected for integrity failures', async () => {
		await service.enqueue({
			id: 'blocked-retry',
			type: 'insert',
			table: 'invoices',
			payload: { amount: 500 },
			idempotencyKey: 'blocked-retry',
			retryCount: 0,
		});
		const storedQueue = JSON.parse(mockStorage['@writeQueue/mutations']) as QueuedMutation[];
		storedQueue[0].payload = { amount: 600 };
		mockStorage['@writeQueue/mutations'] = JSON.stringify(storedQueue);

		await service.replay(jest.fn().mockResolvedValue(undefined));
		await service.retryAllFailed();

		expect(await service.getPendingCount()).toBe(0);
		expect(await service.getDeadLetterCount()).toBe(1);
	});

	it('removes the offline queue signing key when the queue is cleared', async () => {
		await service.enqueue({
			id: 'clear-key',
			type: 'insert',
			table: 'invoices',
			payload: { amount: 500 },
			idempotencyKey: 'clear-key',
			retryCount: 0,
		});

		await service.clearQueue();

		expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@writeQueue/mutations');
		expect(WRITE_QUEUE_HMAC_KEY).toMatch(/^[A-Za-z0-9._-]+$/);
		expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
			WRITE_QUEUE_HMAC_KEY,
			expect.objectContaining({
				keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
			}),
		);
	});

	it('cleans up dead-letter entries older than the seven-day TTL', async () => {
		mockStorage['@writeQueue/deadLetter'] = JSON.stringify([
			{
				id: 'old',
				type: 'insert',
				table: 'customers',
				payload: {},
				idempotencyKey: 'old',
				retryCount: 3,
				lastAttemptAt: '2026-04-01T00:00:00.000Z',
			},
			{
				id: 'fresh',
				type: 'insert',
				table: 'customers',
				payload: {},
				idempotencyKey: 'fresh',
				retryCount: 3,
				lastAttemptAt: '2026-05-04T00:00:00.000Z',
			},
		]);

		await expect(
			service.clearExpiredDeadLetters(new Date('2026-05-05T00:00:00.000Z')),
		).resolves.toBe(1);

		expect(await service.readDeadLetter()).toEqual([expect.objectContaining({ id: 'fresh' })]);
	});

	it('wraps AsyncStorage quota failures with a recoverable app error', async () => {
		allowExpectedConsoleError('[ERROR] Offline queue storage write failed');
		(AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Quota exceeded'));

		await expect(
			service.enqueue({
				id: 'quota',
				type: 'insert',
				table: 'customers',
				payload: {},
				idempotencyKey: 'quota',
				retryCount: 0,
			}),
		).rejects.toMatchObject({
			code: 'WRITE_QUEUE_STORAGE_ERROR',
			userMessage:
				'Your device could not save offline changes. Free up storage and try again.',
		});

		await expect(service.getDiagnostics()).resolves.toEqual(
			expect.objectContaining({
				lastStorageError: 'Quota exceeded',
				lastStorageErrorAt: expect.any(String),
			}),
		);
	});
});
