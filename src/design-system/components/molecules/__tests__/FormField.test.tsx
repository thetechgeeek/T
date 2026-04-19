import React from 'react';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
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
		const { getByPlaceholderText, getByText } = renderWithTheme(
			<FormField label="Due Date" error="Date is required" placeholder="Date" />,
		);
		expect(getByText('Date is required')).toBeTruthy();
		expect(getByPlaceholderText('Date').props.accessibilityLabel).toBe('Due Date');
		expect(getByPlaceholderText('Date').props.accessibilityHint).toBe(
			'Error: Date is required',
		);
	});

	it('does NOT render error text when no error prop', () => {
		const { queryByText } = renderWithTheme(<FormField label="Due Date" placeholder="Date" />);
		expect(queryByText(/required/i)).toBeNull();
	});

	it('includes required state in the programmatic hint when needed', () => {
		const { getByPlaceholderText } = renderWithTheme(
			<FormField
				label="Approver"
				placeholder="Jane Doe"
				required
				helperText="Needed before publish"
			/>,
		);

		expect(getByPlaceholderText('Jane Doe').props.accessibilityHint).toBe(
			'Required. Needed before publish',
		);
	});
});
