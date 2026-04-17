import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { RangeSlider } from '../RangeSlider';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('RangeSlider', () => {
	it('renders a single slider handle', () => {
		const { getByTestId } = renderWithTheme(
			<RangeSlider label="Threshold" onChange={jest.fn()} testID="slider" />,
		);
		expect(getByTestId('slider-handle-0')).toBeTruthy();
	});

	it('renders dual handles in range mode', () => {
		const { getByTestId } = renderWithTheme(
			<RangeSlider label="Threshold" range onChange={jest.fn()} testID="slider" />,
		);
		expect(getByTestId('slider-handle-0')).toBeTruthy();
		expect(getByTestId('slider-handle-1')).toBeTruthy();
	});
});
