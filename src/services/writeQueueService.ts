import AsyncStorage from '@react-native-async-storage/async-storage';

export type MutationType = 'insert' | 'update' | 'delete';

export type MutationStatus = 'pending' | 'syncing' | 'failed';

export interface QueuedMutation {
	id: string;
	type: MutationType;
	table: string;
	payload: Record<string, unknown>;
	idempotencyKey: string;
	retryCount: number;
	pendingAt?: string;
	priority?: number; // Higher number = higher priority. Defaults to 100.
	status?: MutationStatus;
	lastError?: string;
	lastAttemptAt?: string;
}

const QUEUE_KEY = '@writeQueue/mutations';
const DEAD_LETTER_KEY = '@writeQueue/deadLetter';
const MAX_RETRIES = 3;
const MAX_QUEUE_SIZE = 500;
const DEFAULT_PRIORITY = 100;
const RETRY_BACKOFF_SECONDS = [1, 3, 9];

/**
 * P0.8 — WriteQueueService
 * Singleton-style class for offline write queue.
 * Mutations are persisted in AsyncStorage and replayed on reconnect.
 */
export class WriteQueueService {
	/**
	 * Returns full list of pending mutations.
	 */
	async readQueue(): Promise<QueuedMutation[]> {
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

	/**
	 * Returns full list of mutations in the dead-letter queue.
	 */
	async readDeadLetter(): Promise<QueuedMutation[]> {
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
	 * Enforces MAX_QUEUE_SIZE.
	 */
	async enqueue(mutation: QueuedMutation): Promise<void> {
		const queue = await this.readQueue();

		if (queue.length >= MAX_QUEUE_SIZE) {
			throw new Error(
				'Offline sync queue is full. Please reconnect to sync existing changes.',
			);
		}

		queue.push({
			...mutation,
			pendingAt: mutation.pendingAt ?? new Date().toISOString(),
			priority: mutation.priority ?? DEFAULT_PRIORITY,
			status: 'pending',
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
	 * Replay all queued mutations in Priority order (High to Low), then FIFO.
	 * `executor` is called for each mutation. On success the mutation is removed.
	 * Deduplicates by idempotencyKey — only the first occurrence is executed.
	 * Mutations that fail after MAX_RETRIES are moved to the dead-letter queue.
	 * Implements exponential backoff: only retries if enough time has passed since lastAttemptAt.
	 */
	async replay(executor: (mutation: QueuedMutation) => Promise<void>): Promise<void> {
		const queue = await this.readQueue();
		if (queue.length === 0) return;

		// Sort by priority (descending), then by pendingAt (ascending)
		queue.sort((a, b) => {
			const priorityDiff =
				(b.priority ?? DEFAULT_PRIORITY) - (a.priority ?? DEFAULT_PRIORITY);
			if (priorityDiff !== 0) return priorityDiff;
			return (a.pendingAt || '').localeCompare(b.pendingAt || '');
		});

		const seen = new Set<string>();
		const remaining: QueuedMutation[] = [];
		const dead: QueuedMutation[] = [...(await this.readDeadLetter())];
		const now = Date.now();

		for (const mutation of queue) {
			if (seen.has(mutation.idempotencyKey)) {
				// Duplicate — skip silently
				continue;
			}
			seen.add(mutation.idempotencyKey);

			// Check backoff if it has failed before
			if (mutation.retryCount > 0 && mutation.lastAttemptAt) {
				const backoffIdx = Math.min(
					mutation.retryCount - 1,
					RETRY_BACKOFF_SECONDS.length - 1,
				);
				const waitMs = RETRY_BACKOFF_SECONDS[backoffIdx] * 1000;
				const lastTime = new Date(mutation.lastAttemptAt).getTime();

				if (now - lastTime < waitMs) {
					// Too early to retry — keep in queue for next replay
					remaining.push(mutation);
					continue;
				}
			}

			try {
				// Update mutation in store to syncing
				await this.updateMutationStatus(mutation.id, 'syncing');

				await executor(mutation);
				// Success — don't add back to remaining
			} catch (err: unknown) {
				const errorMessage = err instanceof Error ? err.message : String(err);
				const retried: QueuedMutation = {
					...mutation,
					retryCount: mutation.retryCount + 1,
					status: 'failed',
					lastError: errorMessage,
					lastAttemptAt: new Date().toISOString(),
				};

				if (retried.retryCount >= MAX_RETRIES) {
					dead.push(retried);
				} else {
					remaining.push({ ...retried, status: 'pending' });
				}
			}
		}

		await this.writeQueue(remaining);
		await this.writeDeadLetter(dead);
	}

	private async updateMutationStatus(id: string, status: MutationStatus): Promise<void> {
		const queue = await this.readQueue();
		const idx = queue.findIndex((m) => m.id === id);
		if (idx !== -1) {
			queue[idx].status = status;
			await this.writeQueue(queue);
		}
	}

	/**
	 * Clear all pending mutations (e.g. on sign-out).
	 */
	async clearQueue(): Promise<void> {
		await AsyncStorage.removeItem(QUEUE_KEY);
	}

	/**
	 * Clear all failed mutations from the dead-letter queue.
	 */
	async clearDeadLetter(): Promise<void> {
		await AsyncStorage.removeItem(DEAD_LETTER_KEY);
	}

	/**
	 * Move all items from dead-letter back to the main queue for retry.
	 */
	async retryAllFailed(): Promise<void> {
		const dead = await this.readDeadLetter();
		if (dead.length === 0) return;

		const queue = await this.readQueue();
		const retried = dead.map((m) => ({
			...m,
			retryCount: 0,
			status: 'pending' as MutationStatus,
		}));

		await this.writeQueue([...queue, ...retried]);
		await this.clearDeadLetter();
	}
}

/** Singleton instance for use across the app */
export const writeQueue = new WriteQueueService();
