import { useEffect, useRef, useState } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
	const [debounced, setDebounced] = useState(value);
	const debouncedRef = useRef(debounced);

	useEffect(() => {
		debouncedRef.current = debounced;
	}, [debounced]);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (Object.is(debouncedRef.current, value)) {
				return;
			}
			debouncedRef.current = value;
			setDebounced(value);
		}, delay);
		return () => clearTimeout(timer);
	}, [value, delay]);
	return debounced;
}
