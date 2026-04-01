import { z, ZodError } from 'zod';
import { validateWith } from './validation';
import { ValidationError } from '../errors';

describe('validateWith', () => {
	const NameSchema = z.object({
		name: z.string().min(1, 'Name is required'),
		age: z.number().int().positive('Age must be positive'),
	});

	it('returns parsed data when input is valid', () => {
		const result = validateWith(NameSchema, { name: 'Alice', age: 30 });
		expect(result).toEqual({ name: 'Alice', age: 30 });
	});

	it('throws ValidationError (not ZodError) when validation fails', () => {
		expect(() => validateWith(NameSchema, { name: '', age: 30 })).toThrow(ValidationError);
	});

	it('does not throw ZodError directly — always wraps in ValidationError', () => {
		expect(() => validateWith(NameSchema, { name: '', age: -1 })).not.toThrow(ZodError);
	});

	it('fieldErrors map contains the failing field path', () => {
		try {
			validateWith(NameSchema, { name: '', age: 30 });
		} catch (e) {
			expect(e).toBeInstanceOf(ValidationError);
			const ve = e as ValidationError;
			expect(ve.fieldErrors).toHaveProperty('name');
			expect(ve.fieldErrors['name']).toContain('Name is required');
		}
	});

	it('collects multiple field errors at once', () => {
		try {
			validateWith(NameSchema, { name: '', age: -1 });
		} catch (e) {
			const ve = e as ValidationError;
			expect(Object.keys(ve.fieldErrors).length).toBeGreaterThanOrEqual(2);
			expect(ve.fieldErrors).toHaveProperty('name');
			expect(ve.fieldErrors).toHaveProperty('age');
		}
	});

	it('uses _root key for root-level errors (no path)', () => {
		const FlatSchema = z.string().min(1, 'Value required');
		try {
			validateWith(FlatSchema, '');
		} catch (e) {
			const ve = e as ValidationError;
			expect(ve.fieldErrors).toHaveProperty('_root');
		}
	});

	it('re-throws non-ZodError exceptions unchanged', () => {
		const ThrowingSchema = z.string().transform(() => {
			throw new RangeError('custom error');
		});
		expect(() => validateWith(ThrowingSchema, 'hello')).toThrow(RangeError);
	});

	it('nested field errors use dot-notation path', () => {
		const AddressSchema = z.object({
			address: z.object({
				city: z.string().min(1, 'City required'),
			}),
		});
		try {
			validateWith(AddressSchema, { address: { city: '' } });
		} catch (e) {
			const ve = e as ValidationError;
			// fieldErrors has literal key 'address.city' (joined by '.')
			expect(Object.keys(ve.fieldErrors)).toContain('address.city');
			expect(ve.fieldErrors['address.city']).toContain('City required');
		}
	});

	it('message on ValidationError is "Validation failed"', () => {
		try {
			validateWith(NameSchema, { name: '', age: 30 });
		} catch (e) {
			expect((e as Error).message).toBe('Validation failed');
		}
	});
});
