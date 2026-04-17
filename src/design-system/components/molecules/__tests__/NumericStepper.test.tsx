import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { NumericStepper } from '../NumericStepper';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('NumericStepper', () => {
	it('increments and decrements within bounds', () => {
		const onChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<NumericStepper label="Seats" defaultValue={2} onChange={onChange} testID="stepper" />,
		);
		fireEvent.press(getByTestId('stepper-increment'));
		fireEvent.press(getByTestId('stepper-decrement'));
		expect(onChange).toHaveBeenNthCalledWith(1, 3);
		expect(onChange).toHaveBeenNthCalledWith(2, 2);
	});
});
