import { supabase as defaultClient } from '../config/supabase';
import { toAppError } from '../errors';
import logger from '../utils/logger';
import { recordQueryTiming } from '../utils/queryMetrics';
import { normalizePage, normalizePageSize } from '../utils/queryGuards';
import type { UUID } from '../types/common';
import type { PublicTableName } from '../types/database';

export interface QueryOptions {
	filters?: Record<string, unknown>;
	sort?: { column: string; ascending: boolean };
	pagination?: { page: number; pageSize: number };
	/** Keyset cursor: ISO timestamp of the last item seen. Mutually exclusive with pagination. */
	cursor?: string;
	/** Page size when using cursor-based pagination. */
	cursorPageSize?: number;
	search?: { columns: string[]; term: string };
	/** Optional screen or workflow label for production query-timing aggregation. */
	context?: string;
}

export interface PaginatedResult<T> {
	data: T[];
	total: number;
	/** ISO timestamp of the last item in this page — use as cursor for the next page. */
	nextCursor?: string;
}

/** Escape ILIKE special chars to prevent wildcard injection (§10.1) */
function escapeLike(term: string): string {
	return term.replace(/[%_\\]/g, (c) => `\\${c}`);
}

/** Minimal structural type covering all PostgREST query builder methods we call. */
interface QueryBuilder {
	or(conditions: string): this;
	eq(column: string, value: unknown): this;
	gte(column: string, value: unknown): this;
	lte(column: string, value: unknown): this;
	lt(column: string, value: unknown): this;
	order(column: string, options: { ascending: boolean }): this;
	range(from: number, to: number): this;
	limit(count: number): this;
}

function applyFilters<Q extends QueryBuilder>(query: Q, options: QueryOptions): Q {
	const { filters, sort, pagination, search } = options;

	if (search?.term && search.columns.length > 0) {
		const escaped = escapeLike(search.term);
		const searchConditions = search.columns.map((col) => `${col}.ilike.%${escaped}%`).join(',');
		query = query.or(searchConditions);
	}

	if (filters) {
		for (const [key, value] of Object.entries(filters)) {
			if (value === undefined || value === null) continue;
			if (typeof value === 'object' && !Array.isArray(value)) {
				const rangeFilter = value as { gte?: unknown; lte?: unknown };
				if (rangeFilter.gte !== undefined) query = query.gte(key, rangeFilter.gte);
				if (rangeFilter.lte !== undefined) query = query.lte(key, rangeFilter.lte);
			} else {
				query = query.eq(key, value);
			}
		}
	}

	if (sort) {
		query = query.order(sort.column, { ascending: sort.ascending });
	}

	if (pagination) {
		const page = normalizePage(pagination.page);
		const pageSize = normalizePageSize(pagination.pageSize);
		const from = (page - 1) * pageSize;
		query = query.range(from, from + pageSize - 1);
	} else if (options.cursor) {
		// Keyset pagination: more efficient than OFFSET for deep pages
		query = query
			.lt('created_at', options.cursor)
			.limit(normalizePageSize(options.cursorPageSize ?? 20));
	} else if (options.cursorPageSize && !options.cursor) {
		// First page of keyset pagination (no cursor yet)
		query = query.limit(normalizePageSize(options.cursorPageSize));
	}

	return query;
}

type SupabaseClient = typeof defaultClient;

function assertSupabaseClient(client: unknown): asserts client is SupabaseClient {
	if (!client || typeof (client as { from?: unknown }).from !== 'function') {
		throw new Error(
			'[Supabase] Client is not initialized. Check Supabase environment configuration.',
		);
	}
}

/** Access the Supabase client lazily to catch the latest mocked version during tests. */
function getClient() {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const mod = require('../config/supabase') as typeof import('../config/supabase');
	const client = mod.supabase ?? defaultClient;
	assertSupabaseClient(client);
	return client;
}

function logQueryTiming(
	tableName: PublicTableName,
	op: string,
	start: number,
	context?: string,
	extra?: Record<string, unknown>,
) {
	const durationMs = Math.round(performance.now() - start);
	const snapshot = recordQueryTiming({
		table: tableName,
		op,
		context,
		durationMs,
		release: process.env.EXPO_PUBLIC_APP_VERSION,
	});
	logger.info('db_query', {
		table: tableName,
		op,
		context,
		duration_ms: durationMs,
		p50_ms: snapshot.p50Ms,
		p95_ms: snapshot.p95Ms,
		slow_count: snapshot.slowCount,
		slow_threshold_ms: snapshot.slowThresholdMs,
		release: snapshot.release,
		...extra,
	});
}

export function createRepository<T extends { id: UUID; created_at?: string }>(
	tableName: PublicTableName,
) {
	return {
		async findMany(options: QueryOptions = {}): Promise<PaginatedResult<T>> {
			const start = performance.now();
			const useCursor = !!(options.cursor !== undefined || options.cursorPageSize);
			const supabase = getClient();
			let query = supabase
				.from(tableName)
				.select('*', { count: useCursor ? undefined : 'exact' });
			query = applyFilters(query, options);
			const { data, count, error } = await query;
			logQueryTiming(tableName, 'findMany', start, options.context);
			if (error) throw toAppError(error);
			const rows = (data ?? []) as T[];
			const pageSize = options.cursorPageSize ?? 20;
			const lastRow = rows[rows.length - 1];
			const nextCursor =
				useCursor && rows.length === pageSize && lastRow?.created_at
					? lastRow.created_at
					: undefined;
			return { data: rows, total: count ?? rows.length, nextCursor };
		},

		async findById(id: UUID): Promise<T> {
			const start = performance.now();
			const supabase = getClient();
			const { data, error } = await supabase
				.from(tableName)
				.select('*')
				.eq('id', id)
				.single();
			logQueryTiming(tableName, 'findById', start);
			if (error) throw toAppError(error);
			return data as T;
		},

		async create(payload: Partial<T>): Promise<T> {
			const start = performance.now();
			const supabase = getClient();
			const { data, error } = await supabase
				.from(tableName)
				.insert(payload)
				.select()
				.single();
			logQueryTiming(tableName, 'create', start);
			if (error) throw toAppError(error);
			return data as T;
		},

		async update(id: UUID, payload: Partial<T>): Promise<T> {
			const start = performance.now();
			const supabase = getClient();
			const { data, error } = await supabase
				.from(tableName)
				.update(payload)
				.eq('id', id)
				.select()
				.single();
			logQueryTiming(tableName, 'update', start);
			if (error) throw toAppError(error);
			return data as T;
		},

		async remove(id: UUID): Promise<void> {
			const start = performance.now();
			const supabase = getClient();
			const { error } = await supabase.from(tableName).delete().eq('id', id);
			logQueryTiming(tableName, 'remove', start);
			if (error) throw toAppError(error);
		},

		async rpc<R>(fnName: string, params: Record<string, unknown>): Promise<R> {
			const start = performance.now();
			const supabase = getClient();
			const { data, error } = await supabase.rpc(fnName, params);
			logQueryTiming(tableName, 'rpc', start, undefined, { fn: fnName });
			if (error) throw toAppError(error);
			return data as R;
		},
	};
}
