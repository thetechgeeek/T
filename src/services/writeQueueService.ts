import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppError } from '../errors/AppError';
import logger from '../utils/logger';

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

export interface WriteQueueDiagnostics {
	pendingCount: number;
	deadLetterCount: number;
	lastReplayStartedAt?: string;
	lastReplayCompletedAt?: string;
	lastReplayError?: string;
	lastReplayErrorAt?: string;
	lastStorageError?: string;
	lastStorageErrorAt?: string;
	lastDeadLetterAt?: string;
	lastQueueFullAt?: string;
}

export interface WriteQueueSupportSnapshot {
	diagnostics: WriteQueueDiagnostics;
	deadLetter: Array<
		Pick<
			QueuedMutation,
			| 'id'
			| 'type'
			| 'table'
			| 'idempotencyKey'
			| 'retryCount'
			| 'lastError'
			| 'lastAttemptAt'
		>
	>;
}

const QUEUE_KEY = '@writeQueue/mutations';
const DEAD_LETTER_KEY = '@writeQueue/deadLetter';
const DIAGNOSTICS_KEY = '@writeQueue/diagnostics';
const MAX_RETRIES = 3;
const MAX_QUEUE_SIZE = 500;
const DEFAULT_PRIORITY = 100;
const RETRY_BACKOFF_SECONDS = [1, 3, 9];
const DEAD_LETTER_TTL_DAYS = 7;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const DEAD_LETTER_TTL_MS =
	DEAD_LETTER_TTL_DAYS *
	HOURS_PER_DAY *
	MINUTES_PER_HOUR *
	SECONDS_PER_MINUTE *
	MILLISECONDS_PER_SECOND;

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
		} catch (error: unknown) {
			void error;
			return [];
		}
	}

	private async writeQueue(queue: QueuedMutation[]): Promise<void> {
		await this.writeJson(QUEUE_KEY, queue, 'pending_queue');
	}

	/**
	 * Returns full list of mutations in the dead-letter queue.
	 */
	async readDeadLetter(): Promise<QueuedMutation[]> {
		const raw = await AsyncStorage.getItem(DEAD_LETTER_KEY);
		if (!raw) return [];
		try {
			return JSON.parse(raw) as QueuedMutation[];
		} catch (error: unknown) {
			void error;
			return [];
		}
	}

	private async writeDeadLetter(queue: QueuedMutation[]): Promise<void> {
		await this.writeJson(DEAD_LETTER_KEY, queue, 'dead_letter_queue');
	}

	private async readStoredDiagnostics(): Promise<Partial<WriteQueueDiagnostics>> {
		const raw = await AsyncStorage.getItem(DIAGNOSTICS_KEY);
		if (!raw) return {};
		try {
			return JSON.parse(raw) as Partial<WriteQueueDiagnostics>;
		} catch {
			return {};
		}
	}

	private async writeDiagnostics(partial: Partial<WriteQueueDiagnostics>): Promise<void> {
		try {
			const current = await this.readStoredDiagnostics();
			await AsyncStorage.setItem(
				DIAGNOSTICS_KEY,
				JSON.stringify({
					...current,
					...partial,
				}),
			);
		} catch {
			// Diagnostics are best-effort; they must not make queue recovery worse.
		}
	}

	private async writeJson(key: string, value: unknown, context: string): Promise<void> {
		try {
			await AsyncStorage.setItem(key, JSON.stringify(value));
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			await this.writeDiagnostics({
				lastStorageError: message,
				lastStorageErrorAt: new Date().toISOString(),
			});
			logger.error('Offline queue storage write failed', error, {
				event: 'offline_queue.storage_error',
				context,
			});
			throw new AppError(
				'Offline queue storage write failed',
				'WRITE_QUEUE_STORAGE_ERROR',
				'Your device could not save offline changes. Free up storage and try again.',
				error,
			);
		}
	}

	/**
	 * Add a mutation to the queue. If online, caller should execute immediately
	 * and only call this if the network call fails.
	 * Enforces MAX_QUEUE_SIZE.
	 */
	async enqueue(mutation: QueuedMutation): Promise<void> {
		const queue = await this.readQueue();

		if (queue.length >= MAX_QUEUE_SIZE) {
			await this.writeDiagnostics({
				lastQueueFullAt: new Date().toISOString(),
			});
			logger.telemetry('offline_queue.full', {
				pendingCount: queue.length,
				table: mutation.table,
				type: mutation.type,
			});
			throw new AppError(
				'Offline sync queue is full. Please reconnect to sync existing changes.',
				'WRITE_QUEUE_FULL',
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

	async getDiagnostics(): Promise<WriteQueueDiagnostics> {
		const [stored, pendingCount, deadLetterCount] = await Promise.all([
			this.readStoredDiagnostics(),
			this.getPendingCount(),
			this.getDeadLetterCount(),
		]);
		return {
			...stored,
			pendingCount,
			deadLetterCount,
		};
	}

	async getSupportSnapshot(): Promise<WriteQueueSupportSnapshot> {
		const [diagnostics, deadLetter] = await Promise.all([
			this.getDiagnostics(),
			this.readDeadLetter(),
		]);

		return {
			diagnostics,
			deadLetter: deadLetter.map((mutation) => ({
				id: mutation.id,
				type: mutation.type,
				table: mutation.table,
				idempotencyKey: mutation.idempotencyKey,
				retryCount: mutation.retryCount,
				lastError: mutation.lastError,
				lastAttemptAt: mutation.lastAttemptAt,
			})),
		};
	}

	/**
	 * Replay all queued mutations in Priority order (High to Low), then FIFO.
	 * `executor` is called for each mutation. On success the mutation is removed.
	 * Deduplicates by idempotencyKey — only the first occurrence is executed.
	 * Mutations that fail after MAX_RETRIES are moved to the dead-letter queue.
	 * Implements exponential backoff: only retries if enough time has passed since lastAttemptAt.
	 */
	async replay(executor: (mutation: QueuedMutation) => Promise<void>): Promise<void> {
		await this.clearExpiredDeadLetters();
		const queue = await this.readQueue();
		if (queue.length === 0) return;
		await this.writeDiagnostics({
			lastReplayStartedAt: new Date().toISOString(),
		});
		logger.telemetry('offline_queue.replay_started', {
			pendingCount: queue.length,
		});

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
				await this.writeDiagnostics({
					lastReplayError: errorMessage,
					lastReplayErrorAt: retried.lastAttemptAt,
				});
				logger.telemetry('offline_queue.replay_failure', {
					table: mutation.table,
					type: mutation.type,
					retryCount: retried.retryCount,
				});

				if (retried.retryCount >= MAX_RETRIES) {
					dead.push(retried);
					await this.writeDiagnostics({
						lastDeadLetterAt: retried.lastAttemptAt,
					});
					logger.telemetry('offline_queue.dead_letter', {
						table: mutation.table,
						type: mutation.type,
						retryCount: retried.retryCount,
					});
				} else {
					remaining.push({ ...retried, status: 'pending' });
				}
			}
		}

		await this.writeQueue(remaining);
		await this.writeDeadLetter(dead);
		await this.writeDiagnostics({
			lastReplayCompletedAt: new Date().toISOString(),
		});
		logger.telemetry('offline_queue.replay_completed', {
			pendingCount: remaining.length,
			deadLetterCount: dead.length,
		});
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

	async clearExpiredDeadLetters(now = new Date()): Promise<number> {
		const dead = await this.readDeadLetter();
		if (dead.length === 0) return 0;

		const cutoff = now.getTime() - DEAD_LETTER_TTL_MS;
		const retained = dead.filter((mutation) => {
			const timestamp = mutation.lastAttemptAt ?? mutation.pendingAt;
			if (!timestamp) return true;
			return new Date(timestamp).getTime() >= cutoff;
		});
		const removed = dead.length - retained.length;

		if (removed > 0) {
			await this.writeDeadLetter(retained);
			logger.telemetry('offline_queue.dead_letter_ttl_cleanup', {
				removed,
				retained: retained.length,
			});
		}

		return removed;
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
		logger.telemetry('offline_queue.dead_letter_retry_all', {
			retried: retried.length,
		});
	}
}

/** Singleton instance for use across the app */
export const writeQueue = new WriteQueueService();
