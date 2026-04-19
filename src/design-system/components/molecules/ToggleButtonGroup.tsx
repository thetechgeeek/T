import React, { forwardRef } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

export interface ToggleButtonOption {
	label: string;
	value: string;
}

export interface ToggleButtonGroupProps {
	label?: string;
	options: ToggleButtonOption[];
	value?: string | string[];
	defaultValue?: string | string[];
	multiple?: boolean;
	onChange: (value: string | string[]) => void;
	onValueChange?: (value: string | string[], meta?: { source: 'selection' | 'toggle' }) => void;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

type PressableKeyEvent = {
	nativeEvent: {
		key: string;
	};
};

export const ToggleButtonGroup = forwardRef<View, ToggleButtonGroupProps>(
	(
		{
			label,
			options,
			value,
			defaultValue,
			multiple = false,
			onChange,
			onValueChange,
			testID,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [currentValue, setCurrentValue] = useControllableState({
			value,
			defaultValue: defaultValue ?? (multiple ? [] : (options[0]?.value ?? '')),
			onChange: (nextValue) => {
				onChange(nextValue);
				onValueChange?.(nextValue, { source: multiple ? 'toggle' : 'selection' });
			},
		});

		const isSelected = (optionValue: string) =>
			Array.isArray(currentValue)
				? currentValue.includes(optionValue)
				: currentValue === optionValue;
		const selectOptionAtIndex = (nextIndex: number) => {
			const nextOption = options[nextIndex];
			if (!nextOption) {
				return;
			}

			setCurrentValue(nextOption.value, { source: 'selection' });
		};
		const handleKeyPress = (key: string, optionIndex: number, optionValue: string) => {
			if (!multiple) {
				if (key === 'ArrowRight' || key === 'ArrowDown') {
					selectOptionAtIndex(Math.min(options.length - 1, optionIndex + 1));
					return;
				}
				if (key === 'ArrowLeft' || key === 'ArrowUp') {
					selectOptionAtIndex(Math.max(0, optionIndex - 1));
					return;
				}
				if (key === 'Home') {
					selectOptionAtIndex(0);
					return;
				}
				if (key === 'End') {
					selectOptionAtIndex(options.length - 1);
					return;
				}
			}

			if (key === 'Enter' || key === ' ') {
				if (multiple) {
					const values = Array.isArray(currentValue) ? currentValue : [];
					const nextValue = values.includes(optionValue)
						? values.filter((valueEntry) => valueEntry !== optionValue)
						: [...values, optionValue];
					setCurrentValue(nextValue, { source: 'toggle' });
					return;
				}

				setCurrentValue(optionValue, { source: 'selection' });
			}
		};

		return (
			<View ref={ref} testID={testID} style={style}>
				{label ? (
					<ThemedText
						variant="label"
						style={{ color: c.onSurfaceVariant, marginBottom: theme.spacing.xs }}
					>
						{label}
					</ThemedText>
				) : null}
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
					{options.map((option) => {
						const optionIndex = options.findIndex(
							(entry) => entry.value === option.value,
						);
						const selected = isSelected(option.value);
						const keyboardProps = {
							onKeyPress: (event: PressableKeyEvent) =>
								handleKeyPress(event.nativeEvent.key, optionIndex, option.value),
						} as unknown as React.ComponentProps<typeof Pressable>;
						return (
							<Pressable
								{...keyboardProps}
								key={option.value}
								testID={`${testID ?? 'toggle-group'}-${option.value}`}
								onPress={() => {
									if (multiple) {
										const values = Array.isArray(currentValue)
											? currentValue
											: [];
										const nextValue = values.includes(option.value)
											? values.filter(
													(valueEntry) => valueEntry !== option.value,
												)
											: [...values, option.value];
										setCurrentValue(nextValue, { source: 'toggle' });
										return;
									}

									setCurrentValue(option.value, { source: 'selection' });
								}}
								focusable
								accessibilityRole="button"
								accessibilityLabel={option.label}
								accessibilityState={{ selected }}
								style={{
									minHeight: theme.touchTarget,
									paddingHorizontal: theme.spacing.md,
									paddingVertical: theme.spacing.sm,
									borderRadius: theme.borderRadius.md,
									borderWidth: theme.borderWidth.sm,
									borderColor: selected ? c.primary : c.border,
									backgroundColor: selected
										? c.primary
										: theme.visual.surfaces.default,
									justifyContent: 'center',
								}}
							>
								<ThemedText
									variant="bodyStrong"
									style={{ color: selected ? c.onPrimary : c.onSurface }}
								>
									{option.label}
								</ThemedText>
							</Pressable>
						);
					})}
				</View>
			</View>
		);
	},
);

ToggleButtonGroup.displayName = 'ToggleButtonGroup';
