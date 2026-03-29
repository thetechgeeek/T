/**
 * Integration tests for the Inventory tab screen.
 *
 * @requires @testing-library/react-native
 *
 * @todo Uncomment when @testing-library/react-native is installed.
 */

// import React from 'react';
// import { render, waitFor, fireEvent } from '@testing-library/react-native';
// import InventoryScreen from '@/app/(app)/(tabs)/inventory';
// import { useInventoryStore } from '@/src/stores/inventoryStore';

describe.skip('InventoryScreen — integration (requires RNTL)', () => {
	it('renders inventory list grouped by tile set', async () => {
		// const { getAllByTestId } = render(<InventoryScreen />);
		// await waitFor(() => expect(getAllByTestId('tile-set-card').length).toBeGreaterThan(0));
		expect(true).toBe(true);
	});

	it('shows empty state with no inventory', async () => {
		// useInventoryStore.setState({ items: [], loading: false });
		// const { getByText } = render(<InventoryScreen />);
		// await waitFor(() => expect(getByText('No items in inventory')).toBeTruthy());
		expect(true).toBe(true);
	});

	it('applies category filter', async () => {
		// const { getByText } = render(<InventoryScreen />);
		// fireEvent.press(getByText('Wall'));
		// await waitFor(() => expect(useInventoryStore.getState().filters.category).toBe('WALL'));
		expect(true).toBe(true);
	});

	it('searches by query with debounce', async () => {
		// const { getByPlaceholderText } = render(<InventoryScreen />);
		// fireEvent.changeText(getByPlaceholderText('Search'), 'Marble');
		// await waitFor(() =>
		// 	expect(useInventoryStore.getState().filters.search).toBe('Marble'),
		// 	{ timeout: 400 }
		// );
		expect(true).toBe(true);
	});

	it('shows empty filter hint when search returns no results', async () => {
		// useInventoryStore.setState({ items: [], loading: false });
		// const { getByText } = render(<InventoryScreen />);
		// await waitFor(() => expect(getByText('Try adjusting your search or filters.')).toBeTruthy());
		expect(true).toBe(true);
	});
});
