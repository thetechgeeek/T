import {
	buildInventoryConflictSnapshot,
	buildKeepMineResolutionUpdates,
	isInventoryVersionConflict,
} from './inventoryConflictOrchestrator';
import { ConflictError } from '@/src/errors/AppError';
import { makeInventoryItem } from '../../../__tests__/fixtures/inventoryFixtures';

describe('inventoryConflictOrchestrator', () => {
	it('recognizes inventory version conflicts narrowly', () => {
		expect(
			isInventoryVersionConflict(new ConflictError('VERSION_CONFLICT', 'Changed elsewhere')),
		).toBe(true);
		expect(isInventoryVersionConflict(new ConflictError('duplicate', 'Duplicate'))).toBe(false);
	});

	it('fetches the server snapshot for conflict resolution', async () => {
		const localItem = makeInventoryItem({ id: 'item-1', design_name: 'Local' });
		const serverItem = makeInventoryItem({ id: 'item-1', design_name: 'Server' });
		const fetchItemById = jest.fn().mockResolvedValue(serverItem);

		const result = await buildInventoryConflictSnapshot('item-1', localItem, fetchItemById);

		expect(fetchItemById).toHaveBeenCalledWith('item-1');
		expect(result).toEqual({ localItem, serverItem });
	});

	it('builds the force-update payload from editable local fields', () => {
		const localItem = makeInventoryItem({
			design_name: 'Local Tile',
			box_count: 12.5,
			low_stock_threshold: 2,
		});

		expect(buildKeepMineResolutionUpdates(localItem)).toMatchObject({
			design_name: 'Local Tile',
			box_count: 12.5,
			low_stock_threshold: 2,
			has_batch_tracking: false,
			has_serial_tracking: false,
		});
	});
});
