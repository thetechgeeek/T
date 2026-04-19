import React from 'react';
import { render } from '@testing-library/react-native';
import { buildTheme } from '@/src/theme/colors';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import type { RuntimeQualitySignals } from '@/src/design-system/runtimeSignals';
import { Text } from 'react-native';
import { Card, CardBody, CardFooter, CardHeader } from '../Card';

const lightTheme = buildTheme(false);

function flattenStyle(style: unknown) {
	return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
}

const renderWithTheme = (
	component: React.ReactElement,
	runtimeOverrides?: Partial<RuntimeQualitySignals>,
) =>
	render(
		<ThemeProvider persist={false} runtimeOverrides={runtimeOverrides}>
			{component}
		</ThemeProvider>,
	);

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

	it('renders header, body, and footer slots', () => {
		const { getByText } = renderWithTheme(
			<Card
				header={<CardHeader>Summary</CardHeader>}
				footer={
					<CardFooter>
						<Text>Footer action</Text>
					</CardFooter>
				}
			>
				<CardBody>
					<Text>Body copy</Text>
				</CardBody>
			</Card>,
		);

		expect(getByText('Summary')).toBeTruthy();
		expect(getByText('Body copy')).toBeTruthy();
		expect(getByText('Footer action')).toBeTruthy();
	});

	it('supports the horizontal orientation', () => {
		const { getByTestId } = renderWithTheme(
			<Card testID="horizontal-card" orientation="horizontal" media={<Text>Media</Text>}>
				<Text>Row content</Text>
			</Card>,
		);

		expect(flattenStyle(getByTestId('horizontal-card').props.style)).toEqual(
			expect.objectContaining({ flexDirection: 'row' }),
		);
	});

	it('renders the featured hero treatment', () => {
		const { getByTestId } = renderWithTheme(
			<Card testID="featured-card" featured>
				<Text>Hero content</Text>
			</Card>,
		);

		expect(flattenStyle(getByTestId('featured-card').props.style)).toEqual(
			expect.objectContaining({
				backgroundColor: lightTheme.visual.hero.promo.surface,
				borderColor: lightTheme.visual.hero.promo.accent,
			}),
		);
	});

	it('maps compact and relaxed density to shared card spacing', () => {
		const { getByTestId: getCompactByTestId } = renderWithTheme(
			<Card testID="compact-card" density="compact">
				<Text>Compact</Text>
			</Card>,
		);
		const { getByTestId: getRelaxedByTestId } = renderWithTheme(
			<Card testID="relaxed-card" density="relaxed">
				<Text>Relaxed</Text>
			</Card>,
		);

		const compactStyle = flattenStyle(getCompactByTestId('compact-card').props.style) as {
			padding: number;
		};
		const relaxedStyle = flattenStyle(getRelaxedByTestId('relaxed-card').props.style) as {
			padding: number;
		};

		expect(relaxedStyle.padding).toBeGreaterThan(compactStyle.padding);
	});

	it('scales card padding up for tablet layouts without changing the content contract', () => {
		const { getByTestId, rerender } = renderWithTheme(
			<Card testID="adaptive-card">
				<Text>Adaptive</Text>
			</Card>,
			{
				windowWidth: 390,
				windowHeight: 844,
				breakpoint: 'phone',
				deviceType: 'phone',
				orientation: 'portrait',
				columns: 1,
				supportsSplitPane: false,
				layoutScale: 1,
				spacingScale: 1,
				typographyScale: 1,
			},
		);

		const phoneStyle = flattenStyle(getByTestId('adaptive-card').props.style) as {
			padding: number;
		};

		rerender(
			<ThemeProvider
				persist={false}
				runtimeOverrides={{
					windowWidth: 1024,
					windowHeight: 768,
					breakpoint: 'tablet',
					deviceType: 'tablet',
					orientation: 'landscape',
					columns: 2,
					supportsSplitPane: true,
					layoutScale: 1.08,
					spacingScale: 1.08,
					typographyScale: 1.04,
				}}
			>
				<Card testID="adaptive-card">
					<Text>Adaptive</Text>
				</Card>
			</ThemeProvider>,
		);

		const tabletStyle = flattenStyle(getByTestId('adaptive-card').props.style) as {
			padding: number;
		};

		expect(tabletStyle.padding).toBeGreaterThan(phoneStyle.padding);
	});
});
