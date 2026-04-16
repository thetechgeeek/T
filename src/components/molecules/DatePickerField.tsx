import React from 'react';
import { View, Text, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
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
	value: string; // ISO date string "YYYY-MM-DD"
	onChange: (iso: string) => void;
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
export function DatePickerField({
	label,
	value,
	onChange,
	showShortcuts = false,
	testID,
	style,
}: DatePickerFieldProps) {
	const { theme } = useTheme();
	const c = theme.colors;
	const displayValue = formatDisplay(value);

	// On native: would open DateTimePicker. In this implementation we wire up
	// a platform-agnostic text display. The picker would be integrated via
	// @react-native-community/datetimepicker in the actual app.
	const handlePress = () => {
		// TODO: open DateTimePicker in a future phase
	};

	return (
		<View testID={testID} style={style}>
			<Text
				style={{
					fontSize: theme.typography.sizes.sm,
					color: c.onSurfaceVariant,
					fontWeight: '600',
					marginBottom: SPACING_PX.xs,
				}}
			>
				{label}
			</Text>

			{showShortcuts ? (
				<View style={styles.shortcuts}>
					<Pressable
						onPress={() => onChange(todayISO())}
						style={[
							styles.chip,
							{
								borderColor: c.primary,
								borderRadius: theme.borderRadius.full,
							},
						]}
					>
						<Text style={{ color: c.primary, fontSize: FONT_SIZE.label }}>Today</Text>
					</Pressable>
					<Pressable
						onPress={() => onChange(yesterdayISO())}
						style={[
							styles.chip,
							{
								borderColor: c.primary,
								borderRadius: theme.borderRadius.full,
							},
						]}
					>
						<Text style={{ color: c.primary, fontSize: FONT_SIZE.label }}>
							Yesterday
						</Text>
					</Pressable>
				</View>
			) : null}

			<Pressable
				onPress={handlePress}
				accessibilityRole="button"
				accessibilityLabel={`${label}: ${displayValue || 'Select date'}`}
				style={[
					styles.field,
					{
						borderColor: c.border,
						borderRadius: theme.borderRadius.md,
						minHeight: TOUCH_TARGET_MIN_PX,
					},
				]}
			>
				<Text
					style={{
						flex: 1,
						fontSize: theme.typography.sizes.md,
						color: displayValue ? c.onSurface : c.placeholder,
						paddingHorizontal: SPACING_PX.md,
					}}
				>
					{displayValue || 'DD MMM YYYY'}
				</Text>
				<Text
					style={{
						paddingRight: SPACING_PX.md,
						fontSize: FONT_SIZE.h3,
						color: c.onSurfaceVariant,
					}}
					accessibilityElementsHidden
				>
					📅
				</Text>
			</Pressable>

			{/* DateTimePicker would be rendered conditionally here on native */}
		</View>
	);
}

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
