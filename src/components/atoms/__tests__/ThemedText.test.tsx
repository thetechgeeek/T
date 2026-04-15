import React from 'react';
import { render } from '@testing-library/react-native';
import { Appearance, View } from 'react-native';
import { ThemedText, resolveAccessibleFontWeight } from '../ThemedText';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { buildTheme } from '@/src/theme/colors';
import { FONT_SIZE, LINE_HEIGHT } from '@/src/theme/typographyMetrics';

jest.mock('@react-native-async-storage/async-storage', () =>
	require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

type ThemeColorScheme = 'light' | 'dark';
type TypographyVariant = keyof ReturnType<typeof buildTheme>['typography']['variants'];

const THEME_MATRIX = [
	{ label: 'light', colorScheme: 'light' as const },
	{ label: 'dark', colorScheme: 'dark' as const },
] as const;

const HEADING_VARIANTS = new Set<TypographyVariant>(['h1', 'h2', 'h3']);

function renderWithColorScheme(component: React.ReactElement, colorScheme: ThemeColorScheme) {
	jest.spyOn(Appearance, 'getColorScheme').mockReturnValue(colorScheme);
	return render(<ThemeProvider>{component}</ThemeProvider>);
}

function VariantGallery() {
	const variants = Object.keys(buildTheme(false).typography.variants) as TypographyVariant[];

	return (
		<View>
			{variants.map((variant) => (
				<ThemedText key={variant} variant={variant}>
					{variant}
				</ThemedText>
			))}
		</View>
	);
}

describe('ThemedText (P0.2)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('applies the correct font size for body variant (16sp)', () => {
		const { getByText } = renderWithColorScheme(
			<ThemedText variant="body">Hello</ThemedText>,
			'light',
		);
		const text = getByText('Hello');
		expect(text.props.style).toContainEqual(
			expect.objectContaining({ fontSize: FONT_SIZE.body }),
		);
	});

	it('forces maxFontSizeMultiplier to 1.3', () => {
		const { getByText } = renderWithColorScheme(<ThemedText>Hello</ThemedText>, 'light');
		const text = getByText('Hello');
		expect(text.props.maxFontSizeMultiplier).toBe(1.3);
	});

	it('promotes regular weight when bold text accessibility is enabled', () => {
		const { getByText } = render(
			<ThemeProvider persist={false} runtimeOverrides={{ boldTextEnabled: true }}>
				<ThemedText variant="body">Readable</ThemedText>
			</ThemeProvider>,
		);
		const text = getByText('Readable');

		expect(resolveAccessibleFontWeight('400', true)).toBe('500');
		expect(text.props.style).toContainEqual(expect.objectContaining({ fontWeight: '500' }));
	});

	it('supports amount variants', () => {
		const { getByText } = renderWithColorScheme(
			<ThemedText variant="amount">₹ 1,000</ThemedText>,
			'light',
		);
		const text = getByText('₹ 1,000');
		expect(text.props.style).toContainEqual(
			expect.objectContaining({ fontSize: FONT_SIZE.amount, fontWeight: '700' }),
		);
	});

	it('applies 1.5x line height for body text', () => {
		const { getByText } = renderWithColorScheme(
			<ThemedText variant="body">Hello</ThemedText>,
			'light',
		);
		const text = getByText('Hello');
		expect(text.props.style).toContainEqual(
			expect.objectContaining({ lineHeight: LINE_HEIGHT.body }),
		);
	});

	it.each(THEME_MATRIX)(
		'renders every variant with live theme tokens in $label mode',
		({ colorScheme }) => {
			const theme = buildTheme(colorScheme === 'dark');
			const variants = Object.entries(theme.typography.variants) as Array<
				[TypographyVariant, (typeof theme.typography.variants)[TypographyVariant]]
			>;

			for (const [variant, expectedStyle] of variants) {
				const { getByText, unmount } = renderWithColorScheme(
					<ThemedText variant={variant}>{variant}</ThemedText>,
					colorScheme,
				);
				const text = getByText(variant);

				expect(text.props.style).toContainEqual(
					expect.objectContaining({
						fontSize: expectedStyle.fontSize,
						lineHeight: expectedStyle.lineHeight,
						fontWeight: expectedStyle.fontWeight,
						color: expectedStyle.color ?? theme.colors.onSurface,
					}),
				);

				if (HEADING_VARIANTS.has(variant)) {
					expect(text.props.accessibilityRole).toBe('header');
				} else {
					expect(text.props.accessibilityRole).toBeUndefined();
				}

				unmount();
			}
		},
	);

	it.each(THEME_MATRIX)(
		'matches the variant gallery snapshot in $label mode',
		({ colorScheme }) => {
			const { toJSON } = renderWithColorScheme(<VariantGallery />, colorScheme);
			expect(toJSON()).toMatchSnapshot();
		},
	);
});
