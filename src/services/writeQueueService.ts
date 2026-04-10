import AsyncStorage from '@react-native-async-storage/async-storage';

export type MutationType = 'insert' | 'update' | 'delete';

export interface QueuedMutation {
	id: string;
	type: MutationType;
	table: string;
	payload: Record<string, unknown>;
	idempotencyKey: string;
	retryCount: number;
	pendingAt?: string;
}

const QUEUE_KEY = '@writeQueue/mutations';
const DEAD_LETTER_KEY = '@writeQueue/deadLetter';
const MAX_RETRIES = 3;

/**
 * P0.8 — WriteQueueService
 * Singleton-style class for offline write queue.
 * Mutations are persisted in AsyncStorage and replayed on reconnect.
 */
export class WriteQueueService {
	private async readQueue(): Promise<QueuedMutation[]> {
		const raw = await AsyncStorage.getItem(QUEUE_KEY);
		if (!raw) return [];
		try {
			return JSON.parse(raw) as QueuedMutation[];
		} catch {
			return [];
		}
	}

	private async writeQueue(queue: QueuedMutation[]): Promise<void> {
		await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
	}

	private async readDeadLetter(): Promise<QueuedMutation[]> {
		const raw = await AsyncStorage.getItem(DEAD_LETTER_KEY);
		if (!raw) return [];
		try {
			return JSON.parse(raw) as QueuedMutation[];
		} catch {
			return [];
		}
	}

	private async writeDeadLetter(queue: QueuedMutation[]): Promise<void> {
		await AsyncStorage.setItem(DEAD_LETTER_KEY, JSON.stringify(queue));
	}

	/**
	 * Add a mutation to the queue. If online, caller should execute immediately
	 * and only call this if the network call fails.
	 */
	async enqueue(mutation: QueuedMutation): Promise<void> {
		const queue = await this.readQueue();
		queue.push({
			...mutation,
			pendingAt: mutation.pendingAt ?? new Date().toISOString(),
		});
		await this.writeQueue(queue);
	}

	/**
	 * Returns number of pending mutations.
	 */
	async getPendingCount(): Promise<number> {
		const queue = await this.readQueue();
		return queue.length;
	}

	/**
	 * Returns number of mutations in the dead-letter queue.
	 */
	async getDeadLetterCount(): Promise<number> {
		const dead = await this.readDeadLetter();
		return dead.length;
	}

	/**
	 * Replay all queued mutations in FIFO order.
	 * `executor` is called for each mutation. On success the mutation is removed.
	 * Deduplicates by idempotencyKey — only the first occurrence is executed.
	 * Mutations that fail after MAX_RETRIES are moved to the dead-letter queue.
	 */
	async replay(executor: (mutation: QueuedMutation) => Promise<void>): Promise<void> {
		const queue = await this.readQueue();
		if (queue.length === 0) return;

		const seen = new Set<string>();
		const remaining: QueuedMutation[] = [];
		const dead: QueuedMutation[] = [...(await this.readDeadLetter())];

		for (const mutation of queue) {
			if (seen.has(mutation.idempotencyKey)) {
				// Duplicate — skip silently
				continue;
			}
			seen.add(mutation.idempotencyKey);

			try {
				await executor(mutation);
				// Success — don't add back to remaining
			} catch {
				const retried = { ...mutation, retryCount: mutation.retryCount + 1 };
				if (retried.retryCount >= MAX_RETRIES) {
					dead.push(retried);
				} else {
					remaining.push(retried);
				}
			}
		}

		await this.writeQueue(remaining);
		await this.writeDeadLetter(dead);
	}

	/**
	 * Clear all pending mutations (e.g. on sign-out).
	 */
	async clearQueue(): Promise<void> {
		await AsyncStorage.removeItem(QUEUE_KEY);
	}
}

/** Singleton instance for use across the app */
export const writeQueue = new WriteQueueService();
