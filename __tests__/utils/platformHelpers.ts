/**
 * Per-test helper for overriding Platform.OS (QA issue 3.5).
 *
 * Usage in a test file:
 *   import { setPlatformOS, resetPlatformOS } from '__tests__/utils/platformHelpers';
 *
 *   beforeEach(() => setPlatformOS('android'));
 *   afterEach(() => resetPlatformOS());
 */
import { Platform } from 'react-native';

const DEFAULT_OS = 'ios';

/**
 * Override Platform.OS for the current test.
 */
export function setPlatformOS(os: 'ios' | 'android' | 'web'): void {
	(Platform as any).OS = os;
}

/**
 * Reset Platform.OS back to the default ('ios').
 */
export function resetPlatformOS(): void {
	(Platform as any).OS = DEFAULT_OS;
}
