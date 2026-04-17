import React, { forwardRef } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { triggerDesignSystemHaptic } from '@/src/design-system/haptics';

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

export interface NumericStepperProps {
	label: string;
	value?: number;
	defaultValue?: number;
	onChange: (value: number) => void;
	onValueChange?: (value: number, meta?: { source: 'increment' | 'decrement' }) => void;
	min?: number;
	max?: number;
	step?: number;
	locale?: string;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export const NumericStepper = forwardRef<View, NumericStepperProps>(
	(
		{
			label,
			value,
			defaultValue = 0,
			onChange,
			onValueChange,
			min = 0,
			max = 999,
			step = 1,
			locale = 'en-US',
			testID,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const formatter = new Intl.NumberFormat(locale, {
			minimumFractionDigits: Number.isInteger(step) ? 0 : 1,
			maximumFractionDigits: Number.isInteger(step) ? 0 : 2,
		});
		const [currentValue, setCurrentValue] = useControllableState({
			value,
			defaultValue,
			onChange: (nextValue, meta) => {
				onChange(nextValue);
				onValueChange?.(nextValue, {
					source: meta?.source === 'decrement' ? 'decrement' : 'increment',
				});
			},
		});

		const nudge = (direction: 'increment' | 'decrement') => {
			const offset = direction === 'increment' ? step : -step;
			const nextValue = clamp(currentValue + offset, min, max);
			if (nextValue === currentValue) {
				return;
			}

			void triggerDesignSystemHaptic('selection');
			setCurrentValue(nextValue, { source: direction });
		};

		return (
			<View ref={ref} testID={testID} style={style}>
				<ThemedText
					variant="label"
					style={{ color: c.onSurfaceVariant, marginBottom: theme.spacing.xs }}
				>
					{label}
				</ThemedText>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						borderWidth: theme.borderWidth.sm,
						borderColor: c.border,
						borderRadius: theme.borderRadius.md,
						overflow: 'hidden',
					}}
				>
					<Pressable
						testID={`${testID ?? 'numeric-stepper'}-decrement`}
						onPress={() => nudge('decrement')}
						accessibilityRole="button"
						accessibilityLabel={`Decrease ${label}`}
						disabled={currentValue <= min}
						style={[
							styles.action,
							{ borderEndWidth: theme.borderWidth.sm, borderColor: c.border },
						]}
					>
						<ThemedText variant="bodyStrong" style={{ color: c.onSurface }}>
							−
						</ThemedText>
					</Pressable>
					<View style={styles.valueWrap}>
						<ThemedText variant="bodyStrong" style={{ color: c.onSurface }}>
							{formatter.format(currentValue)}
						</ThemedText>
					</View>
					<Pressable
						testID={`${testID ?? 'numeric-stepper'}-increment`}
						onPress={() => nudge('increment')}
						accessibilityRole="button"
						accessibilityLabel={`Increase ${label}`}
						disabled={currentValue >= max}
						style={[
							styles.action,
							{ borderStartWidth: theme.borderWidth.sm, borderColor: c.border },
						]}
					>
						<ThemedText variant="bodyStrong" style={{ color: c.onSurface }}>
							+
						</ThemedText>
					</Pressable>
				</View>
			</View>
		);
	},
);

NumericStepper.displayName = 'NumericStepper';

const styles = {
	action: {
		minHeight: 48,
		minWidth: 48,
		alignItems: 'center',
		justifyContent: 'center',
	},
	valueWrap: {
		flex: 1,
		minHeight: 48,
		alignItems: 'center',
		justifyContent: 'center',
	},
} as const;
