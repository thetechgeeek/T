import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { NotificationCenter } from '../NotificationCenter';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

const ITEMS = [
	{ id: '1', title: 'Stock updated', category: 'System', read: false },
	{ id: '2', title: 'Approval pending', category: 'Mentions', read: false },
];

describe('NotificationCenter', () => {
	it('groups items by category', () => {
		const { getByText } = renderWithTheme(<NotificationCenter defaultItems={ITEMS} />);
		expect(getByText('System')).toBeTruthy();
		expect(getByText('Mentions')).toBeTruthy();
	});

	it('marks all items as read', () => {
		const onChange = jest.fn();
		const { getByText } = renderWithTheme(
			<NotificationCenter defaultItems={ITEMS} onChange={onChange} />,
		);
		fireEvent.press(getByText('Mark all as read'));
		expect(onChange).toHaveBeenCalled();
	});

	it('pairs unread state with visible text and accessibility labels', () => {
		const { getAllByText, getByLabelText } = renderWithTheme(
			<NotificationCenter defaultItems={ITEMS} />,
		);

		expect(getAllByText('Unread').length).toBeGreaterThan(0);
		expect(getByLabelText('Unread notification: Stock updated')).toBeTruthy();
	});
});
