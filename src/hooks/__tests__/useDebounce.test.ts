import { renderHook, act } from '@testing-library/react-native';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('returns the initial value immediately without advancing timers', () => {
		const { result } = renderHook(() => useDebounce('initial', 300));
		expect(result.current).toBe('initial');
	});

	it('does NOT update value before the delay has elapsed', () => {
		const { result, rerender } = renderHook(
			({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
			{ initialProps: { value: 'first', delay: 300 } },
		);

		rerender({ value: 'second', delay: 300 });

		act(() => {
			jest.advanceTimersByTime(299);
		});

		expect(result.current).toBe('first');
	});

	it('updates value after the delay has fully elapsed', () => {
		const { result, rerender } = renderHook(
			({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
			{ initialProps: { value: 'first', delay: 300 } },
		);

		rerender({ value: 'second', delay: 300 });

		act(() => {
			jest.advanceTimersByTime(300);
		});

		expect(result.current).toBe('second');
	});

	it('rapid updates — only the final value is applied after delay', () => {
		const { result, rerender } = renderHook(
			({ value }: { value: string }) => useDebounce(value, 300),
			{ initialProps: { value: 'initial' } },
		);

		// Advance past initial debounce so 'initial' is set
		act(() => {
			jest.advanceTimersByTime(300);
		});

		// Rapid updates
		rerender({ value: 'a' });
		rerender({ value: 'b' });
		rerender({ value: 'c' });

		// Not yet elapsed
		act(() => {
			jest.advanceTimersByTime(299);
		});
		expect(result.current).toBe('initial');

		// Fully elapsed — only 'c' should be applied
		act(() => {
			jest.advanceTimersByTime(1);
		});
		expect(result.current).toBe('c');
	});

	it('changing delay resets the timer — new delay applied from the change point', () => {
		const { result, rerender } = renderHook(
			({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
			{ initialProps: { value: 'initial', delay: 300 } },
		);

		// Set initial debounce
		act(() => {
			jest.advanceTimersByTime(300);
		});
		expect(result.current).toBe('initial');

		// Change value with delay=300
		rerender({ value: 'new', delay: 300 });

		// Advance only 200ms (not enough for delay=300)
		act(() => {
			jest.advanceTimersByTime(200);
		});

		// Now change delay to 500 (resets timer)
		rerender({ value: 'new', delay: 500 });

		// Advance 499ms from the delay change — still not enough
		act(() => {
			jest.advanceTimersByTime(499);
		});
		expect(result.current).toBe('initial');

		// Advance final 1ms (total 500ms from delay change) — now triggers
		act(() => {
			jest.advanceTimersByTime(1);
		});
		expect(result.current).toBe('new');
	});
});
