import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { ThemedText } from '../ThemedText';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ThemedText', () => {
	it('renders children text', () => {
		const { getByText } = renderWithTheme(<ThemedText>Hello World</ThemedText>);
		expect(getByText('Hello World')).toBeTruthy();
	});

	it('renders with default variant (body2) without crashing', () => {
		const { toJSON } = renderWithTheme(<ThemedText>Default</ThemedText>);
		expect(toJSON()).toBeTruthy();
	});

	it('renders h1 variant without crashing', () => {
		const { getByText } = renderWithTheme(<ThemedText variant="h1">Big Title</ThemedText>);
		expect(getByText('Big Title')).toBeTruthy();
	});

	it('renders h2 variant', () => {
		const { getByText } = renderWithTheme(<ThemedText variant="h2">Subtitle</ThemedText>);
		expect(getByText('Subtitle')).toBeTruthy();
	});

	it('renders body1 variant', () => {
		const { getByText } = renderWithTheme(<ThemedText variant="body1">Body text</ThemedText>);
		expect(getByText('Body text')).toBeTruthy();
	});

	it('renders caption variant', () => {
		const { getByText } = renderWithTheme(
			<ThemedText variant="caption">Small text</ThemedText>,
		);
		expect(getByText('Small text')).toBeTruthy();
	});

	it('applies custom color prop', () => {
		const { toJSON } = renderWithTheme(<ThemedText color="#FF0000">Red Text</ThemedText>);
		const json = toJSON() as any;
		const flatStyle = Array.isArray(json.props.style)
			? Object.assign({}, ...json.props.style)
			: json.props.style;
		expect(flatStyle.color).toBe('#FF0000');
	});

	it('applies opacity prop', () => {
		const { toJSON } = renderWithTheme(<ThemedText opacity={0.5}>Faded</ThemedText>);
		const json = toJSON() as any;
		const flatStyle = Array.isArray(json.props.style)
			? Object.assign({}, ...json.props.style)
			: json.props.style;
		expect(flatStyle.opacity).toBe(0.5);
	});

	it('applies textAlign via align prop', () => {
		const { toJSON } = renderWithTheme(<ThemedText align="center">Centered</ThemedText>);
		const json = toJSON() as any;
		const flatStyle = Array.isArray(json.props.style)
			? Object.assign({}, ...json.props.style)
			: json.props.style;
		expect(flatStyle.textAlign).toBe('center');
	});

	it('overrides weight when weight prop provided', () => {
		const { toJSON } = renderWithTheme(<ThemedText weight="bold">Bold Text</ThemedText>);
		const json = toJSON() as any;
		const flatStyle = Array.isArray(json.props.style)
			? Object.assign({}, ...json.props.style)
			: json.props.style;
		expect(flatStyle.fontWeight).toBeTruthy();
	});

	it('merges additional style prop', () => {
		const { toJSON } = renderWithTheme(
			<ThemedText style={{ marginTop: 16 }}>Spaced</ThemedText>,
		);
		const json = toJSON() as any;
		const mergedStyles = Array.isArray(json.props.style)
			? Object.assign({}, ...json.props.style)
			: json.props.style;
		expect(mergedStyles.marginTop).toBe(16);
	});

	it('forwards testID prop', () => {
		const { getByTestId } = renderWithTheme(<ThemedText testID="my-text">ID Text</ThemedText>);
		expect(getByTestId('my-text')).toBeTruthy();
	});
});
