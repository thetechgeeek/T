import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../__tests__/utils/renderWithTheme';
import { Chip } from '../Chip';

describe('Chip', () => {
	it('renders label text', () => {
		const { getByText } = renderWithTheme(<Chip label="GST 18%" />);
		expect(getByText('GST 18%')).toBeTruthy();
	});

	it('calls onPress when pressed', () => {
		const onPress = jest.fn();
		const { getByText } = renderWithTheme(<Chip label="test" onPress={onPress} />);
		fireEvent.press(getByText('test'));
		expect(onPress).toHaveBeenCalledTimes(1);
	});

	it('does NOT call onPress when no onPress prop provided', () => {
		// Chip without onPress should not throw on press
		const { getByText } = renderWithTheme(<Chip label="no-press" />);
		expect(() => fireEvent.press(getByText('no-press'))).not.toThrow();
	});

	it('selected=true applies selected accessibilityState', () => {
		const { getByRole } = renderWithTheme(<Chip label="selected" selected={true} />);
		const chip = getByRole('togglebutton');
		expect(chip.props.accessibilityState?.selected).toBe(true);
	});

	it('selected=false applies unselected accessibilityState', () => {
		const { getByRole } = renderWithTheme(<Chip label="unselected" selected={false} />);
		const chip = getByRole('togglebutton');
		expect(chip.props.accessibilityState?.selected).toBe(false);
	});
});
