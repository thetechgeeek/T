import React from 'react';
import { Modal } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { ActionMenuSheet } from '../ActionMenuSheet';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

function flattenStyle(style: unknown) {
	return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
}

describe('ActionMenuSheet', () => {
	it('supports compact and relaxed density spacing', () => {
		const { getByTestId, rerender } = renderWithTheme(
			<ActionMenuSheet
				title="More actions"
				open
				density="compact"
				testID="action-sheet"
				actions={[{ label: 'Archive', value: 'archive' }]}
				onSelect={jest.fn()}
			/>,
		);

		const compactStyle = flattenStyle(getByTestId('action-sheet').props.style) as {
			paddingHorizontal: number;
			paddingVertical: number;
		};

		rerender(
			<ThemeProvider>
				<ActionMenuSheet
					title="More actions"
					open
					density="relaxed"
					testID="action-sheet"
					actions={[{ label: 'Archive', value: 'archive' }]}
					onSelect={jest.fn()}
				/>
			</ThemeProvider>,
		);

		const relaxedStyle = flattenStyle(getByTestId('action-sheet').props.style) as {
			paddingHorizontal: number;
			paddingVertical: number;
		};

		expect(compactStyle.paddingHorizontal).toBeGreaterThan(0);
		expect(compactStyle.paddingVertical).toBeGreaterThan(0);
		expect(compactStyle.paddingHorizontal).toBeLessThan(relaxedStyle.paddingHorizontal);
		expect(compactStyle.paddingVertical).toBeLessThan(relaxedStyle.paddingVertical);
	});

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

	it('dismisses through the native back or escape request-close path', () => {
		const onOpenChange = jest.fn();
		const { UNSAFE_getByType } = renderWithTheme(
			<ActionMenuSheet
				title="More actions"
				open
				actions={[{ label: 'Archive', value: 'archive' }]}
				onOpenChange={onOpenChange}
				onSelect={jest.fn()}
			/>,
		);

		UNSAFE_getByType(Modal).props.onRequestClose();

		expect(onOpenChange).toHaveBeenCalledWith(false, { source: 'dismiss' });
	});
});
