import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { ActionMenuSheet } from '../ActionMenuSheet';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('ActionMenuSheet', () => {
	it('renders actions when open', () => {
		const { getByText } = renderWithTheme(
			<ActionMenuSheet
				title="More actions"
				open
				actions={[{ label: 'Archive', value: 'archive' }]}
				onSelect={jest.fn()}
			/>,
		);
		expect(getByText('More actions')).toBeTruthy();
		expect(getByText('Archive')).toBeTruthy();
	});

	it('calls onSelect when an action is pressed', () => {
		const onSelect = jest.fn();
		const { getByText } = renderWithTheme(
			<ActionMenuSheet
				title="More actions"
				open
				actions={[{ label: 'Archive', value: 'archive' }]}
				onSelect={onSelect}
			/>,
		);
		fireEvent.press(getByText('Archive'));
		expect(onSelect).toHaveBeenCalledWith('archive');
	});
});
