import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Theme, ThemeMode } from './index';
import { buildTheme } from './colors';

const STORAGE_KEY = '@tilemaster/theme';

interface ThemeContextValue {
	theme: Theme;
	isDark: boolean;
	mode: ThemeMode;
	setThemeMode: (mode: ThemeMode) => void;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [mode, setMode] = useState<ThemeMode>('system');
	const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');

	// Load persisted preference
	useEffect(() => {
		AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
			if (saved === 'light' || saved === 'dark' || saved === 'system') {
				setMode(saved);
				if (saved === 'light') setIsDark(false);
				else if (saved === 'dark') setIsDark(true);
				else setIsDark(Appearance.getColorScheme() === 'dark');
			}
		});
	}, []);

	// Listen for system theme changes when in 'system' mode
	useEffect(() => {
		if (mode !== 'system') return;
		const sub = Appearance.addChangeListener(({ colorScheme }) => {
			setIsDark(colorScheme === 'dark');
		});
		return () => sub.remove();
	}, [mode]);

	const setThemeMode = useCallback((newMode: ThemeMode) => {
		setMode(newMode);
		if (newMode === 'light') setIsDark(false);
		else if (newMode === 'dark') setIsDark(true);
		else setIsDark(Appearance.getColorScheme() === 'dark');
		AsyncStorage.setItem(STORAGE_KEY, newMode);
	}, []);

	const toggleTheme = useCallback(() => {
		setThemeMode(isDark ? 'light' : 'dark');
	}, [isDark, setThemeMode]);

	const theme = useMemo(() => buildTheme(isDark), [isDark]);

	return (
		<ThemeContext.Provider value={{ theme, isDark, mode, setThemeMode, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
	return ctx;
}
