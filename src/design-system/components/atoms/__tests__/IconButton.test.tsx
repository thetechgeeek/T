import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { IconButton, FAB } from '../IconButton';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) =>
	render(
		<ThemeProvider initialMode="light" persist={false}>
			{component}
		</ThemeProvider>,
	);

describe('IconButton', () => {
	it('renders icon', () => {
		const { getByTestId } = renderWithTheme(
			<IconButton testID="btn" icon={<Text testID="icon">★</Text>} onPress={jest.fn()} />,
		);
		expect(getByTestId('icon')).toBeTruthy();
	});

	it('renders optional label', () => {
		const { getByText } = renderWithTheme(
			<IconButton icon={<Text>★</Text>} label="Share" onPress={jest.fn()} />,
		);
		expect(getByText('Share')).toBeTruthy();
	});

	it('calls onPress when pressed', () => {
		const onPress = jest.fn();
		const { getByTestId } = renderWithTheme(
			<IconButton testID="btn" icon={<Text>★</Text>} onPress={onPress} />,
		);
		fireEvent.press(getByTestId('btn'));
		expect(onPress).toHaveBeenCalledTimes(1);
	});

	it('does not call onPress when disabled', () => {
		const onPress = jest.fn();
		const { getByTestId } = renderWithTheme(
			<IconButton testID="btn" icon={<Text>★</Text>} onPress={onPress} disabled />,
		);
		fireEvent.press(getByTestId('btn'));
		expect(onPress).not.toHaveBeenCalled();
	});

	it('meets 48dp minimum touch target', () => {
		const { getByTestId } = renderWithTheme(
			<IconButton testID="btn" icon={<Text>★</Text>} onPress={jest.fn()} />,
		);
		const btn = getByTestId('btn');
		const style = Array.isArray(btn.props.style)
			? Object.assign({}, ...btn.props.style.filter(Boolean))
			: btn.props.style;
		expect(style.minWidth).toBeGreaterThanOrEqual(48);
		expect(style.minHeight).toBeGreaterThanOrEqual(48);
	});

	it('supports explicit accessibility labels for icon-only actions', () => {
		const { getByLabelText } = renderWithTheme(
			<IconButton
				icon={<Text>★</Text>}
				onPress={jest.fn()}
				accessibilityLabel="Open filters"
			/>,
		);

		expect(getByLabelText('Open filters')).toBeTruthy();
	});
});

describe('FAB', () => {
	it('renders and calls onPress', () => {
		const onPress = jest.fn();
		const { getByTestId } = renderWithTheme(<FAB testID="fab" onPress={onPress} />);
		fireEvent.press(getByTestId('fab'));
		expect(onPress).toHaveBeenCalledTimes(1);
	});

	it('has 56dp size', () => {
		const { getByTestId } = renderWithTheme(<FAB testID="fab" onPress={jest.fn()} />);
		const fab = getByTestId('fab');
		const style = Array.isArray(fab.props.style)
			? Object.assign({}, ...fab.props.style.filter(Boolean))
			: fab.props.style;
		expect(style).toEqual(expect.objectContaining({ width: 56, height: 56 }));
	});
});
