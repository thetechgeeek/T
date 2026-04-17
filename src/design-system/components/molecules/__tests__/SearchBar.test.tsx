import React from 'react';
import { Pressable } from 'react-native';
import { act, fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	it('renders with placeholder text', () => {
		const { getByPlaceholderText } = renderWithTheme(
			<SearchBar placeholder="Search patterns..." value="" onChangeText={jest.fn()} />,
		);
		expect(getByPlaceholderText('Search patterns...')).toBeTruthy();
	});

	it('calls onChangeText with typed value', () => {
		const onChangeText = jest.fn();
		const { getByPlaceholderText } = renderWithTheme(
			<SearchBar placeholder="Search patterns..." value="" onChangeText={onChangeText} />,
		);
		fireEvent.changeText(getByPlaceholderText('Search patterns...'), 'marble');
		expect(onChangeText).toHaveBeenCalledWith('marble');
	});

	it('forwards accessibility metadata without product-specific defaults', () => {
		const { getByLabelText } = renderWithTheme(
			<SearchBar
				value=""
				onChangeText={jest.fn()}
				accessibilityLabel="Pattern search"
				accessibilityHint="Filters the workbench registry"
			/>,
		);

		expect(getByLabelText('Pattern search')).toBeTruthy();
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
			<SearchBar
				value="marble"
				onChangeText={onChangeText}
				clearAccessibilityLabel="Clear registry search"
			/>,
		);
		const clearButton = UNSAFE_getAllByType(Pressable)[0];
		fireEvent.press(clearButton);
		expect(onChangeText).toHaveBeenCalledWith('');
	});

	it('shows a loading indicator when search work is pending', () => {
		const { getByLabelText, UNSAFE_queryAllByType } = renderWithTheme(
			<SearchBar value="marble" onChangeText={jest.fn()} loading />,
		);

		expect(getByLabelText('Search loading')).toBeTruthy();
		expect(UNSAFE_queryAllByType(Pressable)).toHaveLength(0);
	});

	it('supports debounced search callbacks', () => {
		const onDebouncedChange = jest.fn();
		const { getByPlaceholderText } = renderWithTheme(
			<SearchBar
				placeholder="Search patterns..."
				defaultValue=""
				onChangeText={jest.fn()}
				onDebouncedChange={onDebouncedChange}
				debounceMs={250}
			/>,
		);

		fireEvent.changeText(getByPlaceholderText('Search patterns...'), 'marble');
		expect(onDebouncedChange).not.toHaveBeenCalled();

		act(() => {
			jest.advanceTimersByTime(250);
		});

		expect(onDebouncedChange).toHaveBeenCalledWith('marble');
	});
});
