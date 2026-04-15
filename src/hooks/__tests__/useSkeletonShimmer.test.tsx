import React from 'react';
import { renderHook } from '@testing-library/react-native';
import * as Reanimated from 'react-native-reanimated';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import type { RuntimeQualitySignals } from '@/src/design-system/runtimeSignals';
import { useSkeletonShimmer } from '../useSkeletonShimmer';

function createWrapper(runtimeOverrides?: Partial<RuntimeQualitySignals>) {
	const RuntimeWrapper = ({ children }: { children: React.ReactNode }) => (
		<ThemeProvider persist={false} runtimeOverrides={runtimeOverrides}>
			{children}
		</ThemeProvider>
	);

	RuntimeWrapper.displayName = 'RuntimeWrapper';

	return RuntimeWrapper;
}

describe('useSkeletonShimmer', () => {
	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it('starts the shimmer loop when motion is allowed', () => {
		const repeatSpy = jest.spyOn(Reanimated, 'withRepeat');
		const timingSpy = jest.spyOn(Reanimated, 'withTiming');

		renderHook(() => useSkeletonShimmer(), {
			wrapper: createWrapper(),
		});

		expect(timingSpy).toHaveBeenCalled();
		expect(repeatSpy).toHaveBeenCalled();
	});

	it('keeps shimmer static when reduced motion is enabled', () => {
		const repeatSpy = jest.spyOn(Reanimated, 'withRepeat');
		const timingSpy = jest.spyOn(Reanimated, 'withTiming');

		const { result } = renderHook(() => useSkeletonShimmer(), {
			wrapper: createWrapper({ reduceMotionEnabled: true }),
		});

		expect(result.current.value).toBe(0);
		expect(timingSpy).not.toHaveBeenCalled();
		expect(repeatSpy).not.toHaveBeenCalled();
	});
});
