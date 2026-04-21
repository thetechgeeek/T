import React from 'react';
import { render, type RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '../../src/design-system/foundation';
import {
	ShellEnvironmentProvider,
	createShellEnvironment,
	type ShellEnvironment,
	type ShellEnvironmentInput,
} from '../../src/ui-shell';

type ThemeProviderProps = React.ComponentProps<typeof ThemeProvider>;

function AllProviders({
	children,
	shellEnvironment,
	themeProviderProps,
}: {
	children: React.ReactNode;
	shellEnvironment: ShellEnvironmentInput;
	themeProviderProps?: Partial<ThemeProviderProps>;
}) {
	return (
		<ThemeProvider {...themeProviderProps}>
			<ShellEnvironmentProvider value={shellEnvironment}>{children}</ShellEnvironmentProvider>
		</ThemeProvider>
	);
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
export function renderWithTheme(
	ui: React.ReactElement,
	options?: Omit<RenderOptions, 'wrapper'> & {
		shellEnvironment?: ShellEnvironmentInput;
		themeProviderProps?: Partial<ThemeProviderProps>;
	},
) {
	const shellEnvironment: ShellEnvironment = createShellEnvironment(options?.shellEnvironment);

	const {
		shellEnvironment: _shellEnvironment,
		themeProviderProps,
		...renderOptions
	} = options ?? {};

	return render(ui, {
		wrapper: ({ children }) => (
			<AllProviders
				shellEnvironment={shellEnvironment}
				themeProviderProps={themeProviderProps}
			>
				{children}
			</AllProviders>
		),
		...renderOptions,
	});
}
