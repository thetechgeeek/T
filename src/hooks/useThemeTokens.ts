import { useTheme } from '../theme/ThemeProvider';

/**
 * Convenience hook that destructures the most commonly used theme tokens.
 * Avoids repeated `const { theme } = useTheme(); const { colors: c, spacing: s } = theme;` boilerplate.
 */
export function useThemeTokens() {
	const { theme } = useTheme();
	return {
		theme,
		isDark: theme.isDark,
		c: theme.colors,
		s: theme.spacing,
		r: theme.borderRadius,
		typo: theme.typography,
		shadows: theme.shadows,
	};
}
