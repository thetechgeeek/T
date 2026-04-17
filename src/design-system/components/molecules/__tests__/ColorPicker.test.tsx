import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { ColorPicker } from '../ColorPicker';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('ColorPicker', () => {
	it('renders the mode controls', () => {
		const { getByText } = renderWithTheme(
			<ColorPicker label="Accent color" onChange={jest.fn()} />,
		);
		expect(getByText('Hex')).toBeTruthy();
		expect(getByText('RGB')).toBeTruthy();
		expect(getByText('HSL')).toBeTruthy();
	});

	it('changes the selected swatch', () => {
		const onChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<ColorPicker label="Accent color" onChange={onChange} testID="color" />,
		);
		fireEvent.press(getByTestId('color-#065F46'));
		expect(onChange).toHaveBeenCalledWith('#065F46');
	});
});
