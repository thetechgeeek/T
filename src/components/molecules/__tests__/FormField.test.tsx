import React from 'react';
import { renderWithTheme } from '../../../../__tests__/utils/renderWithTheme';
import { FormField } from '../FormField';

describe('FormField', () => {
	it('renders label text', () => {
		const { getByText } = renderWithTheme(
			<FormField label="Invoice Date" placeholder="Select date" />,
		);
		expect(getByText('Invoice Date')).toBeTruthy();
	});

	it('renders the input via passed props', () => {
		const { getByPlaceholderText } = renderWithTheme(
			<FormField label="Invoice Date" placeholder="YYYY-MM-DD" />,
		);
		expect(getByPlaceholderText('YYYY-MM-DD')).toBeTruthy();
	});

	it('renders error message below when error prop provided', () => {
		const { getByText } = renderWithTheme(
			<FormField label="Due Date" error="Date is required" placeholder="Date" />,
		);
		expect(getByText('Date is required')).toBeTruthy();
	});

	it('does NOT render error text when no error prop', () => {
		const { queryByText } = renderWithTheme(
			<FormField label="Due Date" placeholder="Date" />,
		);
		expect(queryByText(/required/i)).toBeNull();
	});
});
