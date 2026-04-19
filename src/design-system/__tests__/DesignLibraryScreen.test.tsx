import React from 'react';
import { act } from '@testing-library/react-native';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import DesignLibraryScreen from '../DesignLibraryScreen';
import { DESIGN_LIBRARY_OVERVIEW } from '../catalog';
import { getDesignSystemCopy } from '../copy';
import { setAccessibilityFocus } from '@/src/utils/accessibility';

jest.mock('@/src/utils/accessibility', () => {
	const actual = jest.requireActual('@/src/utils/accessibility');
	return {
		...actual,
		setAccessibilityFocus: jest.fn(),
	};
});

const mockSetAccessibilityFocus = jest.mocked(setAccessibilityFocus);

// The design library screen renders the full workbench matrix and needs CI-safe timing headroom.
jest.setTimeout(60000);

interface RendererNode {
	type: string;
	props: Record<string, unknown>;
	children: Array<RendererNode | string | null> | null;
}

function flattenRendererTree(node: RendererNode | RendererNode[] | string | null): RendererNode[] {
	if (node == null || typeof node === 'string') {
		return [];
	}

	if (Array.isArray(node)) {
		return node.flatMap((entry) => flattenRendererTree(entry));
	}

	const children = node.children ?? [];

	return [node, ...children.flatMap((child) => flattenRendererTree(child))];
}

function extractTextContent(node: RendererNode): string {
	return (node.children ?? [])
		.flatMap((child) => {
			if (typeof child === 'string') {
				return child;
			}

			return child ? extractTextContent(child) : '';
		})
		.join(' ')
		.trim();
}

function isSymbolOnlyLabel(textContent: string) {
	return /^[\s×+\-/.]*$/.test(textContent);
}

function isVirtualizedListHarnessTrigger(testId: unknown) {
	return (
		typeof testId === 'string' &&
		(testId.endsWith('-end-trigger') || testId.endsWith('-refresh-trigger'))
	);
}

describe('DesignLibraryScreen', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		mockSetAccessibilityFocus.mockClear();
	});

	afterEach(async () => {
		await act(async () => {
			jest.runOnlyPendingTimers();
			await Promise.resolve();
		});
		jest.useRealTimers();
	});

	it('renders the premium-quality workbench sections and generated counts', async () => {
		const { getByText, queryByText } = renderWithTheme(<DesignLibraryScreen />);
		await act(async () => {
			jest.runOnlyPendingTimers();
		});

		expect(getByText('Design System Workbench')).toBeTruthy();
		expect(getByText('Enterprise x Premium Quality Bar')).toBeTruthy();
		expect(getByText('Relaxed vs Operational Presentation')).toBeTruthy();
		expect(getByText('Forms & validation')).toBeTruthy();
		expect(getByText('State Proof Deck')).toBeTruthy();
		expect(getByText(String(DESIGN_LIBRARY_OVERVIEW.total))).toBeTruthy();
		expect(getByText(String(DESIGN_LIBRARY_OVERVIEW.commonMobile))).toBeTruthy();
		expect(getByText('Supported Component Catalog')).toBeTruthy();
		expect(getByText('Checklist Explorer')).toBeTruthy();
		expect(getByText(`All (${DESIGN_LIBRARY_OVERVIEW.total})`)).toBeTruthy();
		expect(queryByText('Example stories')).toBeNull();
		expect(queryByText('Prop table')).toBeNull();
	});

	it('shows a deferred placeholder until post-navigation work completes', async () => {
		const { getByTestId, queryByTestId, queryByText } = renderWithTheme(
			<DesignLibraryScreen />,
		);

		expect(getByTestId('design-library-deferred-placeholder')).toBeTruthy();
		expect(queryByText('Design System Workbench')).toBeTruthy();
		expect(queryByText('Enterprise x Premium Quality Bar')).toBeTruthy();
		expect(queryByText('Supported Component Catalog')).toBeNull();
		expect(queryByText('Checklist Explorer')).toBeNull();

		await act(async () => {
			jest.runOnlyPendingTimers();
			await Promise.resolve();
		});

		expect(queryByTestId('design-library-deferred-placeholder')).toBeNull();
		expect(queryByText('Supported Component Catalog')).toBeTruthy();
		expect(queryByText('Checklist Explorer')).toBeTruthy();
	});

	it('focuses the screen header for assistive tech and exposes a magic-tap shortcut', async () => {
		const copy = getDesignSystemCopy('en');
		const { getByLabelText } = renderWithTheme(<DesignLibraryScreen />);

		await act(async () => {
			await Promise.resolve();
		});
		act(() => {
			jest.runOnlyPendingTimers();
		});

		const screenShell = getByLabelText(copy.screen.accessibilityLabel);

		expect(mockSetAccessibilityFocus).toHaveBeenCalledTimes(1);
		expect(typeof screenShell.props.onMagicTap).toBe('function');
	});

	it('keeps non-text interactive affordances explicitly labeled', async () => {
		const { toJSON } = renderWithTheme(<DesignLibraryScreen />);

		await act(async () => {
			jest.runOnlyPendingTimers();
			await Promise.resolve();
		});

		const unlabeledNonTextNodes = flattenRendererTree(
			toJSON() as RendererNode | RendererNode[] | null,
		).filter((node) => {
			if (node.props.accessible === false) {
				return false;
			}

			if (node.props.importantForAccessibility === 'no-hide-descendants') {
				return false;
			}

			if (isVirtualizedListHarnessTrigger(node.props.testID)) {
				return false;
			}

			const isInteractive =
				node.type === 'Pressable' ||
				node.props.accessibilityRole === 'button' ||
				node.props.accessibilityRole === 'adjustable' ||
				typeof node.props.onPress === 'function';

			if (!isInteractive || node.props.accessibilityLabel) {
				return false;
			}

			const textContent = extractTextContent(node);
			return textContent.length === 0 || isSymbolOnlyLabel(textContent);
		});

		expect(unlabeledNonTextNodes).toEqual([]);
	});
});
