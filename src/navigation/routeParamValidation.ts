import { z } from 'zod';
import logger from '@/src/utils/logger';
import type { UUID } from '@/src/types/common';
import type { StockOpType } from '@/src/types/inventory';

const uuidSchema = z.string().uuid();
const stockOpTypeSchema = z.enum(['stock_in', 'stock_out', 'adjustment', 'transfer', 'return']);
const MAX_ROUTE_PARAM_LENGTH = 128;

type RouteParam = string | string[] | undefined;

function firstRouteParam(value: RouteParam) {
	if (Array.isArray(value)) return value[0];
	return value;
}

export function parseUuidRouteParam(value: RouteParam, name = 'id'): UUID | null {
	const raw = firstRouteParam(value);
	if (!raw || raw.length > MAX_ROUTE_PARAM_LENGTH) {
		logger.warn('invalid_route_param', { name, reason: raw ? 'too_long' : 'missing' });
		return null;
	}
	const parsed = uuidSchema.safeParse(raw);
	if (!parsed.success) {
		logger.warn('invalid_route_param', { name, reason: 'invalid_uuid' });
		return null;
	}
	return parsed.data as UUID;
}

export function parseStockOpTypeRouteParam(value: RouteParam): StockOpType | null {
	const raw = firstRouteParam(value);
	const parsed = stockOpTypeSchema.safeParse(raw);
	if (!parsed.success) {
		logger.warn('invalid_route_param', { name: 'type', reason: 'invalid_stock_op_type' });
		return null;
	}
	return parsed.data;
}
