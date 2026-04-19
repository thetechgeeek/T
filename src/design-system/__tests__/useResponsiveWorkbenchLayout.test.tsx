import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { Dimensions, LayoutAnimation, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import {
	responsiveCardStyle,
	stackOnPhoneRowStyle,
	useResponsiveWorkbenchLayout,
} from '../useResponsiveWorkbenchLayout';

const mockUseWindowDimensions = useWindowDimensions as jest.MockedFunction<
	typeof useWindowDimensions
>;
const mockUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<typeof useSafeAreaInsets>;

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<ThemeProvider persist={false}>{children}</ThemeProvider>
);

describe('useResponsiveWorkbenchLayout', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUseWindowDimensions.mockReturnValue({
			width: 390,
			height: 844,
			fontScale: 1,
			scale: 3,
		});
		mockUseSafeAreaInsets.mockReturnValue({ top: 44, right: 0, bottom: 34, left: 0 });
		jest.spyOn(Dimensions, 'addEventListener').mockImplementation((() => ({
			remove: jest.fn(),
		})) as unknown as typeof Dimensions.addEventListener);
	});

	it('maps compact phone layouts to a single-column touch-first shell', () => {
		const { result } = renderHook(() => useResponsiveWorkbenchLayout(), { wrapper });

		expect(result.current.isPhone).toBe(true);
		expect(result.current.isCompactPhone).toBe(true);
		expect(result.current.isTablet).toBe(false);
		expect(result.current.columns).toBe(1);
		expect(result.current.supportsSplitPane).toBe(false);
		expect(result.current.safeAreaInsets.top).toBe(44);
		expect(result.current.orientation).toBe('portrait');
	});

	it('maps tablet layouts to multi-column split-pane behavior', () => {
		mockUseWindowDimensions.mockReturnValue({
			width: 1024,
			height: 768,
			fontScale: 1,
			scale: 2,
		});

		const { result } = renderHook(() => useResponsiveWorkbenchLayout(), { wrapper });

		expect(result.current.isCompactPhone).toBe(false);
		expect(result.current.isTablet).toBe(true);
		expect(result.current.columns).toBe(2);
		expect(result.current.supportsSplitPane).toBe(true);
		expect(result.current.orientation).toBe('landscape');
		expect(result.current.spacingScale).toBeGreaterThan(1);
		expect(result.current.typographyScale).toBeGreaterThan(1);
	});

	it('animates layout transitions when the dimensions listener reports a rotation', () => {
		const dimensionsListeners: Array<
			(event: { window: { width: number; height: number } }) => void
		> = [];

		jest.spyOn(Dimensions, 'addEventListener').mockImplementation(((
			_event: string,
			listener: (event: { window: { width: number; height: number } }) => void,
		) => {
			dimensionsListeners.push(listener);
			return { remove: jest.fn() };
		}) as unknown as typeof Dimensions.addEventListener);

		const configureNextSpy = jest.spyOn(LayoutAnimation, 'configureNext');
		const { result } = renderHook(() => useResponsiveWorkbenchLayout(), { wrapper });

		act(() => {
			dimensionsListeners.forEach((listener) =>
				listener({
					window: { width: 844, height: 390 },
				}),
			);
		});

		expect(configureNextSpy).toHaveBeenCalledWith(LayoutAnimation.Presets.easeInEaseOut);
		expect(result.current.orientationChangeCount).toBe(1);
	});
});

describe('responsive layout helpers', () => {
	it('collapses cards to full-width on phones and preserves min-width on larger layouts', () => {
		expect(responsiveCardStyle(true, 280)).toEqual(
			expect.objectContaining({ width: '100%', flexBasis: '100%' }),
		);
		expect(responsiveCardStyle(false, 280, { flex: 2 })).toEqual(
			expect.objectContaining({ flex: 2, minWidth: 280 }),
		);
	});

	it('stacks row layouts on phones and keeps wrapped rows on larger layouts', () => {
		expect(stackOnPhoneRowStyle(true, { gap: 12 })).toEqual(
			expect.objectContaining({ flexDirection: 'column', flexWrap: 'nowrap' }),
		);
		expect(
			stackOnPhoneRowStyle(false, {
				gap: 12,
				alignItems: 'center',
				justifyContent: 'space-between',
			}),
		).toEqual(
			expect.objectContaining({
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				flexWrap: 'wrap',
			}),
		);
	});
});
