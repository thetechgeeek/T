import { supplierService } from './supplierService';
import { supplierRepository } from '../repositories/supplierRepository';

jest.mock('../repositories/supplierRepository', () => ({
	supplierRepository: {
		findMany: jest.fn(),
		findById: jest.fn(),
		create: jest.fn(),
	},
}));

const mockRepository = supplierRepository as jest.Mocked<typeof supplierRepository>;

describe('supplierService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('finds suppliers through the repository and returns rows only', async () => {
		const suppliers = [{ id: 'supplier-1', name: 'Bharat Ceramics' }];
		mockRepository.findMany.mockResolvedValueOnce({
			data: suppliers as Awaited<ReturnType<typeof supplierService.findSuppliers>>,
			total: 1,
		});

		const result = await supplierService.findSuppliers({ search: 'Bharat' });

		expect(mockRepository.findMany).toHaveBeenCalledWith({
			search: {
				columns: ['name', 'contact_person', 'phone', 'city'],
				term: 'Bharat',
			},
			sort: { column: 'name', ascending: true },
			pagination: undefined,
		});
		expect(result).toEqual(suppliers);
	});

	it('normalizes unknown lookup failures to AppError', async () => {
		mockRepository.findById.mockRejectedValueOnce('repository failed');

		await expect(supplierService.getSupplierById('supplier-1')).rejects.toMatchObject({
			code: 'UNKNOWN',
			message: 'repository failed',
		});
	});

	it('creates suppliers through the service boundary', async () => {
		const supplier = { id: 'supplier-1', name: 'New Supplier' };
		mockRepository.create.mockResolvedValueOnce(supplier as never);

		await expect(supplierService.createSupplier({ name: 'New Supplier' })).resolves.toEqual(
			supplier,
		);
		expect(mockRepository.create).toHaveBeenCalledWith({ name: 'New Supplier' });
	});
});
