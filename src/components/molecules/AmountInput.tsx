import React, { forwardRef, useState } from 'react';
import {
	View,
	TextInput,
	StyleSheet,
	type StyleProp,
	type TextInput as NativeTextInput,
	type ViewStyle,
} from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { announceForScreenReader, buildFocusRingStyle } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
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
	value?: number;
	defaultValue?: number;
	onChange: (value: number) => void;
	onValueChange?: (value: number, meta?: { source: 'input' }) => void;
	label?: string;
	placeholder?: string;
	maxValue?: number;
	allowDecimals?: boolean;
	testID?: string;
	editable?: boolean;
	style?: StyleProp<ViewStyle>;
}

/**
 * P0.6 — AmountInput
 * ₹ prefix (non-editable), Indian number grouping, 20sp bold terracotta text.
 * onChange always receives a raw number.
 */
export const AmountInput = forwardRef<NativeTextInput, AmountInputProps>(
	(
		{
			value,
			defaultValue = 0,
			onChange,
			onValueChange,
			label,
			placeholder,
			maxValue,
			allowDecimals = false,
			testID,
			editable = true,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const inputTokens = theme.components.input;
		const [draftText, setDraftText] = useState<string | null>(null);
		const [exceeded, setExceeded] = useState(false);
		const [isFocused, setIsFocused] = useState(false);
		const [currentValue, setCurrentValue] = useControllableState({
			value,
			defaultValue,
			onChange: (nextValue) => {
				onChange(nextValue);
				onValueChange?.(nextValue, { source: 'input' });
			},
		});

		const displayText =
			draftText !== null ? draftText : currentValue !== 0 ? formatIndian(currentValue) : '';

		const handleChange = (text: string) => {
			const cleaned = allowDecimals
				? text.replace(/[^0-9.]/g, '')
				: text.replace(/[^0-9]/g, '');
			const numeric = cleaned === '' ? 0 : parseFloat(cleaned) || 0;

			if (maxValue !== undefined && numeric > maxValue) {
				setExceeded(true);
			} else {
				setExceeded(false);
			}

			setDraftText(cleaned);
			setCurrentValue(numeric, { source: 'input' });
			if (Object.is(numeric, currentValue)) {
				onChange(numeric);
				onValueChange?.(numeric, { source: 'input' });
			}
		};

		const handleBlur = () => {
			setIsFocused(false);
			setDraftText(null);
			if (maxValue !== undefined && currentValue > maxValue) {
				const message = `₹ ${formatIndian(maxValue)} से अधिक नहीं हो सकता`;
				void announceForScreenReader(message);
			}
		};

		const errorMsg =
			exceeded && maxValue !== undefined
				? `₹ ${formatIndian(maxValue)} से अधिक नहीं हो सकता`
				: null;

		return (
			<View style={style}>
				{label ? (
					<ThemedText
						variant="label"
						weight="semibold"
						style={{
							fontSize: theme.typography.sizes.sm,
							color: c.onSurfaceVariant,
							marginBottom: inputTokens.labelGap,
						}}
					>
						{label}
					</ThemedText>
				) : null}
				<View
					style={[
						styles.row,
						{
							borderColor: exceeded ? c.error : isFocused ? c.primary : c.border,
							borderRadius: inputTokens.radius,
							minHeight: inputTokens.minHeight,
							borderWidth: exceeded
								? inputTokens.errorBorderWidth
								: inputTokens.borderWidth,
						},
						isFocused
							? buildFocusRingStyle({
									color: c.primary,
									radius: inputTokens.radius,
								})
							: null,
					]}
				>
					<ThemedText
						variant="metric"
						weight="bold"
						style={{
							fontSize: FONT_SIZE.amount,
							color: c.primary,
							paddingLeft: SPACING_PX.md,
							alignSelf: 'center',
						}}
					>
						₹
					</ThemedText>
					<TextInput
						ref={ref}
						testID={testID}
						value={displayText}
						onFocus={() => setIsFocused(true)}
						onBlur={handleBlur}
						onChangeText={handleChange}
						keyboardType="number-pad"
						accessibilityLabel={label ?? 'Amount'}
						placeholder={placeholder ?? (currentValue === 0 ? '0' : undefined)}
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
					<ThemedText
						variant="caption"
						style={{
							fontSize: theme.typography.sizes.xs,
							color: c.error,
							marginTop: inputTokens.helperGap,
						}}
					>
						{errorMsg}
					</ThemedText>
				) : null}
			</View>
		);
	},
);

AmountInput.displayName = 'AmountInput';

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
