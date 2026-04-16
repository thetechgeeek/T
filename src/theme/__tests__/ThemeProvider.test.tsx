import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AccessibilityInfo, Appearance, I18nManager, PixelRatio, Text } from 'react-native';
import {
	LEGACY_THEME_SETTINGS_STORAGE_KEY,
	LEGACY_THEME_STORAGE_KEY,
	THEME_STORAGE_KEY,
	ThemeProvider,
	useTheme,
} from '../ThemeProvider';

const asyncStorageMock = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const rootWrapper = ({ children }: { children: React.ReactNode }) => (
	<ThemeProvider>{children}</ThemeProvider>
);

function ThemeProbe({ label }: { label: string }) {
	const { mode, theme } = useTheme();

	return <Text>{`${label}:${theme.meta.presetLabel}:${mode}`}</Text>;
}

describe('ThemeProvider', () => {
	beforeEach(async () => {
		jest.restoreAllMocks();
		await AsyncStorage.clear();
		jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('light');
		jest.spyOn(PixelRatio, 'get').mockReturnValue(2);
		jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1);
		jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
		jest.spyOn(AccessibilityInfo, 'isBoldTextEnabled').mockResolvedValue(false);
		jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((() => ({
			remove: jest.fn(),
		})) as unknown as typeof AccessibilityInfo.addEventListener);
		(I18nManager as typeof I18nManager).isRTL = false;
	});

	it('loads persisted mode and preset settings', async () => {
		await AsyncStorage.setItem(
			THEME_STORAGE_KEY,
			JSON.stringify({ mode: 'dark', presetId: 'mono' }),
		);

		const { result } = renderHook(() => useTheme(), { wrapper: rootWrapper });

		await waitFor(() => {
			expect(result.current.mode).toBe('dark');
			expect(result.current.presetId).toBe('mono');
		});
		expect(result.current.isDark).toBe(true);
		expect(result.current.theme.meta.presetLabel).toBe('Mono');
	});

	it('falls back to the legacy mode key when structured settings do not exist', async () => {
		await AsyncStorage.setItem(LEGACY_THEME_STORAGE_KEY, 'dark');

		const { result } = renderHook(() => useTheme(), { wrapper: rootWrapper });

		await waitFor(() => {
			expect(result.current.mode).toBe('dark');
		});
		expect(result.current.isDark).toBe(true);
	});

	it('maps the legacy structured preset id onto the generic baseline preset', async () => {
		await AsyncStorage.setItem(
			LEGACY_THEME_SETTINGS_STORAGE_KEY,
			JSON.stringify({ mode: 'light', presetId: 'tilemaster' }),
		);

		const { result } = renderHook(() => useTheme(), { wrapper: rootWrapper });

		await waitFor(() => {
			expect(result.current.mode).toBe('light');
			expect(result.current.presetId).toBe('baseline');
		});
		expect(result.current.theme.meta.presetLabel).toBe('Baseline');
	});

	it('persists theme changes when mode and preset are updated', async () => {
		const { result } = renderHook(() => useTheme(), { wrapper: rootWrapper });

		act(() => {
			result.current.setThemePreset('studio');
			result.current.setThemeMode('dark');
		});

		await waitFor(() => {
			expect(asyncStorageMock.setItem).toHaveBeenLastCalledWith(
				THEME_STORAGE_KEY,
				JSON.stringify({ mode: 'dark', presetId: 'studio' }),
			);
		});
	});

	it('reacts to Appearance changes while running in system mode', () => {
		const remove = jest.fn();
		let appearanceListener:
			| ((event: { colorScheme: 'light' | 'dark' | null }) => void)
			| undefined;

		jest.spyOn(Appearance, 'addChangeListener').mockImplementation((listener) => {
			appearanceListener = listener;
			return { remove };
		});

		const { result, unmount } = renderHook(() => useTheme(), {
			wrapper: ({ children }) => (
				<ThemeProvider initialMode="system" persist={false}>
					{children}
				</ThemeProvider>
			),
		});

		act(() => {
			appearanceListener?.({ colorScheme: 'dark' });
		});

		expect(result.current.isDark).toBe(true);

		unmount();
		expect(remove).toHaveBeenCalled();
	});

	it('supports nested theme providers for subtree theming', () => {
		const { getByText } = render(
			<ThemeProvider initialMode="light" initialPresetId="baseline" persist={false}>
				<ThemeProbe label="outer" />
				<ThemeProvider initialPresetId="mono" persist={false}>
					<ThemeProbe label="inner" />
				</ThemeProvider>
			</ThemeProvider>,
		);

		expect(getByText('outer:Baseline:light')).toBeTruthy();
		expect(getByText('inner:Mono:light')).toBeTruthy();
	});

	it('exposes runtime accessibility and locale quality signals from the root provider', async () => {
		jest.spyOn(PixelRatio, 'get').mockReturnValue(3);
		jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1.8);
		jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
		jest.spyOn(AccessibilityInfo, 'isBoldTextEnabled').mockResolvedValue(true);
		(I18nManager as typeof I18nManager).isRTL = true;

		const { result } = renderHook(() => useTheme(), { wrapper: rootWrapper });

		await waitFor(() => {
			expect(result.current.runtime.reduceMotionEnabled).toBe(true);
			expect(result.current.runtime.boldTextEnabled).toBe(true);
		});
		expect(result.current.runtime.pixelRatio).toBe(3);
		expect(result.current.runtime.fontScale).toBe(1.8);
		expect(result.current.runtime.runtimeRtl).toBe(true);
		expect(result.current.runtime.detectedLocale.length).toBeGreaterThan(0);
	});

	it('supports runtime overrides for preview subtrees and tests', () => {
		const { result } = renderHook(() => useTheme(), {
			wrapper: ({ children }) => (
				<ThemeProvider
					persist={false}
					runtimeOverrides={{
						reduceMotionEnabled: true,
						boldTextEnabled: true,
						pixelRatio: 3,
						fontScale: 1.6,
						runtimeRtl: true,
					}}
				>
					{children}
				</ThemeProvider>
			),
		});

		expect(result.current.runtime.reduceMotionEnabled).toBe(true);
		expect(result.current.runtime.boldTextEnabled).toBe(true);
		expect(result.current.runtime.pixelRatio).toBe(3);
		expect(result.current.runtime.fontScale).toBe(1.6);
		expect(result.current.runtime.runtimeRtl).toBe(true);
	});
});
