import { useTheme } from '../theme/ThemeProvider';
import { DEFAULT_RUNTIME_QUALITY_SIGNALS } from '@/src/design-system/runtimeSignals';

/**
 * Convenience hook that destructures the most commonly used theme tokens.
 * Avoids repeated `const { theme } = useTheme(); const { colors: c, spacing: s } = theme;` boilerplate.
 */
export function useThemeTokens() {
	const { theme, presetId, runtime } = useTheme();
	return {
		theme,
		runtime: runtime ?? DEFAULT_RUNTIME_QUALITY_SIGNALS,
		isDark: theme.isDark,
		presetId,
		meta: theme.meta,
		c: theme.colors,
		s: theme.spacing,
		sem: theme.semanticSpacing,
		densitySpacing: theme.densitySpacing,
		letters: theme.letterSpacing,
		r: theme.borderRadius,
		bw: theme.borderWidth,
		opacity: theme.opacity,
		typo: theme.typography,
		animation: theme.animation,
		components: theme.components,
		shadows: theme.shadows,
		elevation: theme.elevation,
	};
}
