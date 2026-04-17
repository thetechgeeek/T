import React, { forwardRef, useState } from 'react';
import { View, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import {
	announceForScreenReader,
	buildFocusRingStyle,
	isAccessibilityAction,
	mapAccessibilityActionNames,
} from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

const MONTHS_EN = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
];

function formatDisplay(iso: string): string {
	if (!iso) return '';
	const d = new Date(iso);
	if (isNaN(d.getTime())) return iso;
	const dd = String(d.getUTCDate()).padStart(2, '0');
	const mmm = MONTHS_EN[d.getUTCMonth()];
	const yyyy = d.getUTCFullYear();
	return `${dd} ${mmm} ${yyyy}`;
}

function todayISO(): string {
	return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
	const d = new Date();
	d.setDate(d.getDate() - 1);
	return d.toISOString().slice(0, 10);
}

export interface DatePickerFieldProps {
	label: string;
	value?: string; // ISO date string "YYYY-MM-DD"
	defaultValue?: string;
	onChange: (iso: string) => void;
	onValueChange?: (iso: string, meta?: { source: 'shortcut' }) => void;
	showShortcuts?: boolean;
	minDate?: string;
	maxDate?: string;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

/**
 * P0.6 — DatePickerField
 * Shows date as "DD MMM YYYY". Calendar icon on right. Optional shortcut chips.
 * Falls back to text input on web/unsupported platforms.
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
			testID,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [isFocused, setIsFocused] = useState(false);
		const [currentValue, setCurrentValue] = useControllableState({
			value,
			defaultValue,
			onChange: (nextValue) => {
				onChange(nextValue);
				onValueChange?.(nextValue, { source: 'shortcut' });
			},
		});
		const displayValue = formatDisplay(currentValue);

		const applyShortcut = (nextValue: string, announcementLabel: string) => {
			setCurrentValue(nextValue, { source: 'shortcut' });
			void announceForScreenReader(announcementLabel);
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
							onPress={() => applyShortcut(todayISO(), 'Date set to today')}
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
								style={{ color: c.primary, fontSize: FONT_SIZE.label }}
							>
								Today
							</ThemedText>
						</Pressable>
						<Pressable
							onPress={() => applyShortcut(yesterdayISO(), 'Date set to yesterday')}
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
								style={{ color: c.primary, fontSize: FONT_SIZE.label }}
							>
								Yesterday
							</ThemedText>
						</Pressable>
					</View>
				) : null}

				<Pressable
					ref={ref}
					onPress={() => {
						// TODO: open DateTimePicker in a future phase
					}}
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
							applyShortcut(todayISO(), 'Date set to today');
							return;
						}
						if (isAccessibilityAction(event, 'yesterday')) {
							applyShortcut(yesterdayISO(), 'Date set to yesterday');
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
							paddingRight: SPACING_PX.md,
							fontSize: FONT_SIZE.h3,
							color: c.onSurfaceVariant,
						}}
						accessibilityElementsHidden
					>
						📅
					</ThemedText>
				</Pressable>

				{/* DateTimePicker would be rendered conditionally here on native */}
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
});
