import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../__tests__/utils/renderWithTheme';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
	it('renders title text', () => {
		const { getByText } = renderWithTheme(<EmptyState title="No invoices yet" />);
		expect(getByText('No invoices yet')).toBeTruthy();
	});

	it('renders description when provided', () => {
		const { getByText } = renderWithTheme(
			<EmptyState title="No invoices yet" description="Create your first invoice" />,
		);
		expect(getByText('Create your first invoice')).toBeTruthy();
	});

	it('renders action button when actionLabel and onAction provided', () => {
		const { getByText } = renderWithTheme(
			<EmptyState
				title="No invoices yet"
				actionLabel="Create Invoice"
				onAction={jest.fn()}
			/>,
		);
		expect(getByText('Create Invoice')).toBeTruthy();
	});

	it('action button calls onAction when pressed', () => {
		const onAction = jest.fn();
		const { getByText } = renderWithTheme(
			<EmptyState title="No invoices" actionLabel="Create Invoice" onAction={onAction} />,
		);
		fireEvent.press(getByText('Create Invoice'));
		expect(onAction).toHaveBeenCalledTimes(1);
	});

	it('does NOT render action button when actionLabel not provided', () => {
		const { queryByRole } = renderWithTheme(<EmptyState title="No invoices" />);
		expect(queryByRole('button')).toBeNull();
	});
});
