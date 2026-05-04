import { supplierRepository } from '../repositories/supplierRepository';
import { toAppError } from '../errors/AppError';
import type { UUID } from '../types/common';
import type { Supplier, SupplierInsert } from '../types/supplier';

const SUPPLIER_SEARCH_COLUMNS = ['name', 'contact_person', 'phone', 'city'];

export interface SupplierLookupOptions {
	search?: string;
	page?: number;
	pageSize?: number;
}

export const supplierService = {
	async findSuppliers(options: SupplierLookupOptions = {}): Promise<Supplier[]> {
		try {
			const searchTerm = options.search?.trim();
			const result = await supplierRepository.findMany({
				search: searchTerm
					? {
							columns: SUPPLIER_SEARCH_COLUMNS,
							term: searchTerm,
						}
					: undefined,
				sort: { column: 'name', ascending: true },
				pagination:
					options.page && options.pageSize
						? { page: options.page, pageSize: options.pageSize }
						: undefined,
			});

			return result.data;
		} catch (error: unknown) {
			throw toAppError(error);
		}
	},

	async getSupplierById(id: UUID): Promise<Supplier> {
		try {
			return await supplierRepository.findById(id);
		} catch (error: unknown) {
			throw toAppError(error);
		}
	},

	async createSupplier(input: SupplierInsert): Promise<Supplier> {
		try {
			return await supplierRepository.create(input);
		} catch (error: unknown) {
			throw toAppError(error);
		}
	},
};
