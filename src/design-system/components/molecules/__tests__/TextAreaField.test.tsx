import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextAreaField } from '../TextAreaField';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { LINE_HEIGHT } from '@/src/theme/typographyMetrics';

const renderWithTheme = (component: React.ReactElement) =>
	render(
		<ThemeProvider initialMode="light" persist={false}>
			{component}
		</ThemeProvider>,
	);

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

	it('caps its height based on maxLines', () => {
		const { getByTestId } = renderWithTheme(
			<TextAreaField
				testID="textarea"
				label="Notes"
				value=""
				onChange={jest.fn()}
				maxLines={4}
			/>,
		);

		const textarea = getByTestId('textarea');
		const style = Array.isArray(textarea.props.style)
			? Object.assign({}, ...textarea.props.style.filter(Boolean))
			: textarea.props.style;

		expect(style.maxHeight).toBeGreaterThanOrEqual(4 * LINE_HEIGHT.body);
	});

	it('auto-resizes and renders helper copy', () => {
		const { getByTestId, getByText } = renderWithTheme(
			<TextAreaField
				testID="textarea"
				label="Notes"
				value="Hello"
				onChange={jest.fn()}
				helperText="Provide context"
			/>,
		);
		fireEvent(getByTestId('textarea'), 'contentSizeChange', {
			nativeEvent: { contentSize: { height: 120 } },
		});
		expect(getByText('Provide context')).toBeTruthy();
	});
});
