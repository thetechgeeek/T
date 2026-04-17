import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import type { RuntimeQualitySignals } from '@/src/design-system/runtimeSignals';
import * as layoutAnimationUtils from '@/src/utils/animateNextLayout';
import { CollapsibleSection } from '../CollapsibleSection';

const renderWithTheme = (
	component: React.ReactElement,
	runtimeOverrides?: Partial<RuntimeQualitySignals>,
) =>
	render(
		<ThemeProvider persist={false} runtimeOverrides={runtimeOverrides}>
			{component}
		</ThemeProvider>,
	);

describe('CollapsibleSection', () => {
	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it('starts collapsed by default', () => {
		const { queryByText, getByTestId } = renderWithTheme(
			<CollapsibleSection title="Advanced filters" testID="accordion-toggle">
				<Text>Collapsed content</Text>
			</CollapsibleSection>,
		);

		expect(queryByText('Collapsed content')).toBeNull();
		expect(getByTestId('accordion-toggle')).toHaveProp('accessibilityState', {
			expanded: false,
		});
	});

	it('supports a default expanded state', () => {
		const { getByText, getByTestId } = renderWithTheme(
			<CollapsibleSection
				title="Advanced filters"
				defaultExpanded
				testID="accordion-toggle"
				contentTestID="accordion-content"
			>
				<Text>Visible content</Text>
			</CollapsibleSection>,
		);

		expect(getByText('Visible content')).toBeTruthy();
		expect(getByTestId('accordion-toggle')).toHaveProp('accessibilityState', {
			expanded: true,
		});
		expect(getByTestId('accordion-content')).toBeTruthy();
	});

	it('animates the next layout change when motion is allowed', () => {
		const animateNextLayoutSpy = jest
			.spyOn(layoutAnimationUtils, 'animateNextLayout')
			.mockImplementation(jest.fn());
		const { getByTestId, getByText } = renderWithTheme(
			<CollapsibleSection title="Advanced filters" testID="accordion-toggle">
				<Text>Animated content</Text>
			</CollapsibleSection>,
		);

		fireEvent.press(getByTestId('accordion-toggle'));

		expect(animateNextLayoutSpy).toHaveBeenCalledWith({ disabled: false });
		expect(getByText('Animated content')).toBeTruthy();
		expect(getByTestId('accordion-toggle')).toHaveProp('accessibilityState', {
			expanded: true,
		});
	});

	it('skips layout animation when reduced motion is enabled', () => {
		const animateNextLayoutSpy = jest
			.spyOn(layoutAnimationUtils, 'animateNextLayout')
			.mockImplementation(jest.fn());
		const { getByTestId, getByText } = renderWithTheme(
			<CollapsibleSection title="Advanced filters" testID="accordion-toggle">
				<Text>Reduced motion content</Text>
			</CollapsibleSection>,
			{ reduceMotionEnabled: true },
		);

		fireEvent.press(getByTestId('accordion-toggle'));

		expect(animateNextLayoutSpy).toHaveBeenCalledWith({ disabled: true });
		expect(getByText('Reduced motion content')).toBeTruthy();
	});
});
