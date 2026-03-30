import React from 'react';
import { render, type RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '../../src/theme/ThemeProvider';

function AllProviders({ children }: { children: React.ReactNode }) {
	return <ThemeProvider>{children}</ThemeProvider>;
}

/**
 * Renders a component wrapped in all required providers (ThemeProvider).
 * Returns the full @testing-library/react-native query API.
 *
 * Replaces the duplicated renderWithTheme helpers defined locally in each UI test file.
 *
 * Usage:
 *   const { getByText } = renderWithTheme(<MyComponent />);
 */
export function renderWithTheme(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
	return render(ui, { wrapper: AllProviders, ...options });
}
