import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import {
	AccessibilityInfo,
	Appearance,
	Dimensions,
	I18nManager,
	PixelRatio,
	Text,
} from 'react-native';
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
		jest.spyOn(Dimensions, 'get').mockReturnValue({
			width: 390,
			height: 844,
			scale: 3,
			fontScale: 1,
		} as ReturnType<typeof Dimensions.get>);
		jest.spyOn(Dimensions, 'addEventListener').mockImplementation((() => ({
			remove: jest.fn(),
		})) as unknown as typeof Dimensions.addEventListener);
		jest.spyOn(PixelRatio, 'get').mockReturnValue(2);
		jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1);
		jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
		jest.spyOn(AccessibilityInfo, 'isBoldTextEnabled').mockResolvedValue(false);
		jest.spyOn(AccessibilityInfo, 'isHighTextContrastEnabled').mockResolvedValue(false);
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

	it('lets nested providers with explicit defaults update their own theme locally', () => {
		const { result } = renderHook(() => useTheme(), {
			wrapper: ({ children }) => (
				<ThemeProvider initialMode="light" initialPresetId="baseline" persist={false}>
					<ThemeProvider initialMode="light" initialPresetId="mono" persist={false}>
						{children}
					</ThemeProvider>
				</ThemeProvider>
			),
		});

		expect(result.current.presetId).toBe('mono');
		expect(result.current.mode).toBe('light');

		act(() => {
			result.current.setThemePreset('studio');
			result.current.setThemeMode('dark');
		});

		expect(result.current.presetId).toBe('studio');
		expect(result.current.mode).toBe('dark');
		expect(result.current.theme.meta.presetLabel).toBe('Studio');
	});

	it('exposes runtime accessibility and locale quality signals from the root provider', async () => {
		jest.spyOn(PixelRatio, 'get').mockReturnValue(3);
		jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1.8);
		jest.spyOn(Dimensions, 'get').mockReturnValue({
			width: 1024,
			height: 768,
			scale: 2,
			fontScale: 1,
		} as ReturnType<typeof Dimensions.get>);
		jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
		jest.spyOn(AccessibilityInfo, 'isBoldTextEnabled').mockResolvedValue(true);
		jest.spyOn(AccessibilityInfo, 'isHighTextContrastEnabled').mockResolvedValue(true);
		(I18nManager as typeof I18nManager).isRTL = true;

		const { result } = renderHook(() => useTheme(), { wrapper: rootWrapper });

		await waitFor(() => {
			expect(result.current.runtime.reduceMotionEnabled).toBe(true);
			expect(result.current.runtime.boldTextEnabled).toBe(true);
			expect(result.current.runtime.highTextContrastEnabled).toBe(true);
		});
		expect(result.current.runtime.pixelRatio).toBe(3);
		expect(result.current.runtime.fontScale).toBe(1.8);
		expect(result.current.runtime.runtimeRtl).toBe(true);
		expect(result.current.runtime.detectedLocale.length).toBeGreaterThan(0);
		expect(result.current.runtime.deviceType).toBe('tablet');
		expect(result.current.runtime.breakpoint).toBe('tablet');
		expect(result.current.runtime.orientation).toBe('landscape');
		expect(result.current.runtime.supportsSplitPane).toBe(true);
		expect(result.current.runtime.columns).toBe(2);
		expect(result.current.runtime.windowWidth).toBe(1024);
		expect(result.current.runtime.windowHeight).toBe(768);
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
						windowWidth: 1180,
						windowHeight: 820,
						breakpoint: 'wide',
						deviceType: 'tablet',
						orientation: 'landscape',
						columns: 3,
						supportsSplitPane: true,
						layoutScale: 1.12,
						spacingScale: 1.12,
						typographyScale: 1.08,
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
		expect(result.current.runtime.breakpoint).toBe('wide');
		expect(result.current.runtime.columns).toBe(3);
	});

	it('switches the active theme into high contrast when Android high text contrast is enabled', async () => {
		jest.spyOn(AccessibilityInfo, 'isHighTextContrastEnabled').mockResolvedValue(true);

		const { result } = renderHook(() => useTheme(), { wrapper: rootWrapper });

		await waitFor(() => {
			expect(result.current.runtime.highTextContrastEnabled).toBe(true);
			expect(result.current.theme.meta.contrastMode).toBe('high');
		});
	});

	it('updates runtime layout metrics when dimensions change', () => {
		let dimensionsListener:
			| ((event: { window: { width: number; height: number } }) => void)
			| undefined;

		jest.spyOn(Dimensions, 'addEventListener').mockImplementation(((
			_event: string,
			listener: (event: { window: { width: number; height: number } }) => void,
		) => {
			dimensionsListener = listener;
			return { remove: jest.fn() };
		}) as unknown as typeof Dimensions.addEventListener);

		const { result } = renderHook(() => useTheme(), { wrapper: rootWrapper });

		act(() => {
			dimensionsListener?.({
				window: { width: 844, height: 390 },
			});
		});

		expect(result.current.runtime.windowWidth).toBe(844);
		expect(result.current.runtime.windowHeight).toBe(390);
		expect(result.current.runtime.orientation).toBe('landscape');
		expect(result.current.runtime.breakpoint).toBe('tablet');
	});
});
