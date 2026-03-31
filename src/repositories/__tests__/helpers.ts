/**
 * Shared query-builder factory for repository tests.
 *
 * Produces a mock that supports both:
 *  - The thenable pattern: `await query` (used by findMany / service-layer direct queries)
 *  - The terminal pattern: `await query.single()` (used by findById / create / update)
 */
export function makeBuilder(
	thenResult: { data: any; count?: number | null; error: any | null } = { data: [], count: 0, error: null },
	singleResult: { data: any; error: any | null } = { data: null, error: null },
) {
	const builder: any = {};
	const chainable = [
		'select', 'insert', 'update', 'delete', 'upsert',
		'eq', 'neq', 'gte', 'lte', 'ilike', 'or', 'in', 'is',
		'order', 'range', 'limit', 'not',
	];
	chainable.forEach((m) => {
		builder[m] = jest.fn().mockReturnValue(builder);
	});
	builder.single = jest.fn().mockResolvedValue(singleResult);
	builder.maybeSingle = jest.fn().mockResolvedValue(singleResult);
	// Thenable for `await query` (findMany / direct query awaiting)
	builder.then = jest.fn((resolve: any, _reject: any) => Promise.resolve(thenResult).then(resolve));
	return builder;
}
