import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

export interface TextAreaFieldProps {
	label: string;
	value: string;
	onChange: (text: string) => void;
	placeholder?: string;
	maxLength?: number;
	maxLines?: number;
	testID?: string;
	editable?: boolean;
	required?: boolean;
}

/**
 * P0.6 — TextAreaField
 * Multi-line input with optional character counter. Auto-grows up to maxLines.
 */
export function TextAreaField({
	label,
	value,
	onChange,
	placeholder,
	maxLength,
	maxLines = 6,
	testID,
	editable = true,
	required = false,
}: TextAreaFieldProps) {
	const { theme } = useTheme();
	const c = theme.colors;

	return (
		<View>
			<Text
				style={{
					fontSize: theme.typography.sizes.sm,
					color: c.onSurfaceVariant,
					fontWeight: '600',
					marginBottom: 4,
				}}
			>
				{label}
				{required ? <Text style={{ color: c.error }}> *</Text> : null}
			</Text>
			<View
				style={[
					styles.container,
					{
						borderColor: c.border,
						borderRadius: theme.borderRadius.md,
					},
				]}
			>
				<TextInput
					testID={testID}
					value={value}
					onChangeText={onChange}
					placeholder={placeholder}
					placeholderTextColor={c.placeholder}
					multiline
					numberOfLines={3}
					maxLength={maxLength}
					editable={editable}
					scrollEnabled={false}
					style={[
						styles.input,
						{
							fontSize: theme.typography.sizes.md,
							color: c.onSurface,
							maxHeight: maxLines * 24,
						},
					]}
				/>
				{maxLength !== undefined ? (
					<Text
						style={[
							styles.counter,
							{
								fontSize: theme.typography.sizes.xs,
								color: c.placeholder,
							},
						]}
					>
						{value.length}/{maxLength}
					</Text>
				) : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		borderWidth: 1,
		minHeight: 80,
	},
	input: {
		padding: 12,
		textAlignVertical: 'top',
	},
	counter: {
		position: 'absolute',
		bottom: 6,
		right: 10,
	},
});
