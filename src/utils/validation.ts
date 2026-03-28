import { ZodError, type ZodSchema } from 'zod';
import { ValidationError } from '../errors';

/**
 * Parse data with a Zod schema; throws ValidationError (not ZodError) on failure.
 * Collects all field-level errors into a map keyed by dot-notation path.
 */
export function validateWith<T>(schema: ZodSchema<T>, data: unknown): T {
	try {
		return schema.parse(data);
	} catch (e) {
		if (e instanceof ZodError) {
			const fieldErrors: Record<string, string[]> = {};
			for (const err of e.issues) {
				const path = err.path.join('.') || '_root';
				if (!fieldErrors[path]) fieldErrors[path] = [];
				fieldErrors[path].push(err.message);
			}
			throw new ValidationError('Validation failed', fieldErrors);
		}
		throw e;
	}
}
