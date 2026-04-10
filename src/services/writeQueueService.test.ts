/**
 * Tests for WriteQueueService — P0.8 Offline & Sync Infrastructure
 */

import { WriteQueueService, type QueuedMutation } from './writeQueueService';

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
		service = new WriteQueueService();
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
});
