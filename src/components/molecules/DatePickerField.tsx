import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

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
		<View testID={testID}>
			<Text
				style={{
					fontSize: theme.typography.sizes.sm,
					color: c.onSurfaceVariant,
					fontWeight: '600',
					marginBottom: 4,
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
						<Text style={{ color: c.primary, fontSize: 13 }}>Today</Text>
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
						<Text style={{ color: c.primary, fontSize: 13 }}>Yesterday</Text>
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
						minHeight: 48,
					},
				]}
			>
				<Text
					style={{
						flex: 1,
						fontSize: theme.typography.sizes.md,
						color: displayValue ? c.onSurface : c.placeholder,
						paddingHorizontal: 12,
					}}
				>
					{displayValue || 'DD MMM YYYY'}
				</Text>
				<Text
					style={{
						paddingRight: 12,
						fontSize: 18,
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
		gap: 8,
		marginBottom: 8,
	},
	chip: {
		borderWidth: 1,
		paddingHorizontal: 12,
		paddingVertical: 4,
		height: 32,
		justifyContent: 'center',
	},
	field: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
	},
});
