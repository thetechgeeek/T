import React, { forwardRef } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useTheme } from '@/src/theme/ThemeProvider';
import {
	DatePickerField,
	type DatePickerFieldProps,
} from '@/src/design-system/components/molecules/DatePickerField';
import { Chip } from '@/src/design-system/components/atoms/Chip';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import {
	addDaysIso,
	endOfMonthIso,
	normalizeDateRange,
	startOfMonthIso,
	todayIso,
	type DateRangeValue,
} from '@/src/design-system/dateUtils';

const LAST_7_DAYS_OFFSET = -6;

export interface DateRangePreset {
	label: string;
	value: DateRangeValue;
}

export interface DateRangePickerFieldProps {
	label: string;
	value?: DateRangeValue;
	defaultValue?: Partial<DateRangeValue>;
	onChange: (value: DateRangeValue) => void;
	onValueChange?: (value: DateRangeValue, meta?: { source: 'selection' | 'shortcut' }) => void;
	presets?: DateRangePreset[];
	locale?: string;
	startPickerProps?: Partial<DatePickerFieldProps>;
	endPickerProps?: Partial<DatePickerFieldProps>;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

const DEFAULT_PRESETS: DateRangePreset[] = [
	{
		label: 'Last 7 days',
		value: {
			start: addDaysIso(todayIso(), LAST_7_DAYS_OFFSET),
			end: todayIso(),
		},
	},
	{
		label: 'This month',
		value: {
			start: startOfMonthIso(todayIso()),
			end: endOfMonthIso(todayIso()),
		},
	},
];

export const DateRangePickerField = forwardRef<View, DateRangePickerFieldProps>(
	(
		{
			label,
			value,
			defaultValue,
			onChange,
			onValueChange,
			presets = DEFAULT_PRESETS,
			locale = 'en-US',
			startPickerProps,
			endPickerProps,
			testID,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const [currentValue, setCurrentValue] = useControllableState({
			value,
			defaultValue: normalizeDateRange(
				defaultValue ?? { start: todayIso(), end: todayIso() },
			),
			onChange: (nextValue, meta) => {
				onChange(nextValue);
				onValueChange?.(nextValue, {
					source: meta?.source === 'shortcut' ? 'shortcut' : 'selection',
				});
			},
		});

		return (
			<View ref={ref} testID={testID} style={style}>
				<ThemedText variant="label" style={{ marginBottom: theme.spacing.xs }}>
					{label}
				</ThemedText>
				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						gap: theme.spacing.sm,
						marginBottom: theme.spacing.sm,
					}}
				>
					{presets.map((preset) => (
						<Chip
							key={preset.label}
							label={preset.label}
							selected={
								currentValue.start === preset.value.start &&
								currentValue.end === preset.value.end
							}
							onPress={() => setCurrentValue(preset.value, { source: 'shortcut' })}
						/>
					))}
				</View>
				<View style={{ gap: theme.spacing.md }}>
					<DatePickerField
						label="Start date"
						value={currentValue.start}
						onChange={(start) =>
							setCurrentValue(
								{
									start,
									end: currentValue.end < start ? start : currentValue.end,
								},
								{ source: 'selection' },
							)
						}
						locale={locale}
						{...startPickerProps}
					/>
					<DatePickerField
						label="End date"
						value={currentValue.end}
						minDate={currentValue.start}
						onChange={(end) =>
							setCurrentValue(
								{
									start: currentValue.start,
									end,
								},
								{ source: 'selection' },
							)
						}
						locale={locale}
						{...endPickerProps}
					/>
				</View>
			</View>
		);
	},
);

DateRangePickerField.displayName = 'DateRangePickerField';
