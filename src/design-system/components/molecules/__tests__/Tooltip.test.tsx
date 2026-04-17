import React from 'react';
import { View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { Tooltip } from '../Tooltip';

function flattenStyle(style: unknown) {
	return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
}

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('Tooltip', () => {
	it('opens on long press by default', () => {
		const { getByLabelText, getByText } = renderWithTheme(
			<Tooltip triggerLabel="Show helper" content="Shared helper copy" trigger={<View />} />,
		);

		fireEvent(getByLabelText('Show helper'), 'longPress');

		expect(getByText('Shared helper copy')).toBeTruthy();
	});

	it('enforces the provided max width and dismisses on backdrop press', () => {
		const { getByLabelText, getByTestId, queryByText } = renderWithTheme(
			<Tooltip
				triggerLabel="Show helper"
				content="Shared helper copy"
				maxWidth={180}
				testID="tooltip-surface"
				trigger={<View />}
			/>,
		);

		fireEvent(getByLabelText('Show helper'), 'longPress');
		expect(flattenStyle(getByTestId('tooltip-surface').props.style)).toEqual(
			expect.objectContaining({ maxWidth: 180 }),
		);

		fireEvent.press(getByTestId('tooltip-surface-backdrop'));
		expect(queryByText('Shared helper copy')).toBeNull();
	});

	it('can open on standard press when configured', () => {
		const { getByLabelText, getByText } = renderWithTheme(
			<Tooltip
				triggerLabel="Show helper"
				content="Shared helper copy"
				triggerMode="press"
				trigger={<View />}
			/>,
		);

		fireEvent.press(getByLabelText('Show helper'));

		expect(getByText('Shared helper copy')).toBeTruthy();
	});
});
