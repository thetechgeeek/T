/**
 * Per-test helper for configuring useLocalSearchParams (QA issue 3.3).
 *
 * Usage in a test file:
 *   import { setMockSearchParams, resetMockSearchParams } from '__tests__/utils/mockSearchParams';
 *
 *   beforeEach(() => setMockSearchParams({ id: 'inv-uuid-001' }));
 *   afterEach(() => resetMockSearchParams());
 */
import { useLocalSearchParams } from 'expo-router';

/**
 * Set the params object that useLocalSearchParams will return for the current test.
 */
export function setMockSearchParams(params: Record<string, string>): void {
	(useLocalSearchParams as jest.Mock).mockReturnValue(params);
}

/**
 * Reset useLocalSearchParams to return {} (the default).
 */
export function resetMockSearchParams(): void {
	(useLocalSearchParams as jest.Mock).mockReturnValue({});
}
