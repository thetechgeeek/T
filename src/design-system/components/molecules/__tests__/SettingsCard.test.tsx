import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { SettingsCard } from '../SettingsCard';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('SettingsCard', () => {
	it('renders title and subtitle', () => {
		const { getByText } = renderWithTheme(<SettingsCard title="Title" subtitle="Subtitle" />);
		expect(getByText('Title')).toBeTruthy();
		expect(getByText('Subtitle')).toBeTruthy();
	});

	it('calls onPress when tappable', () => {
		const onPress = jest.fn();
		const { getByTestId } = renderWithTheme(
			<SettingsCard title="Title" onPress={onPress} testID="settings-card" />,
		);
		fireEvent.press(getByTestId('settings-card'));
		expect(onPress).toHaveBeenCalledTimes(1);
	});
});
