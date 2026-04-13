import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SIZE_INPUT_HEIGHT } from '@/theme/uiMetrics';
import { INDIAN_GROUPING_TAIL_DIGIT_COUNT } from '@/constants/money';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

/**
 * Format a number with Indian grouping: 100000 → "1,00,000"
 */
function formatIndian(value: number): string {
	if (value === 0) return '';
	const str = Math.floor(value).toString();
	const tail = INDIAN_GROUPING_TAIL_DIGIT_COUNT;
	if (str.length <= tail) return str;
	const last3 = str.slice(-tail);
	const rest = str.slice(0, -tail);
	const withGroups = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
	return `${withGroups},${last3}`;
}

export interface AmountInputProps {
	value: number;
	onChange: (value: number) => void;
	label?: string;
	placeholder?: string;
	maxValue?: number;
	allowDecimals?: boolean;
	testID?: string;
	editable?: boolean;
}

/**
 * P0.6 — AmountInput
 * ₹ prefix (non-editable), Indian number grouping, 20sp bold terracotta text.
 * onChange always receives a raw number.
 */
export function AmountInput({
	value,
	onChange,
	label,
	placeholder,
	maxValue,
	allowDecimals = false,
	testID,
	editable = true,
}: AmountInputProps) {
	const { theme } = useTheme();
	const c = theme.colors;

	const [localText, setLocalText] = useState('');
	const [exceeded, setExceeded] = useState(false);

	// Use local text when user is typing; fall back to formatted prop value otherwise
	const displayText = localText !== '' ? localText : value !== 0 ? formatIndian(value) : '';

	const handleChange = (text: string) => {
		// Strip all non-numeric (and non-decimal when allowed)
		const cleaned = allowDecimals ? text.replace(/[^0-9.]/g, '') : text.replace(/[^0-9]/g, '');

		const numeric = cleaned === '' ? 0 : parseFloat(cleaned) || 0;

		if (maxValue !== undefined && numeric > maxValue) {
			setExceeded(true);
		} else {
			setExceeded(false);
		}

		setLocalText(cleaned);
		onChange(numeric);
	};

	const errorMsg =
		exceeded && maxValue !== undefined
			? `₹ ${formatIndian(maxValue)} से अधिक नहीं हो सकता`
			: null;

	return (
		<View>
			{label ? (
				<Text
					style={{
						fontSize: theme.typography.sizes.sm,
						color: c.onSurfaceVariant,
						marginBottom: SPACING_PX.xs,
						fontWeight: '600',
					}}
				>
					{label}
				</Text>
			) : null}
			<View
				style={[
					styles.row,
					{
						borderColor: exceeded ? c.error : c.border,
						borderRadius: theme.borderRadius.md,
						minHeight: SIZE_INPUT_HEIGHT,
						borderWidth: exceeded ? 2 : 1,
					},
				]}
			>
				<Text
					style={{
						fontSize: FONT_SIZE.amount,
						fontWeight: '700',
						color: c.primary,
						paddingLeft: SPACING_PX.md,
						alignSelf: 'center',
					}}
				>
					₹
				</Text>
				<TextInput
					testID={testID}
					value={displayText}
					onChangeText={handleChange}
					keyboardType="number-pad"
					placeholder={placeholder ?? (value === 0 ? '0' : undefined)}
					placeholderTextColor={c.placeholder}
					editable={editable}
					style={[
						styles.input,
						{
							fontSize: FONT_SIZE.amount,
							fontWeight: '700',
							color: c.primary,
						},
					]}
				/>
			</View>
			{errorMsg ? (
				<Text
					style={{
						fontSize: theme.typography.sizes.xs,
						color: c.error,
						marginTop: SPACING_PX.xs,
					}}
				>
					{errorMsg}
				</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	input: {
		flex: 1,
		paddingHorizontal: SPACING_PX.sm,
		paddingVertical: SPACING_PX.md,
	},
});
