import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import type { RuntimeQualitySignals } from '@/src/design-system/runtimeSignals';
import { useReducedMotion } from '../useReducedMotion';

function createWrapper(runtimeOverrides?: Partial<RuntimeQualitySignals>) {
	const RuntimeWrapper = ({ children }: { children: React.ReactNode }) => (
		<ThemeProvider persist={false} runtimeOverrides={runtimeOverrides}>
			{children}
		</ThemeProvider>
	);

	RuntimeWrapper.displayName = 'RuntimeWrapper';

	return RuntimeWrapper;
}

describe('useReducedMotion', () => {
	it('returns false by default', () => {
		const { result } = renderHook(() => useReducedMotion(), {
			wrapper: createWrapper(),
		});

		expect(result.current).toBe(false);
	});

	it('returns the runtime reduced-motion override when enabled', () => {
		const { result } = renderHook(() => useReducedMotion(), {
			wrapper: createWrapper({ reduceMotionEnabled: true }),
		});

		expect(result.current).toBe(true);
	});
});
