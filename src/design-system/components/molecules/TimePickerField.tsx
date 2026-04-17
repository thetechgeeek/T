import React, { forwardRef, useState } from 'react';
import { Platform, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useControllableState } from '@/src/hooks/useControllableState';
import { buildFocusRingStyle } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';
import { formatDisplayTime } from '@/src/design-system/dateUtils';

const DEFAULT_HOUR = 9;
const MAX_HOUR = 23;
const MAX_MINUTE = 59;
const REFERENCE_TIME_YEAR = 2026;

function normalizeTime(value?: string) {
	if (!value) {
		return '09:00';
	}

	const [hours, minutes] = value.split(':').map((part) => Number.parseInt(part, 10));
	const nextHours = Number.isNaN(hours) ? DEFAULT_HOUR : Math.max(0, Math.min(MAX_HOUR, hours));
	const nextMinutes = Number.isNaN(minutes) ? 0 : Math.max(0, Math.min(MAX_MINUTE, minutes));
	return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
}

function timeToDate(value: string) {
	const [hours, minutes] = normalizeTime(value)
		.split(':')
		.map((part) => Number.parseInt(part, 10));

	return new Date(REFERENCE_TIME_YEAR, 0, 1, hours, minutes);
}

function dateToTime(value: Date) {
	return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

export interface TimePickerFieldProps {
	label: string;
	value?: string;
	defaultValue?: string;
	onChange: (value: string) => void;
	onValueChange?: (value: string, meta?: { source: 'selection' }) => void;
	locale?: string;
	minuteInterval?: 1 | 5 | 10 | 15 | 30;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export const TimePickerField = forwardRef<React.ElementRef<typeof Pressable>, TimePickerFieldProps>(
	(
		{
			label,
			value,
			defaultValue = '09:00',
			onChange,
			onValueChange,
			locale = 'en-US',
			minuteInterval = 5,
			testID,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [isFocused, setIsFocused] = useState(false);
		const [pickerVisible, setPickerVisible] = useState(false);
		const [currentValue, setCurrentValue] = useControllableState({
			value,
			defaultValue: normalizeTime(defaultValue),
			onChange: (nextValue) => {
				onChange(nextValue);
				onValueChange?.(nextValue, { source: 'selection' });
			},
		});
		const displayValue = formatDisplayTime(currentValue, locale);

		const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
			if (Platform.OS === 'android') {
				setPickerVisible(false);
			}

			if (event.type === 'dismissed' || !selectedDate) {
				return;
			}

			setCurrentValue(dateToTime(selectedDate), { source: 'selection' });
		};

		return (
			<View testID={testID} style={style}>
				<ThemedText
					variant="label"
					weight="semibold"
					style={{
						fontSize: theme.typography.sizes.sm,
						color: c.onSurfaceVariant,
						marginBottom: theme.spacing.xs,
					}}
				>
					{label}
				</ThemedText>
				<Pressable
					ref={ref}
					onPress={() => setPickerVisible(true)}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					accessibilityRole="button"
					accessibilityLabel={`${label}: ${displayValue}`}
					style={[
						{
							minHeight: TOUCH_TARGET_MIN_PX,
							borderWidth: theme.borderWidth.sm,
							borderColor: isFocused ? c.primary : c.border,
							borderRadius: theme.borderRadius.md,
							paddingHorizontal: theme.spacing.md,
							justifyContent: 'center',
						},
						isFocused
							? buildFocusRingStyle({
									color: c.primary,
									radius: theme.borderRadius.md,
								})
							: null,
					]}
				>
					<ThemedText variant="body" style={{ color: c.onSurface }}>
						{displayValue}
					</ThemedText>
				</Pressable>
				{pickerVisible ? (
					<DateTimePicker
						testID="native-time-picker"
						mode="time"
						display={Platform.OS === 'ios' ? 'spinner' : 'default'}
						value={timeToDate(currentValue)}
						minuteInterval={minuteInterval}
						onChange={handleChange}
					/>
				) : null}
			</View>
		);
	},
);

TimePickerField.displayName = 'TimePickerField';
