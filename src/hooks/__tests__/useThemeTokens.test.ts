import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { useThemeTokens } from '../useThemeTokens';

const wrapper = ({ children }: { children: React.ReactNode }) =>
	React.createElement(ThemeProvider, null, children);

describe('useThemeTokens', () => {
	it('returns theme object', () => {
		const { result } = renderHook(() => useThemeTokens(), { wrapper });
		expect(result.current.theme).toBeDefined();
	});

	it('returns isDark boolean', () => {
		const { result } = renderHook(() => useThemeTokens(), { wrapper });
		expect(typeof result.current.isDark).toBe('boolean');
	});

	it('returns colors shorthand as c', () => {
		const { result } = renderHook(() => useThemeTokens(), { wrapper });
		expect(result.current.c).toBeDefined();
		expect(result.current.c.primary).toBeDefined();
		expect(result.current.c.background).toBeDefined();
	});

	it('returns spacing shorthand as s', () => {
		const { result } = renderHook(() => useThemeTokens(), { wrapper });
		expect(result.current.s).toBeDefined();
		expect(typeof result.current.s.md).toBe('number');
		expect(result.current.s.md).toBeGreaterThan(0);
	});

	it('returns borderRadius shorthand as r', () => {
		const { result } = renderHook(() => useThemeTokens(), { wrapper });
		expect(result.current.r).toBeDefined();
		expect(typeof result.current.r.md).toBe('number');
	});

	it('returns typography shorthand as typo', () => {
		const { result } = renderHook(() => useThemeTokens(), { wrapper });
		expect(result.current.typo).toBeDefined();
		expect(result.current.typo.variants).toBeDefined();
		expect(result.current.typo.weights).toBeDefined();
	});

	it('returns shadows shorthand', () => {
		const { result } = renderHook(() => useThemeTokens(), { wrapper });
		expect(result.current.shadows).toBeDefined();
	});

	it('spacing values are ordered correctly (sm < md < lg)', () => {
		const { result } = renderHook(() => useThemeTokens(), { wrapper });
		const { sm, md, lg } = result.current.s;
		expect(sm).toBeLessThan(md);
		expect(md).toBeLessThan(lg);
	});

	it('isDark is false in light mode (system default in tests)', () => {
		const { result } = renderHook(() => useThemeTokens(), { wrapper });
		// jest.setup.ts mocks Appearance.getColorScheme to return 'light'
		expect(result.current.isDark).toBe(false);
	});

	it('theme and c.primary are the same reference (no redundant object creation)', () => {
		const { result } = renderHook(() => useThemeTokens(), { wrapper });
		expect(result.current.c).toBe(result.current.theme.colors);
	});
});
