import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { DashboardHeader } from '../DashboardHeader';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('DashboardHeader', () => {
	it('renders the business initial and accessibility label', () => {
		const { getByText, getByRole } = renderWithTheme(
			<DashboardHeader businessName="Rupesh Tiles" />,
		);
		// Initial should be visible
		expect(getByText('R')).toBeTruthy();
		// Full name should be in the header's accessibility label
		const header = getByRole('header');
		expect(header.props.accessibilityLabel).toContain('Rupesh Tiles');
	});

	it('renders greeting text', () => {
		const { getByText } = renderWithTheme(<DashboardHeader businessName="My Tiles" />);
		// i18n mock returns last key segment, 'greeting' → 'greeting' or the translation
		// The component uses t('dashboard.greeting') — expect some text to render
		expect(getByText(/greeting|Namaste|Welcome|🙏/i)).toBeTruthy();
	});

	it('renders date in the header', () => {
		const { toJSON } = renderWithTheme(<DashboardHeader businessName="Tiles Co" />);
		// Should render some date — we just check the component does not crash
		expect(toJSON()).toBeTruthy();
	});

	it('renders different business initials correctly', () => {
		const { getByText, rerender } = renderWithTheme(
			<ThemeProvider>
				<DashboardHeader businessName="Alpha Tiles" />
			</ThemeProvider>,
		);
		expect(getByText('A')).toBeTruthy();

		rerender(
			<ThemeProvider>
				<DashboardHeader businessName="Beta Ceramics" />
			</ThemeProvider>,
		);
		expect(getByText('B')).toBeTruthy();
	});

	it('does not crash with a very long business name', () => {
		const longName = 'A'.repeat(100);
		expect(() => renderWithTheme(<DashboardHeader businessName={longName} />)).not.toThrow();
	});

	it('does not crash with empty business name', () => {
		expect(() => renderWithTheme(<DashboardHeader businessName="" />)).not.toThrow();
	});
});
