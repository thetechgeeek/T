import React from 'react';
import { Pressable } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../__tests__/utils/renderWithTheme';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
	it('renders with placeholder text', () => {
		const { getByPlaceholderText } = renderWithTheme(
			<SearchBar placeholder="Search invoices..." value="" onChangeText={jest.fn()} />,
		);
		expect(getByPlaceholderText('Search invoices...')).toBeTruthy();
	});

	it('calls onChangeText with typed value', () => {
		const onChangeText = jest.fn();
		const { getByPlaceholderText } = renderWithTheme(
			<SearchBar placeholder="Search invoices..." value="" onChangeText={onChangeText} />,
		);
		fireEvent.changeText(getByPlaceholderText('Search invoices...'), 'marble');
		expect(onChangeText).toHaveBeenCalledWith('marble');
	});

	it('clear button NOT visible when value is empty', () => {
		const { UNSAFE_queryAllByType } = renderWithTheme(
			<SearchBar value="" onChangeText={jest.fn()} />,
		);
		// When value is empty, the X Pressable is NOT rendered
		const pressables = UNSAFE_queryAllByType(Pressable);
		expect(pressables).toHaveLength(0);
	});

	it('clear button IS visible when value is non-empty', () => {
		const { UNSAFE_getAllByType } = renderWithTheme(
			<SearchBar value="marble" onChangeText={jest.fn()} />,
		);
		// When value is non-empty, the X Pressable IS rendered
		const pressables = UNSAFE_getAllByType(Pressable);
		expect(pressables.length).toBeGreaterThan(0);
	});

	it('pressing clear button calls onChangeText with empty string', () => {
		const onChangeText = jest.fn();
		const { UNSAFE_getAllByType } = renderWithTheme(
			<SearchBar value="marble" onChangeText={onChangeText} />,
		);
		const clearButton = UNSAFE_getAllByType(Pressable)[0];
		fireEvent.press(clearButton);
		expect(onChangeText).toHaveBeenCalledWith('');
	});
});
