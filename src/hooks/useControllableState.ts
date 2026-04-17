import { useState } from 'react';

type NextValue<T> = T | ((current: T) => T);

export interface ControllableStateChangeMeta {
	source?: string;
}

export interface UseControllableStateOptions<T> {
	value?: T;
	defaultValue: T;
	onChange?: (value: T, meta?: ControllableStateChangeMeta) => void;
}

export function useControllableState<T>({
	value,
	defaultValue,
	onChange,
}: UseControllableStateOptions<T>) {
	const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
	const isControlled = value !== undefined;
	const currentValue = isControlled ? value : uncontrolledValue;

	const setValue = (nextValue: NextValue<T>, meta?: ControllableStateChangeMeta) => {
		const resolvedValue =
			typeof nextValue === 'function'
				? (nextValue as (current: T) => T)(currentValue)
				: nextValue;

		if (!isControlled) {
			setUncontrolledValue(resolvedValue);
		}

		if (!Object.is(resolvedValue, currentValue)) {
			onChange?.(resolvedValue, meta);
		}
	};

	return [currentValue, setValue, isControlled] as const;
}
