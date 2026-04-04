import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { Screen } from '../Screen';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Screen', () => {
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
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const { useSafeAreaInsets } = require('react-native-safe-area-context');
		useSafeAreaInsets.mockReturnValue({ top: 50, bottom: 30, left: 0, right: 0 });

		const { toJSON } = renderWithTheme(
			<Screen safeAreaEdges={['top', 'bottom']}>
				<Text>Safe</Text>
			</Screen>,
		);
		const json = toJSON() as any;
		// The Screen component returns View or KeyboardAvoidingView.
		// Both have the padding applied via style.
		const style = json.props.style;
		const flattened = Array.isArray(style) ? Object.assign({}, ...style) : style;

		expect(flattened.paddingTop).toBe(50);
		expect(flattened.paddingBottom).toBe(30);
	});

	it('respects empty safeAreaEdges', () => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const { useSafeAreaInsets } = require('react-native-safe-area-context');
		useSafeAreaInsets.mockReturnValue({ top: 50, bottom: 30, left: 0, right: 0 });

		const { toJSON } = renderWithTheme(
			<Screen safeAreaEdges={[]}>
				<Text>No Safe</Text>
			</Screen>,
		);
		const json = toJSON() as any;
		const style = json.props.style;
		const flattened = Array.isArray(style) ? Object.assign({}, ...style) : style;

		expect(flattened.paddingTop).toBe(0);
		expect(flattened.paddingBottom).toBe(0);
	});
});
