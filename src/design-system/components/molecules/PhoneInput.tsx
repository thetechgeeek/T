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
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

const PHONE_DIGITS = 10;
const PHONE_WITH_COUNTRY_CODE_DIGITS = 12;
const COUNTRY_CODE_DIGITS = 2;

/**
 * Strip +91 prefix, spaces, dashes; take last 10 digits.
 */
function normalizePhone(raw: string): string {
	let cleaned = raw.replace(/[+\s-]/g, '');
	// Remove leading 91 if 12-digit number
	if (cleaned.length === PHONE_WITH_COUNTRY_CODE_DIGITS && cleaned.startsWith('91')) {
		cleaned = cleaned.slice(COUNTRY_CODE_DIGITS);
	}
	// Take last 10 digits
	return cleaned.slice(-PHONE_DIGITS);
}

export interface PhoneInputProps {
	value?: string;
	defaultValue?: string;
	onChange: (phone: string) => void;
	onValueChange?: (phone: string, meta?: { source: 'input' }) => void;
	label?: string;
	testID?: string;
	editable?: boolean;
	style?: StyleProp<ViewStyle>;
}

/**
 * P0.6 — PhoneInput
 * +91 prefix (non-editable), 10-digit validation on blur.
 * Strips +91, spaces, dashes from pasted numbers.
 */
export const PhoneInput = forwardRef<NativeTextInput, PhoneInputProps>(
	(
		{
			value,
			defaultValue = '',
			onChange,
			onValueChange,
			label,
			testID,
			editable = true,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const inputTokens = theme.components.input;
		const [error, setError] = useState('');
		const [isFocused, setIsFocused] = useState(false);
		const [currentValue, setCurrentValue] = useControllableState({
			value,
			defaultValue,
			onChange: (nextValue) => {
				onChange(nextValue);
				onValueChange?.(nextValue, { source: 'input' });
			},
		});

		const handleChange = (text: string) => {
			const normalized = normalizePhone(text);
			setCurrentValue(normalized, { source: 'input' });
			if (error) {
				setError('');
			}
		};

		const handleBlur = () => {
			setIsFocused(false);
			if (currentValue.length > 0 && currentValue.length < 10) {
				const nextError = 'Enter 10 digits';
				setError(nextError);
				void announceForScreenReader(nextError);
				return;
			}

			setError('');
		};

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
							borderColor: error ? c.error : isFocused ? c.primary : c.border,
							borderRadius: inputTokens.radius,
							borderWidth: error
								? inputTokens.errorBorderWidth
								: inputTokens.borderWidth,
							minHeight: inputTokens.minHeight,
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
						variant="bodyStrong"
						weight="semibold"
						style={{
							fontSize: theme.typography.sizes.md,
							color: c.onSurface,
							paddingStart: inputTokens.paddingX,
							alignSelf: 'center',
						}}
					>
						+91
					</ThemedText>
					<View style={[styles.separator, { backgroundColor: c.border }]} />
					<TextInput
						ref={ref}
						testID={testID}
						value={currentValue}
						onFocus={() => setIsFocused(true)}
						onChangeText={handleChange}
						onBlur={handleBlur}
						keyboardType="phone-pad"
						accessibilityLabel={label ?? 'Phone number'}
						maxLength={10}
						editable={editable}
						placeholder="XXXXX XXXXX"
						placeholderTextColor={c.placeholder}
						style={[
							styles.input,
							{
								fontSize: theme.typography.sizes.md,
								color: c.onSurface,
							},
						]}
					/>
				</View>
				{error ? (
					<ThemedText
						variant="caption"
						style={{
							fontSize: theme.typography.sizes.xs,
							color: c.error,
							marginTop: inputTokens.helperGap,
						}}
					>
						{error}
					</ThemedText>
				) : null}
			</View>
		);
	},
);

PhoneInput.displayName = 'PhoneInput';

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	separator: {
		width: StyleSheet.hairlineWidth,
		height: SPACING_PX.xl,
		marginHorizontal: SPACING_PX.sm,
	},
	input: {
		flex: 1,
		paddingEnd: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
	},
});
