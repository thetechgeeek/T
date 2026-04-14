import React from 'react';
import AddSupplierScreen from '@/app/(app)/suppliers/add';
import { renderWithTheme } from '../../utils/renderWithTheme';

describe('AddSupplierScreen', () => {
	it('renders section headers and save action', () => {
		const { getByText, getAllByText, getByPlaceholderText } = renderWithTheme(
			<AddSupplierScreen />,
		);

		expect(getByText('Basic Info')).toBeTruthy();
		expect(getByText('GST Details')).toBeTruthy();
		expect(getAllByText('Address').length).toBeGreaterThan(0);
		expect(getByText('Terms & Notes')).toBeTruthy();
		expect(getByPlaceholderText('Enter supplier name')).toBeTruthy();
		expect(getByText('Save Supplier')).toBeTruthy();
	});
});
