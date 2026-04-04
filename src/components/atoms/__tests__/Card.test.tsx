import React from 'react';
import { render } from '@testing-library/react-native';
import { Card } from '../Card';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { Text } from 'react-native';

const renderWithTheme = (component: React.ReactElement) => {
	return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Card', () => {
	it('renders children correctly', () => {
		const { getByText } = renderWithTheme(
			<Card>
				<Text>Card Content</Text>
			</Card>,
		);
		expect(getByText('Card Content')).toBeTruthy();
	});

	it('renders different variants correctly', () => {
		const { toJSON: elevated } = renderWithTheme(
			<Card variant="elevated">
				<Text>E</Text>
			</Card>,
		);
		const { toJSON: outlined } = renderWithTheme(
			<Card variant="outlined">
				<Text>O</Text>
			</Card>,
		);
		const { toJSON: flat } = renderWithTheme(
			<Card variant="flat">
				<Text>F</Text>
			</Card>,
		);

		expect(elevated()).toBeTruthy();
		expect(outlined()).toBeTruthy();
		expect(flat()).toBeTruthy();
	});

	it('applies padding correctly', () => {
		const { toJSON: sm } = renderWithTheme(
			<Card padding="sm">
				<Text>S</Text>
			</Card>,
		);
		const { toJSON: lg } = renderWithTheme(
			<Card padding="lg">
				<Text>L</Text>
			</Card>,
		);

		const smStyle = (sm() as any).props.style;
		const flattenedSm = Array.isArray(smStyle) ? Object.assign({}, ...smStyle) : smStyle;

		const lgStyle = (lg() as any).props.style;
		const flattenedLg = Array.isArray(lgStyle) ? Object.assign({}, ...lgStyle) : lgStyle;

		expect(flattenedSm.padding).toBeDefined();
		expect(flattenedLg.padding).toBeGreaterThan(flattenedSm.padding);
	});
});
