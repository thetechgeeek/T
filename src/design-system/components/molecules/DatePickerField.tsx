import React, { forwardRef, useMemo, useState } from 'react';
import {
	Modal,
	Platform,
	Pressable,
	StyleSheet,
	View,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useControllableState } from '@/src/hooks/useControllableState';
import {
	announceForScreenReader,
	buildFocusRingStyle,
	isAccessibilityAction,
	mapAccessibilityActionNames,
} from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';
import {
	addDaysIso,
	buildCalendarMonth,
	formatDisplayDate,
	getWeekStartsOn,
	getWeekdayLabels,
	isIsoDateWithinRange,
	monthHeading,
	parseIsoDate,
	todayIso,
} from '@/src/design-system/dateUtils';

const PREVIOUS_MONTH_OFFSET_DAYS = -28;
const NEXT_MONTH_OFFSET_DAYS = 31;

function yesterdayIso() {
	return addDaysIso(todayIso(), -1);
}

export interface DatePickerFieldProps {
	label: string;
	value?: string; // ISO date string "YYYY-MM-DD"
	defaultValue?: string;
	onChange: (iso: string) => void;
	onValueChange?: (iso: string, meta?: { source: 'shortcut' | 'selection' }) => void;
	showShortcuts?: boolean;
	minDate?: string;
	maxDate?: string;
	locale?: string;
	weekStartsOn?: number;
	presentation?: 'auto' | 'sheet' | 'native';
	disabledDates?: string[];
	isDateDisabled?: (iso: string) => boolean;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

/**
 * DatePickerField
 * Button-style date field with calendar-sheet rendering for library proof,
 * disabled-date rules, locale-aware week starts, and optional native picker fallback on mobile.
 */
export const DatePickerField = forwardRef<React.ElementRef<typeof Pressable>, DatePickerFieldProps>(
	(
		{
			label,
			value,
			defaultValue = '',
			onChange,
			onValueChange,
			showShortcuts = false,
			minDate,
			maxDate,
			locale = 'en-US',
			weekStartsOn,
			presentation = 'auto',
			disabledDates = [],
			isDateDisabled,
			testID,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [isFocused, setIsFocused] = useState(false);
		const [sheetVisible, setSheetVisible] = useState(false);
		const [nativeVisible, setNativeVisible] = useState(false);
		const [currentValue, setCurrentValue] = useControllableState({
			value,
			defaultValue,
			onChange: (nextValue, meta) => {
				onChange(nextValue);
				onValueChange?.(nextValue, {
					source: meta?.source === 'shortcut' ? 'shortcut' : 'selection',
				});
			},
		});
		const displayValue = formatDisplayDate(currentValue, locale);
		const resolvedWeekStartsOn = weekStartsOn ?? getWeekStartsOn(locale);
		const [calendarMonth, setCalendarMonth] = useState(currentValue || todayIso());
		const calendarDays = useMemo(
			() => buildCalendarMonth(calendarMonth || todayIso(), locale, resolvedWeekStartsOn),
			[calendarMonth, locale, resolvedWeekStartsOn],
		);
		const weekdayLabels = useMemo(
			() => getWeekdayLabels(locale, resolvedWeekStartsOn),
			[locale, resolvedWeekStartsOn],
		);
		const disabledDateSet = useMemo(() => new Set(disabledDates), [disabledDates]);
		const usesNativePicker =
			presentation === 'native' || (presentation === 'auto' && Platform.OS !== 'web');

		const isDisabledValue = (iso: string) =>
			!isIsoDateWithinRange(iso, minDate, maxDate) ||
			disabledDateSet.has(iso) ||
			Boolean(isDateDisabled?.(iso));

		const selectValue = (nextValue: string, source: 'shortcut' | 'selection') => {
			if (isDisabledValue(nextValue)) {
				void announceForScreenReader('This date is unavailable');
				return;
			}

			setCurrentValue(nextValue, { source });
			setCalendarMonth(nextValue);
			void announceForScreenReader(`${formatDisplayDate(nextValue, locale)} selected`);
		};

		const openPicker = () => {
			if (usesNativePicker) {
				setNativeVisible(true);
				return;
			}

			setSheetVisible(true);
		};

		const closeSheet = () => {
			setSheetVisible(false);
		};

		const handleNativeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
			if (Platform.OS === 'android') {
				setNativeVisible(false);
			}

			if (event.type === 'dismissed' || !selectedDate) {
				return;
			}

			const nextValue = selectedDate.toISOString().slice(0, 10);
			selectValue(nextValue, 'selection');
		};

		return (
			<View testID={testID} style={style}>
				<ThemedText
					variant="label"
					weight="semibold"
					style={{
						fontSize: theme.typography.sizes.sm,
						color: c.onSurfaceVariant,
						marginBottom: SPACING_PX.xs,
					}}
				>
					{label}
				</ThemedText>

				{showShortcuts ? (
					<View style={styles.shortcuts}>
						<Pressable
							onPress={() => selectValue(todayIso(), 'shortcut')}
							accessibilityRole="button"
							accessibilityLabel="Set date to today"
							style={[
								styles.chip,
								{
									borderColor: c.primary,
									borderRadius: theme.borderRadius.full,
								},
							]}
						>
							<ThemedText
								variant="caption"
								style={{ color: c.primary, fontSize: theme.typography.sizes.xs }}
							>
								Today
							</ThemedText>
						</Pressable>
						<Pressable
							onPress={() => selectValue(yesterdayIso(), 'shortcut')}
							accessibilityRole="button"
							accessibilityLabel="Set date to yesterday"
							style={[
								styles.chip,
								{
									borderColor: c.primary,
									borderRadius: theme.borderRadius.full,
								},
							]}
						>
							<ThemedText
								variant="caption"
								style={{ color: c.primary, fontSize: theme.typography.sizes.xs }}
							>
								Yesterday
							</ThemedText>
						</Pressable>
					</View>
				) : null}

				<Pressable
					ref={ref}
					onPress={openPicker}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					accessibilityRole="button"
					accessibilityLabel={`${label}: ${displayValue || 'Select date'}`}
					accessibilityActions={mapAccessibilityActionNames([
						{ name: 'today', label: 'Set date to today' },
						{ name: 'yesterday', label: 'Set date to yesterday' },
					])}
					onAccessibilityAction={(event) => {
						if (isAccessibilityAction(event, 'today')) {
							selectValue(todayIso(), 'shortcut');
							return;
						}
						if (isAccessibilityAction(event, 'yesterday')) {
							selectValue(yesterdayIso(), 'shortcut');
						}
					}}
					style={[
						styles.field,
						{
							borderColor: isFocused ? c.primary : c.border,
							borderRadius: theme.borderRadius.md,
							minHeight: TOUCH_TARGET_MIN_PX,
						},
						isFocused
							? buildFocusRingStyle({
									color: c.primary,
									radius: theme.borderRadius.md,
								})
							: null,
					]}
				>
					<ThemedText
						variant="body"
						style={{
							flex: 1,
							fontSize: theme.typography.sizes.md,
							color: displayValue ? c.onSurface : c.placeholder,
							paddingHorizontal: SPACING_PX.md,
						}}
					>
						{displayValue || 'DD MMM YYYY'}
					</ThemedText>
					<ThemedText
						variant="body"
						style={{
							paddingEnd: SPACING_PX.md,
							fontSize: theme.typography.sizes.lg,
							color: c.onSurfaceVariant,
						}}
						accessibilityElementsHidden
					>
						📅
					</ThemedText>
				</Pressable>

				{nativeVisible ? (
					<DateTimePicker
						testID="native-date-picker"
						mode="date"
						display={Platform.OS === 'ios' ? 'inline' : 'default'}
						value={parseIsoDate(currentValue) ?? new Date()}
						minimumDate={minDate ? (parseIsoDate(minDate) ?? undefined) : undefined}
						maximumDate={maxDate ? (parseIsoDate(maxDate) ?? undefined) : undefined}
						onChange={handleNativeChange}
					/>
				) : null}

				<Modal
					visible={sheetVisible}
					transparent
					animationType="fade"
					onRequestClose={closeSheet}
				>
					<Pressable
						style={[styles.backdrop, { backgroundColor: c.scrim }]}
						onPress={closeSheet}
					/>
					<View
						style={[
							styles.sheet,
							{
								backgroundColor: c.surface,
								borderTopLeftRadius: theme.borderRadius.xl,
								borderTopRightRadius: theme.borderRadius.xl,
							},
						]}
					>
						<View style={styles.sheetHeader}>
							<Pressable
								onPress={() =>
									setCalendarMonth(
										addDaysIso(calendarMonth, PREVIOUS_MONTH_OFFSET_DAYS),
									)
								}
								accessibilityRole="button"
								accessibilityLabel="Previous month"
								style={styles.monthButton}
							>
								<ThemedText variant="bodyStrong" style={{ color: c.primary }}>
									‹
								</ThemedText>
							</Pressable>
							<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
								{monthHeading(calendarMonth, locale)}
							</ThemedText>
							<Pressable
								onPress={() =>
									setCalendarMonth(
										addDaysIso(calendarMonth, NEXT_MONTH_OFFSET_DAYS),
									)
								}
								accessibilityRole="button"
								accessibilityLabel="Next month"
								style={styles.monthButton}
							>
								<ThemedText variant="bodyStrong" style={{ color: c.primary }}>
									›
								</ThemedText>
							</Pressable>
						</View>

						<View style={styles.weekdayRow}>
							{weekdayLabels.map((weekday) => (
								<View key={weekday} style={styles.weekdayCell}>
									<ThemedText
										variant="captionBold"
										style={{ color: c.onSurfaceVariant }}
									>
										{weekday}
									</ThemedText>
								</View>
							))}
						</View>

						<View style={styles.calendarGrid}>
							{calendarDays.map((day) => {
								const isSelected = day.iso === currentValue;
								const isDisabled = isDisabledValue(day.iso);
								return (
									<Pressable
										key={day.iso}
										testID={`calendar-day-${day.iso}`}
										onPress={() => {
											selectValue(day.iso, 'selection');
											closeSheet();
										}}
										disabled={isDisabled}
										accessibilityRole="button"
										accessibilityLabel={formatDisplayDate(day.iso, locale)}
										accessibilityState={{
											selected: isSelected,
											disabled: isDisabled,
										}}
										style={[
											styles.dayCell,
											{
												backgroundColor: isSelected
													? c.primary
													: 'transparent',
												borderColor: isSelected ? c.primary : c.border,
												borderRadius: theme.borderRadius.md,
												opacity:
													day.inCurrentMonth && !isDisabled
														? 1
														: theme.opacity.inactive,
											},
										]}
									>
										<ThemedText
											variant="body"
											style={{
												color: isSelected ? c.onPrimary : c.onSurface,
											}}
										>
											{day.label}
										</ThemedText>
									</Pressable>
								);
							})}
						</View>

						<Pressable
							onPress={closeSheet}
							accessibilityRole="button"
							accessibilityLabel="Close date picker"
							style={[
								styles.closeButton,
								{
									borderColor: c.border,
									borderRadius: theme.borderRadius.md,
								},
							]}
						>
							<ThemedText variant="bodyStrong" style={{ color: c.onSurface }}>
								Done
							</ThemedText>
						</Pressable>
					</View>
				</Modal>
			</View>
		);
	},
);

DatePickerField.displayName = 'DatePickerField';

const styles = StyleSheet.create({
	shortcuts: {
		flexDirection: 'row',
		gap: SPACING_PX.sm,
		marginBottom: SPACING_PX.sm,
	},
	chip: {
		borderWidth: 1,
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.xs,
		height: SPACING_PX['2xl'],
		justifyContent: 'center',
	},
	field: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
	},
	sheet: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
		paddingHorizontal: SPACING_PX.lg,
		paddingTop: SPACING_PX.lg,
		paddingBottom: SPACING_PX.xl,
	},
	sheetHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: SPACING_PX.md,
	},
	monthButton: {
		minWidth: TOUCH_TARGET_MIN_PX,
		minHeight: TOUCH_TARGET_MIN_PX,
		alignItems: 'center',
		justifyContent: 'center',
	},
	weekdayRow: {
		flexDirection: 'row',
		flexWrap: 'nowrap',
		marginBottom: SPACING_PX.xs,
	},
	weekdayCell: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: SPACING_PX.xs,
	},
	calendarGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: SPACING_PX.lg,
	},
	dayCell: {
		width: '14.2857%',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: SPACING_PX.md,
		borderWidth: StyleSheet.hairlineWidth,
	},
	closeButton: {
		minHeight: TOUCH_TARGET_MIN_PX,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: StyleSheet.hairlineWidth,
	},
});
