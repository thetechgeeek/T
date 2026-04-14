import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { render } from '@testing-library/react-native';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { Screen } from '../Screen';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);
const flattenStyle = (style: StyleProp<ViewStyle> | undefined) =>
	Array.isArray(style) ? Object.assign({}, ...style) : (style ?? {});
interface RenderedRootNode {
	props: {
		style?: StyleProp<ViewStyle>;
	};
}

const asSingleNode = (node: unknown): RenderedRootNode => {
	if (!node || Array.isArray(node) || typeof node !== 'object' || !('props' in node)) {
		throw new Error('Expected a single rendered root node.');
	}

	return node as RenderedRootNode;
};
const mockUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<typeof useSafeAreaInsets>;

describe('Screen', () => {
	beforeEach(() => {
		mockUseSafeAreaInsets.mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 });
	});

	it('renders children', () => {
		const { getByText } = renderWithTheme(
			<Screen>
				<Text>Hello Screen</Text>
			</Screen>,
		);
		expect(getByText('Hello Screen')).toBeTruthy();
	});

	it('renders non-scrollable layout by default', () => {
		const { toJSON } = renderWithTheme(
			<Screen>
				<Text>Content</Text>
			</Screen>,
		);
		expect(toJSON()).toBeTruthy();
	});

	it('wraps in ScrollView when scrollable=true', () => {
		const { toJSON } = renderWithTheme(
			<Screen scrollable>
				<Text>Scrollable content</Text>
			</Screen>,
		);
		const json = JSON.stringify(toJSON());
		expect(json).toContain('ScrollView');
	});

	it('keeps header and footer outside the scroll view', () => {
		const { UNSAFE_getByType, toJSON } = renderWithTheme(
			<Screen
				scrollable
				withKeyboard={false}
				header={<Text>Fixed Header</Text>}
				footer={<Text>Fixed Footer</Text>}
				overlay={<Text>Floating Overlay</Text>}
			>
				<Text>Scrollable body</Text>
			</Screen>,
		);

		const scrollView = UNSAFE_getByType(ScrollView);
		const scrollJson = JSON.stringify(scrollView.props.children);
		const rootJson = JSON.stringify(toJSON());

		expect(scrollJson).toContain('Scrollable body');
		expect(scrollJson).not.toContain('Fixed Header');
		expect(scrollJson).not.toContain('Fixed Footer');
		expect(rootJson).toContain('Fixed Header');
		expect(rootJson).toContain('Fixed Footer');
		expect(rootJson).toContain('Floating Overlay');
	});

	it('applies custom backgroundColor via withKeyboard=false path', () => {
		const { toJSON } = renderWithTheme(
			<Screen withKeyboard={false} backgroundColor="#FF0000">
				<Text>Colored</Text>
			</Screen>,
		);
		const json = JSON.stringify(toJSON());
		expect(json).toContain('#FF0000');
	});

	it('renders multiple children correctly', () => {
		const { getByText } = renderWithTheme(
			<Screen>
				<Text>First</Text>
				<Text>Second</Text>
			</Screen>,
		);
		expect(getByText('First')).toBeTruthy();
		expect(getByText('Second')).toBeTruthy();
	});

	it('applies padding based on safeAreaInsets', () => {
		mockUseSafeAreaInsets.mockReturnValue({ top: 50, bottom: 30, left: 0, right: 0 });

		const { toJSON } = renderWithTheme(
			<Screen safeAreaEdges={['top', 'bottom']}>
				<Text>Safe</Text>
			</Screen>,
		);
		const json = asSingleNode(toJSON());
		// The Screen component returns View or KeyboardAvoidingView.
		// Both have the padding applied via style.
		const flattened = flattenStyle(json.props.style);

		expect(flattened.paddingTop).toBe(50);
		expect(flattened.paddingBottom).toBe(30);
	});

	it('respects empty safeAreaEdges', () => {
		mockUseSafeAreaInsets.mockReturnValue({ top: 50, bottom: 30, left: 0, right: 0 });

		const { toJSON } = renderWithTheme(
			<Screen safeAreaEdges={[]}>
				<Text>No Safe</Text>
			</Screen>,
		);
		const json = asSingleNode(toJSON());
		const flattened = flattenStyle(json.props.style);

		expect(flattened.paddingTop).toBe(0);
		expect(flattened.paddingBottom).toBe(0);
	});

	it('keeps top padding at zero for bottom-only safe areas', () => {
		mockUseSafeAreaInsets.mockReturnValue({ top: 48, bottom: 24, left: 0, right: 0 });

		const { toJSON } = renderWithTheme(
			<Screen safeAreaEdges={['bottom']} withKeyboard={false}>
				<Text>Bottom Only</Text>
			</Screen>,
		);

		const json = asSingleNode(toJSON());
		const flattened = flattenStyle(json.props.style);

		expect(flattened.paddingTop).toBe(0);
		expect(flattened.paddingBottom).toBe(24);
	});

	it('moves bottom inset padding to the footer wrapper when footer is present', () => {
		mockUseSafeAreaInsets.mockReturnValue({ top: 0, bottom: 24, left: 0, right: 0 });

		const { UNSAFE_getAllByType, toJSON } = renderWithTheme(
			<Screen
				safeAreaEdges={['bottom']}
				withKeyboard={false}
				footer={
					<View testID="footer-shell">
						<Text>Footer</Text>
					</View>
				}
			>
				<Text>Body</Text>
			</Screen>,
		);

		const json = asSingleNode(toJSON());
		const flattened = flattenStyle(json.props.style);
		const footerPaddingWrapper = UNSAFE_getAllByType(View).find(
			(node) =>
				flattenStyle(node.props.style as StyleProp<ViewStyle> | undefined).paddingBottom ===
				24,
		);

		expect(flattened.paddingBottom).toBe(0);
		expect(footerPaddingWrapper).toBeTruthy();
	});

	it('forwards scrollViewProps to the internal scroll view', () => {
		const { UNSAFE_getByType } = renderWithTheme(
			<Screen
				scrollable
				withKeyboard={false}
				scrollViewProps={{
					testID: 'screen-scroll',
					keyboardShouldPersistTaps: 'handled',
					scrollEnabled: false,
				}}
			>
				<Text>Body</Text>
			</Screen>,
		);

		const scrollView = UNSAFE_getByType(ScrollView);

		expect(scrollView.props.testID).toBe('screen-scroll');
		expect(scrollView.props.keyboardShouldPersistTaps).toBe('handled');
		expect(scrollView.props.scrollEnabled).toBe(false);
	});
});
