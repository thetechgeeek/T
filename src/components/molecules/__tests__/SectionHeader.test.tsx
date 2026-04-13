import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { SectionHeader } from '../SectionHeader';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('SectionHeader', () => {
	it('renders title', () => {
		const { getByText } = renderWithTheme(<SectionHeader title="Title" />);
		expect(getByText('Title')).toBeTruthy();
	});

	it('renders subtitle when provided', () => {
		const { getByText } = renderWithTheme(<SectionHeader title="Title" subtitle="Subtitle" />);
		expect(getByText('Subtitle')).toBeTruthy();
	});

	it('renders actionLabel and calls onActionPress', () => {
		const onActionPress = jest.fn();
		const { getByText } = renderWithTheme(
			<SectionHeader title="Title" actionLabel="Action" onActionPress={onActionPress} />,
		);
		fireEvent.press(getByText('Action'));
		expect(onActionPress).toHaveBeenCalledTimes(1);
	});

	it('uppercase variant applies textTransform', () => {
		const { getByText } = renderWithTheme(<SectionHeader title="Upper" variant="uppercase" />);
		const node = getByText('Upper');
		expect(node.props.style).toEqual(
			expect.arrayContaining([expect.objectContaining({ textTransform: 'uppercase' })]),
		);
	});
});
