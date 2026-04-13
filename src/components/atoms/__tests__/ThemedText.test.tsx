import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '../ThemedText';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { FONT_SIZE, LINE_HEIGHT } from '@/src/theme/typographyMetrics';

describe('ThemedText (P0.2)', () => {
	const renderWithTheme = (component: React.ReactElement) => {
		return render(<ThemeProvider>{component}</ThemeProvider>);
	};

	it('applies the correct font size for body variant (16sp)', () => {
		const { getByText } = renderWithTheme(<ThemedText variant="body">Hello</ThemedText>);
		const text = getByText('Hello');
		expect(text.props.style).toContainEqual(
			expect.objectContaining({ fontSize: FONT_SIZE.body }),
		);
	});

	it('forces maxFontSizeMultiplier to 1.3', () => {
		const { getByText } = renderWithTheme(<ThemedText>Hello</ThemedText>);
		const text = getByText('Hello');
		expect(text.props.maxFontSizeMultiplier).toBe(1.3);
	});

	it('supports amount variants', () => {
		const { getByText } = renderWithTheme(<ThemedText variant="amount">₹ 1,000</ThemedText>);
		const text = getByText('₹ 1,000');
		// amount should be 20sp bold
		expect(text.props.style).toContainEqual(
			expect.objectContaining({ fontSize: FONT_SIZE.amount, fontWeight: '700' }),
		);
	});

	it('applies 1.5x line height for body text', () => {
		const { getByText } = renderWithTheme(<ThemedText variant="body">Hello</ThemedText>);
		const text = getByText('Hello');
		expect(text.props.style).toContainEqual(
			expect.objectContaining({ lineHeight: LINE_HEIGHT.body }),
		);
	});

	it('sets accessibilityRole="header" for h1, h2, h3', () => {
		const { getByText } = renderWithTheme(<ThemedText variant="h1">Heading</ThemedText>);
		expect(getByText('Heading').props.accessibilityRole).toBe('header');
	});
});
