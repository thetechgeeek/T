import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	useRuntimeQualitySignals,
	type RuntimeQualitySignals,
} from '@/src/design-system/runtimeSignals';
import type { Theme, ThemeMode, ThemePresetId } from './index';
import { buildTheme, DEFAULT_THEME_PRESET_ID, themePresetOptions } from './colors';

export const THEME_STORAGE_KEY = '@ui/theme-settings';
export const LEGACY_THEME_SETTINGS_STORAGE_KEY = '@tilemaster/theme-settings';
export const LEGACY_THEME_STORAGE_KEY = '@tilemaster/theme';

interface PersistedThemeSettings {
	mode: ThemeMode;
	presetId: ThemePresetId;
}

interface ThemeContextValue {
	theme: Theme;
	isDark: boolean;
	mode: ThemeMode;
	presetId: ThemePresetId;
	runtime: RuntimeQualitySignals;
	availablePresets: typeof themePresetOptions;
	setThemeMode: (mode: ThemeMode) => void;
	setThemePreset: (presetId: ThemePresetId) => void;
	cycleThemePreset: () => void;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
	children: React.ReactNode;
	initialMode?: ThemeMode;
	initialPresetId?: ThemePresetId;
	persist?: boolean;
	storageKey?: string | null;
	runtimeOverrides?: Partial<RuntimeQualitySignals>;
}

function isValidThemeMode(value: unknown): value is ThemeMode {
	return value === 'light' || value === 'dark' || value === 'system';
}

function normalizeThemePresetId(value: unknown): ThemePresetId | null {
	if (value === 'tilemaster') {
		return DEFAULT_THEME_PRESET_ID;
	}

	return themePresetOptions.some((preset) => preset.presetId === value)
		? (value as ThemePresetId)
		: null;
}

function resolveIsDark(mode: ThemeMode, inheritedIsDark?: boolean) {
	if (mode === 'light') return false;
	if (mode === 'dark') return true;
	return inheritedIsDark ?? Appearance.getColorScheme() === 'dark';
}

export function ThemeProvider({
	children,
	initialMode,
	initialPresetId,
	persist,
	storageKey = THEME_STORAGE_KEY,
	runtimeOverrides,
}: ThemeProviderProps) {
	const parentThemeContext = useContext(ThemeContext);
	const ownedRuntime = useRuntimeQualitySignals(parentThemeContext == null);
	const inheritsParentMode = parentThemeContext != null && initialMode === undefined;
	const inheritsParentPreset = parentThemeContext != null && initialPresetId === undefined;
	const persistenceEnabled = persist ?? parentThemeContext == null;
	const shouldLoadPersistedSettings =
		persistenceEnabled &&
		parentThemeContext == null &&
		initialMode === undefined &&
		initialPresetId === undefined;
	const baseMode = initialMode ?? parentThemeContext?.mode ?? 'system';
	const basePresetId = initialPresetId ?? parentThemeContext?.presetId ?? DEFAULT_THEME_PRESET_ID;

	const [ownedMode, setOwnedMode] = useState<ThemeMode>(baseMode);
	const [systemIsDark, setSystemIsDark] = useState(
		resolveIsDark(baseMode, parentThemeContext?.isDark),
	);
	const [ownedPresetId, setOwnedPresetId] = useState<ThemePresetId>(basePresetId);
	const modeRef = useRef(baseMode);
	const presetIdRef = useRef(basePresetId);
	const resolvedMode =
		inheritsParentMode && parentThemeContext != null ? parentThemeContext.mode : ownedMode;
	const resolvedPresetId =
		inheritsParentPreset && parentThemeContext != null
			? parentThemeContext.presetId
			: ownedPresetId;
	const resolvedIsDark =
		resolvedMode === 'system'
			? (parentThemeContext?.isDark ?? systemIsDark)
			: resolveIsDark(resolvedMode, parentThemeContext?.isDark);
	const runtime = useMemo(
		() => ({
			...(parentThemeContext?.runtime ?? ownedRuntime),
			...runtimeOverrides,
		}),
		[parentThemeContext?.runtime, ownedRuntime, runtimeOverrides],
	);

	const persistThemeSettings = useCallback(
		(nextMode: ThemeMode, nextPresetId: ThemePresetId) => {
			if (!persistenceEnabled || !storageKey) {
				return;
			}
			const payload: PersistedThemeSettings = { mode: nextMode, presetId: nextPresetId };
			void AsyncStorage.setItem(storageKey, JSON.stringify(payload));
		},
		[persistenceEnabled, storageKey],
	);

	useEffect(() => {
		if (!shouldLoadPersistedSettings || !storageKey) {
			return;
		}

		let isActive = true;

		Promise.all([
			AsyncStorage.getItem(storageKey),
			AsyncStorage.getItem(LEGACY_THEME_SETTINGS_STORAGE_KEY),
			AsyncStorage.getItem(LEGACY_THEME_STORAGE_KEY),
		]).then(([saved, legacySaved, legacyMode]) => {
			if (!isActive) {
				return;
			}

			const persistedPayload = saved ?? legacySaved;
			if (persistedPayload) {
				try {
					const parsed = JSON.parse(
						persistedPayload,
					) as Partial<PersistedThemeSettings> & {
						presetId?: unknown;
					};
					const normalizedPresetId = normalizeThemePresetId(parsed.presetId);
					if (isValidThemeMode(parsed.mode) && normalizedPresetId) {
						setOwnedMode(parsed.mode);
						setOwnedPresetId(normalizedPresetId);
						setSystemIsDark(resolveIsDark(parsed.mode));
						return;
					}
				} catch {
					// Fall through to the legacy key or current defaults.
				}
			}

			if (isValidThemeMode(legacyMode)) {
				setOwnedMode(legacyMode);
				setSystemIsDark(resolveIsDark(legacyMode));
			}
		});

		return () => {
			isActive = false;
		};
	}, [shouldLoadPersistedSettings, storageKey]);

	useEffect(() => {
		modeRef.current = resolvedMode;
		presetIdRef.current = resolvedPresetId;
	}, [resolvedMode, resolvedPresetId]);

	useEffect(() => {
		if (resolvedMode !== 'system' || parentThemeContext != null) return;
		const sub = Appearance.addChangeListener(({ colorScheme }) => {
			setSystemIsDark(colorScheme === 'dark');
		});
		return () => sub.remove();
	}, [parentThemeContext, resolvedMode]);

	const setThemeMode = useCallback(
		(newMode: ThemeMode) => {
			if (inheritsParentMode && parentThemeContext != null) {
				parentThemeContext.setThemeMode(newMode);
				return;
			}

			setOwnedMode(newMode);
			modeRef.current = newMode;
			setSystemIsDark(resolveIsDark(newMode, parentThemeContext?.isDark));
			persistThemeSettings(newMode, presetIdRef.current);
		},
		[inheritsParentMode, parentThemeContext, persistThemeSettings],
	);

	const setThemePreset = useCallback(
		(nextPresetId: ThemePresetId) => {
			if (inheritsParentPreset && parentThemeContext != null) {
				parentThemeContext.setThemePreset(nextPresetId);
				return;
			}

			setOwnedPresetId(nextPresetId);
			presetIdRef.current = nextPresetId;
			persistThemeSettings(modeRef.current, nextPresetId);
		},
		[inheritsParentPreset, parentThemeContext, persistThemeSettings],
	);

	const cycleThemePreset = useCallback(() => {
		if (inheritsParentPreset && parentThemeContext != null) {
			parentThemeContext.cycleThemePreset();
			return;
		}

		const nextIndex =
			(themePresetOptions.findIndex((preset) => preset.presetId === presetIdRef.current) +
				1) %
			themePresetOptions.length;
		const nextPresetId = themePresetOptions[nextIndex]?.presetId ?? DEFAULT_THEME_PRESET_ID;
		setOwnedPresetId(nextPresetId);
		presetIdRef.current = nextPresetId;
		persistThemeSettings(modeRef.current, nextPresetId);
	}, [inheritsParentPreset, parentThemeContext, persistThemeSettings]);

	const toggleTheme = useCallback(() => {
		setThemeMode(resolvedIsDark ? 'light' : 'dark');
	}, [resolvedIsDark, setThemeMode]);

	const theme = useMemo(
		() =>
			buildTheme(resolvedIsDark, resolvedPresetId, {
				pixelRatio: runtime.pixelRatio,
				detectedLocale: runtime.detectedLocale,
				viewportWidth: runtime.windowWidth,
				viewportHeight: runtime.windowHeight,
			}),
		[
			resolvedIsDark,
			resolvedPresetId,
			runtime.detectedLocale,
			runtime.pixelRatio,
			runtime.windowHeight,
			runtime.windowWidth,
		],
	);

	return (
		<ThemeContext.Provider
			value={{
				theme,
				isDark: resolvedIsDark,
				mode: resolvedMode,
				presetId: resolvedPresetId,
				runtime,
				availablePresets: themePresetOptions,
				setThemeMode,
				setThemePreset,
				cycleThemePreset,
				toggleTheme,
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
	return ctx;
}
