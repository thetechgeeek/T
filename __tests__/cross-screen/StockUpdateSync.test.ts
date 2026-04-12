import { waitFor } from '@testing-library/react-native';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { useDashboardStore } from '@/src/stores/dashboardStore';
import { inventoryService } from '@/src/services/inventoryService';
import { dashboardService } from '@/src/services/dashboardService';

jest.mock('@/src/services/inventoryService');
jest.mock('@/src/services/dashboardService');

describe('Cross-Screen Sync: Inventory to Dashboard', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useInventoryStore.getState().reset();
		useDashboardStore.setState({ stats: null, loading: false });
	});

	it('triggers dashboard refresh when a stock operation is performed', async () => {
		const itemId = 'item-123';
		(inventoryService.performStockOperation as jest.Mock).mockResolvedValue(undefined);
		(inventoryService.fetchItemById as jest.Mock).mockResolvedValue({
			id: itemId,
			design_name: 'Test',
			box_count: 50,
			has_batch_tracking: false,
			has_serial_tracking: false,
		});
		(dashboardService.fetchDashboardStats as jest.Mock).mockResolvedValue({
			today_sales: 100,
			low_stock_count: 5,
		});

		// 1. Perform stock operation via Inventory Store
		await useInventoryStore.getState().performStockOperation(itemId, 'stock_in', 10);

		// 2. Verify that Dashboard Store automatically re-fetched stats via EventBus
		await waitFor(() => {
			expect(dashboardService.fetchDashboardStats).toHaveBeenCalled();
		});

		expect(useDashboardStore.getState().stats?.today_sales).toBe(100);
	});

	it('triggers dashboard refresh when a new item is created', async () => {
		(inventoryService.createItem as jest.Mock).mockResolvedValue({
			id: 'new-item',
			design_name: 'New',
			box_count: 10,
			has_batch_tracking: false,
			has_serial_tracking: false,
		});
		(dashboardService.fetchDashboardStats as jest.Mock).mockResolvedValue({
			today_sales: 200,
		});

		await useInventoryStore.getState().createItem({
			design_name: 'New',
			category: 'GLOSSY',
			box_count: 10,
			has_batch_tracking: false,
			has_serial_tracking: false,
		} as any);

		await waitFor(() => {
			expect(dashboardService.fetchDashboardStats).toHaveBeenCalled();
		});
	});
});
