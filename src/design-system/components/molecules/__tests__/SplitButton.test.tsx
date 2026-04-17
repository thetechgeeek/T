import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { SplitButton } from '../SplitButton';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('SplitButton', () => {
	it('calls the primary action', () => {
		const onPress = jest.fn();
		const { getByText } = renderWithTheme(
			<SplitButton
				label="Save"
				onPress={onPress}
				secondaryActions={[{ label: 'Save as draft', value: 'draft' }]}
				onSecondaryAction={jest.fn()}
			/>,
		);
		fireEvent.press(getByText('Save'));
		expect(onPress).toHaveBeenCalledTimes(1);
	});

	it('opens the menu and triggers a secondary action', () => {
		const onSecondaryAction = jest.fn();
		const { getByTestId, getByText } = renderWithTheme(
			<SplitButton
				label="Save"
				onPress={jest.fn()}
				secondaryActions={[{ label: 'Save as draft', value: 'draft' }]}
				onSecondaryAction={onSecondaryAction}
				testID="split"
			/>,
		);
		fireEvent.press(getByTestId('split-toggle'));
		fireEvent.press(getByText('Save as draft'));
		expect(onSecondaryAction).toHaveBeenCalledWith('draft');
	});
});
