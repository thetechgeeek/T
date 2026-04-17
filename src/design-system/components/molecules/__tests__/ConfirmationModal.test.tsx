import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConfirmationModal } from '../ConfirmationModal';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { buildTheme } from '@/src/theme/colors';

const lightTheme = buildTheme(false);

function flattenStyle(style: unknown) {
	return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
}

const renderWithTheme = (component: React.ReactElement) =>
	render(
		<ThemeProvider initialMode="light" persist={false}>
			{component}
		</ThemeProvider>,
	);

describe('ConfirmationModal', () => {
	const defaultProps = {
		visible: true,
		title: 'Delete Item',
		message: 'Are you sure?',
		onConfirm: jest.fn(),
		onCancel: jest.fn(),
	};

	it('renders title and message when visible', () => {
		const { getByText } = renderWithTheme(<ConfirmationModal {...defaultProps} />);
		expect(getByText('Delete Item')).toBeTruthy();
		expect(getByText('Are you sure?')).toBeTruthy();
	});

	it('does not render when not visible', () => {
		const { queryByText } = renderWithTheme(
			<ConfirmationModal {...defaultProps} visible={false} />,
		);
		expect(queryByText('Delete Item')).toBeNull();
	});

	it('calls onCancel when Cancel is pressed', () => {
		const onCancel = jest.fn();
		const { getByText } = renderWithTheme(
			<ConfirmationModal {...defaultProps} onCancel={onCancel} />,
		);
		fireEvent.press(getByText('Cancel'));
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it('calls onConfirm when Confirm is pressed', () => {
		const onConfirm = jest.fn();
		const { getByText } = renderWithTheme(
			<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />,
		);
		fireEvent.press(getByText('Confirm'));
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it('renders custom confirm label', () => {
		const { getByText } = renderWithTheme(
			<ConfirmationModal {...defaultProps} confirmLabel="Delete" />,
		);
		expect(getByText('Delete')).toBeTruthy();
	});

	it('renders custom cancel label', () => {
		const { getByText } = renderWithTheme(
			<ConfirmationModal {...defaultProps} cancelLabel="Go Back" />,
		);
		expect(getByText('Go Back')).toBeTruthy();
	});

	it('has accessibility view is modal', () => {
		const { getByTestId } = renderWithTheme(
			<ConfirmationModal {...defaultProps} testID="modal-overlay" />,
		);
		expect(getByTestId('modal-overlay')).toBeTruthy();
	});

	it('supports a destructive confirmation variant', () => {
		const { getByLabelText } = renderWithTheme(
			<ConfirmationModal {...defaultProps} variant="destructive" confirmLabel="Delete" />,
		);

		expect(flattenStyle(getByLabelText('Delete').props.style)).toEqual(
			expect.objectContaining({ backgroundColor: lightTheme.colors.error }),
		);
	});

	it('supports size variants on the dialog frame', () => {
		const { getByTestId, rerender } = renderWithTheme(
			<ConfirmationModal {...defaultProps} size="sm" testID="modal-overlay" />,
		);

		expect(flattenStyle(getByTestId('modal-overlay-card').props.style)).toEqual(
			expect.objectContaining({ maxWidth: 360 }),
		);

		rerender(
			<ThemeProvider initialMode="light" persist={false}>
				<ConfirmationModal {...defaultProps} size="lg" testID="modal-overlay" />
			</ThemeProvider>,
		);

		expect(flattenStyle(getByTestId('modal-overlay-card').props.style)).toEqual(
			expect.objectContaining({ maxWidth: 640 }),
		);
	});

	it('requires exact hard-confirmation text before enabling confirm', () => {
		const onConfirm = jest.fn();
		const { getByLabelText } = renderWithTheme(
			<ConfirmationModal
				{...defaultProps}
				onConfirm={onConfirm}
				hardConfirmValue="PUBLISH"
				hardConfirmLabel="Type to confirm"
			/>,
		);

		expect(getByLabelText('Confirm').props.accessibilityState.disabled).toBe(true);

		fireEvent.changeText(getByLabelText('Type to confirm'), 'PUBLISH');
		fireEvent.press(getByLabelText('Confirm'));

		expect(onConfirm).toHaveBeenCalledTimes(1);
	});
});
