import React from 'react';
import { render } from '@testing-library/react-native';
import { Appearance, View } from 'react-native';
import { ThemedText, resolveAccessibleFontWeight } from '../ThemedText';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { buildTheme } from '@/src/theme/colors';
import { resolveTypographyFamiliesForLocale } from '@/src/theme/localeTypography';

jest.mock('@react-native-async-storage/async-storage', () =>
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

type ThemeColorScheme = 'light' | 'dark';
type TypographyVariant = keyof ReturnType<typeof buildTheme>['typography']['variants'];

const THEME_MATRIX = [
	{ label: 'light', colorScheme: 'light' as const },
	{ label: 'dark', colorScheme: 'dark' as const },
] as const;

const HEADING_VARIANTS = new Set<TypographyVariant>([
	'display',
	'screenTitle',
	'sectionTitle',
	'h1',
	'h2',
	'h3',
]);

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
		const theme = buildTheme(false);
		const { getByText } = renderWithColorScheme(
			<ThemedText variant="body">Hello</ThemedText>,
			'light',
		);
		const text = getByText('Hello');
		expect(text.props.style).toContainEqual(
			expect.objectContaining({ fontSize: theme.typography.variants.body.fontSize }),
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
		const theme = buildTheme(false);
		const { getByText } = renderWithColorScheme(
			<ThemedText variant="amount">₹ 1,000</ThemedText>,
			'light',
		);
		const text = getByText('₹ 1,000');
		expect(text.props.style).toContainEqual(
			expect.objectContaining({
				fontSize: theme.typography.variants.amount.fontSize,
				fontWeight: '700',
			}),
		);
	});

	it('supports bodyMedium and code variants for quiet emphasis and monospace content', () => {
		const { getByText } = renderWithColorScheme(
			<>
				<ThemedText variant="bodyMedium">Calmer emphasis</ThemedText>
				<ThemedText variant="code">INV-2026-0042</ThemedText>
			</>,
			'light',
		);
		const bodyMedium = getByText('Calmer emphasis');
		const code = getByText('INV-2026-0042');

		expect(bodyMedium.props.style).toContainEqual(
			expect.objectContaining({ fontWeight: '500' }),
		);
		expect(code.props.style).toContainEqual(
			expect.objectContaining({ fontFamily: buildTheme(false).typography.families.mono }),
		);
	});

	it('uses locale-aware fallback families for non-Latin scripts', () => {
		const { getByText } = render(
			<ThemeProvider persist={false} runtimeOverrides={{ detectedLocale: 'hi-IN' }}>
				<ThemedText variant="body">हेलो</ThemedText>
			</ThemeProvider>,
		);

		expect(getByText('हेलो').props.style).toContainEqual(
			expect.objectContaining({
				fontFamily: resolveTypographyFamiliesForLocale('hi-IN').ui,
			}),
		);
	});

	it('applies 1.5x line height for body text', () => {
		const theme = buildTheme(false);
		const { getByText } = renderWithColorScheme(
			<ThemedText variant="body">Hello</ThemedText>,
			'light',
		);
		const text = getByText('Hello');
		expect(text.props.style).toContainEqual(
			expect.objectContaining({ lineHeight: theme.typography.variants.body.lineHeight }),
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
