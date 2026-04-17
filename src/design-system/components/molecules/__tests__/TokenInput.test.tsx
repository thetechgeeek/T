import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { TokenInput } from '../TokenInput';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('TokenInput', () => {
	it('adds tags until the max is reached', () => {
		const onChange = jest.fn();
		const { getByTestId, getByText } = renderWithTheme(
			<TokenInput label="Tags" onChange={onChange} maxTags={1} testID="tokens" />,
		);
		fireEvent.changeText(getByTestId('tokens-field'), 'urgent');
		fireEvent.press(getByTestId('tokens-add'));
		expect(onChange).toHaveBeenCalledWith(['urgent']);
		expect(getByText('1/1 tags')).toBeTruthy();
	});

	it('removes tags through the swipe row action', () => {
		const onChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<TokenInput
				label="Tags"
				onChange={onChange}
				defaultValues={['urgent']}
				testID="tokens"
			/>,
		);
		fireEvent.press(getByTestId('swipeable-delete-btn'));
		expect(onChange).toHaveBeenCalledWith([]);
	});
});
