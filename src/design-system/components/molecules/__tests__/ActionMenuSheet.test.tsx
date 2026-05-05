import React from 'react';
import { Modal } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../../foundation/theme/ThemeProvider';
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

	it('labels destructive and disabled actions with state and hints', () => {
		const { getByTestId } = renderWithTheme(
			<ActionMenuSheet
				title="More actions"
				open
				testID="action-sheet"
				actions={[
					{ label: 'Delete category', value: 'delete', destructive: true },
					{ label: 'Archive', value: 'archive', disabled: true },
				]}
				onSelect={jest.fn()}
			/>,
		);

		expect(getByTestId('action-sheet-delete')).toHaveProp(
			'accessibilityHint',
			'Destructive action. Double tap to confirm this action.',
		);
		expect(getByTestId('action-sheet-archive')).toHaveProp('accessibilityState', {
			disabled: true,
		});
	});

	it('dismisses through the native back or escape request-close path', () => {
		const onOpenChange = jest.fn();
		const { getByTestId, UNSAFE_getAllByProps, UNSAFE_getByType } = renderWithTheme(
			<ActionMenuSheet
				title="More actions"
				open
				testID="action-sheet"
				actions={[{ label: 'Archive', value: 'archive' }]}
				onOpenChange={onOpenChange}
				onSelect={jest.fn()}
			/>,
		);

		expect(
			UNSAFE_getAllByProps({ accessibilityViewIsModal: true })[0]?.props
				.importantForAccessibility,
		).toBe('yes');
		expect(getByTestId('action-sheet-backdrop', { includeHiddenElements: true })).toHaveProp(
			'importantForAccessibility',
			'no-hide-descendants',
		);

		UNSAFE_getByType(Modal).props.onRequestClose();

		expect(onOpenChange).toHaveBeenCalledWith(false, { source: 'dismiss' });
	});
});
