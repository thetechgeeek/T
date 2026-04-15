import type React from 'react';
import { AccessibilityInfo, I18nManager, PixelRatio } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useDesignSystemQualitySignals } from '../useQualitySignals';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<ThemeProvider persist={false}>{children}</ThemeProvider>
);

describe('design-system quality signals', () => {
	beforeEach(() => {
		jest.restoreAllMocks();
		(I18nManager as typeof I18nManager).isRTL = false;
	});

	it('reads runtime locale, font scale, and accessibility preferences', async () => {
		jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1.8);
		jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
		jest.spyOn(AccessibilityInfo, 'isBoldTextEnabled').mockResolvedValue(true);
		jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((() => ({
			remove: jest.fn(),
		})) as unknown as typeof AccessibilityInfo.addEventListener);

		const { result } = renderHook(() => useDesignSystemQualitySignals('ar'), { wrapper });

		await waitFor(() => {
			expect(result.current.reduceMotionEnabled).toBe(true);
			expect(result.current.boldTextEnabled).toBe(true);
		});
		expect(result.current.intlLocale).toBe('ar-SA');
		expect(result.current.direction).toBe('rtl');
		expect(result.current.runtimeRtl).toBe(true);
		expect(result.current.fontScale).toBe(1.8);
		expect(result.current.detectedLocale.length).toBeGreaterThan(0);
	});

	it('reacts to accessibility listener updates', async () => {
		const listeners = new Map<string, (value: boolean) => void>();

		jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
		jest.spyOn(AccessibilityInfo, 'isBoldTextEnabled').mockResolvedValue(false);
		jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(((
			event: string,
			listener: unknown,
		) => {
			listeners.set(event, listener as (value: boolean) => void);
			return { remove: jest.fn() };
		}) as unknown as typeof AccessibilityInfo.addEventListener);

		const { result } = renderHook(() => useDesignSystemQualitySignals('en'), { wrapper });

		await waitFor(() => {
			expect(result.current.reduceMotionEnabled).toBe(false);
			expect(result.current.boldTextEnabled).toBe(false);
		});

		act(() => {
			listeners.get('reduceMotionChanged')?.(true);
			listeners.get('boldTextChanged')?.(true);
		});

		expect(result.current.reduceMotionEnabled).toBe(true);
		expect(result.current.boldTextEnabled).toBe(true);
	});
});
