import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { KanbanBoard, type KanbanBoardColumn } from '../KanbanBoard';

const columns: KanbanBoardColumn[] = [
	{
		id: 'todo',
		title: 'Todo',
		wipLimit: 1,
		items: [
			{
				id: 'card-1',
				title: 'Audit queue',
				description: 'Review blocked invoices',
				statusLabel: 'High',
			},
			{ id: 'card-2', title: 'Sync bank feed', description: 'Reconcile statement' },
		],
	},
	{
		id: 'done',
		title: 'Done',
		items: [{ id: 'card-3', title: 'Send digest', description: 'Customer reminder sent' }],
	},
];

describe('KanbanBoard', () => {
	it('renders horizontal columns and quiet WIP limit warnings', () => {
		const { getByTestId, getByText } = renderWithTheme(
			<KanbanBoard columns={columns} testID="kanban-board" />,
		);

		expect(getByTestId('kanban-board')).toHaveProp('horizontal', true);
		expect(getByText('Limit 2/1')).toBeTruthy();
		expect(getByText('Todo')).toBeTruthy();
		expect(getByText('Done')).toBeTruthy();
	});

	it('moves cards between columns with explicit controls', () => {
		const onColumnsChange = jest.fn();
		const { getAllByLabelText } = renderWithTheme(
			<KanbanBoard columns={columns} onColumnsChange={onColumnsChange} />,
		);

		fireEvent.press(getAllByLabelText('Move card to next column')[0]);

		expect(onColumnsChange).toHaveBeenCalledWith([
			{
				...columns[0],
				items: [columns[0]!.items[1]!],
			},
			{
				...columns[1],
				items: [...columns[1]!.items, columns[0]!.items[0]!],
			},
		]);
	});
});
