import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextAreaField } from '../TextAreaField';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('TextAreaField', () => {
	it('renders the label', () => {
		const { getByText } = renderWithTheme(
			<TextAreaField label="Notes" value="" onChange={jest.fn()} />,
		);
		expect(getByText('Notes')).toBeTruthy();
	});

	it('calls onChange on text change', () => {
		const onChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<TextAreaField testID="textarea" label="Notes" value="" onChange={onChange} />,
		);
		fireEvent.changeText(getByTestId('textarea'), 'Hello world');
		expect(onChange).toHaveBeenCalledWith('Hello world');
	});

	it('shows character counter when maxLength provided', () => {
		const { getByText } = renderWithTheme(
			<TextAreaField
				testID="textarea"
				label="Notes"
				value="Hello"
				onChange={jest.fn()}
				maxLength={200}
			/>,
		);
		expect(getByText('5/200')).toBeTruthy();
	});

	it('is multiline', () => {
		const { getByTestId } = renderWithTheme(
			<TextAreaField testID="textarea" label="Notes" value="" onChange={jest.fn()} />,
		);
		expect(getByTestId('textarea')).toHaveProp('multiline', true);
	});
});
