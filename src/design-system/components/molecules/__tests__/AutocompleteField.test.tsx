import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { AutocompleteField } from '../AutocompleteField';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('AutocompleteField', () => {
	it('filters matching options', () => {
		const { getByTestId, getByText } = renderWithTheme(
			<AutocompleteField
				label="Owner"
				options={[
					{ label: 'Asha', value: 'asha' },
					{ label: 'Ben', value: 'ben' },
				]}
				onChange={jest.fn()}
				testID="autocomplete"
			/>,
		);
		fireEvent.changeText(
			getByTestId('autocomplete').parent?.findByType
				? getByTestId('autocomplete')
				: getByTestId('autocomplete-field'),
			'As',
		);
		expect(getByText('Asha')).toBeTruthy();
	});

	it('supports async search and inline create', async () => {
		jest.useFakeTimers();
		const onAsyncSearch = jest.fn().mockResolvedValue([{ label: 'Ben', value: 'ben' }]);
		const onChange = jest.fn();
		const { getByDisplayValue, getByTestId, getByText } = renderWithTheme(
			<AutocompleteField
				label="Owner"
				options={[]}
				allowCreate
				onAsyncSearch={onAsyncSearch}
				onChange={onChange}
				testID="autocomplete"
			/>,
		);
		fireEvent.changeText(getByDisplayValue(''), 'New owner');
		await act(async () => {
			jest.advanceTimersByTime(300);
		});
		await waitFor(() => expect(onAsyncSearch).toHaveBeenCalled());
		fireEvent.press(getByTestId('autocomplete-create'));
		expect(onChange).toHaveBeenCalled();
		jest.useRealTimers();
	});
});
