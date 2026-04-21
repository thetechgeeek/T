import React from 'react';
import { Text } from 'react-native';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';
import { ShellLayoutScaffold } from '../ShellLayoutScaffold';

describe('ShellLayoutScaffold', () => {
	it('keeps aside content below the main column for single-pane shells', () => {
		const { getByTestId } = renderWithTheme(
			<ShellLayoutScaffold title="Inventory" aside={<Text>Aside content</Text>}>
				<Text>Main content</Text>
			</ShellLayoutScaffold>,
			{
				shellEnvironment: {
					adaptiveRuntime: {
						layoutVariant: 'single-pane',
					},
				},
			},
		);

		expect(getByTestId('shell-layout-content')).toBeTruthy();
		expect(getByTestId('shell-layout-aside')).toBeTruthy();
	});

	it('switches to split-pane layout when the adaptive runtime requests it', () => {
		const { getByTestId } = renderWithTheme(
			<ShellLayoutScaffold title="Inventory" aside={<Text>Aside content</Text>}>
				<Text>Main content</Text>
			</ShellLayoutScaffold>,
			{
				shellEnvironment: {
					adaptiveRuntime: {
						layoutVariant: 'split-pane',
						widthClass: 'expanded',
						isTablet: true,
					},
				},
			},
		);

		expect(getByTestId('shell-layout-body').props.style).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					flexDirection: 'row',
				}),
			]),
		);
		expect(getByTestId('shell-layout-aside')).toBeTruthy();
	});
});
