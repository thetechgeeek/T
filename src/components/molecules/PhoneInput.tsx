import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

/**
 * Strip +91 prefix, spaces, dashes; take last 10 digits.
 */
function normalizePhone(raw: string): string {
	let cleaned = raw.replace(/[+\s-]/g, '');
	// Remove leading 91 if 12-digit number
	if (cleaned.length === 12 && cleaned.startsWith('91')) {
		cleaned = cleaned.slice(2);
	}
	// Take last 10 digits
	return cleaned.slice(-10);
}

export interface PhoneInputProps {
	value: string;
	onChange: (phone: string) => void;
	label?: string;
	testID?: string;
	editable?: boolean;
}

/**
 * P0.6 — PhoneInput
 * +91 prefix (non-editable), 10-digit validation on blur.
 * Strips +91, spaces, dashes from pasted numbers.
 */
export function PhoneInput({ value, onChange, label, testID, editable = true }: PhoneInputProps) {
	const { theme } = useTheme();
	const c = theme.colors;
	const [error, setError] = useState('');
	const [internalValue, setInternalValue] = useState(value);

	const handleChange = (text: string) => {
		const normalized = normalizePhone(text);
		setInternalValue(normalized);
		onChange(normalized);
		// Clear error while typing
		if (error) setError('');
	};

	const handleBlur = () => {
		const current = internalValue;
		if (current.length > 0 && current.length < 10) {
			setError('10 अंक चाहिए');
		} else {
			setError('');
		}
	};

	return (
		<View>
			{label ? (
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
			) : null}
			<View
				style={[
					styles.row,
					{
						borderColor: error ? c.error : c.border,
						borderRadius: theme.borderRadius.md,
						borderWidth: error ? 2 : 1,
						minHeight: 48,
					},
				]}
			>
				<Text
					style={{
						fontSize: theme.typography.sizes.md,
						color: c.onSurface,
						paddingLeft: 12,
						alignSelf: 'center',
						fontWeight: '600',
					}}
				>
					+91
				</Text>
				<View style={[styles.separator, { backgroundColor: c.border }]} />
				<TextInput
					testID={testID}
					value={internalValue}
					onChangeText={handleChange}
					onBlur={handleBlur}
					keyboardType="phone-pad"
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
				<Text
					style={{
						fontSize: theme.typography.sizes.xs,
						color: c.error,
						marginTop: 4,
					}}
				>
					{error}
				</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	separator: {
		width: 1,
		height: 24,
		marginHorizontal: 8,
	},
	input: {
		flex: 1,
		paddingRight: 12,
		paddingVertical: 12,
	},
});
