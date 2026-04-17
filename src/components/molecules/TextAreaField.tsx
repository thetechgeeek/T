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
import { buildFocusRingStyle } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { SIZE_TEXTAREA_MIN_HEIGHT } from '@/theme/uiMetrics';
import { LINE_HEIGHT } from '@/src/theme/typographyMetrics';

export interface TextAreaFieldProps {
	label: string;
	value?: string;
	defaultValue?: string;
	onChange: (text: string) => void;
	onValueChange?: (value: string, meta?: { source: 'input' }) => void;
	placeholder?: string;
	maxLength?: number;
	maxLines?: number;
	testID?: string;
	editable?: boolean;
	required?: boolean;
	style?: StyleProp<ViewStyle>;
}

/**
 * P0.6 — TextAreaField
 * Multi-line input with optional character counter. Auto-grows up to maxLines.
 */
export const TextAreaField = forwardRef<NativeTextInput, TextAreaFieldProps>(
	(
		{
			label,
			value,
			defaultValue = '',
			onChange,
			onValueChange,
			placeholder,
			maxLength,
			maxLines = 6,
			testID,
			editable = true,
			required = false,
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
				onValueChange?.(nextValue, { source: 'input' });
			},
		});

		return (
			<View style={style}>
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
					{required ? <ThemedText style={{ color: c.error }}> *</ThemedText> : null}
				</ThemedText>
				<View
					style={[
						styles.container,
						{
							borderColor: isFocused ? c.primary : c.border,
							borderRadius: theme.borderRadius.md,
						},
						isFocused
							? buildFocusRingStyle({
									color: c.primary,
									radius: theme.borderRadius.md,
								})
							: null,
					]}
				>
					<TextInput
						ref={ref}
						testID={testID}
						value={currentValue}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						onChangeText={(nextValue) =>
							setCurrentValue(nextValue, { source: 'input' })
						}
						placeholder={placeholder}
						placeholderTextColor={c.placeholder}
						accessibilityLabel={label}
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
								maxHeight: maxLines * LINE_HEIGHT.body,
							},
						]}
					/>
					{maxLength !== undefined ? (
						<ThemedText
							variant="caption"
							style={[
								styles.counter,
								{
									fontSize: theme.typography.sizes.xs,
									color: c.placeholder,
								},
							]}
						>
							{currentValue.length}/{maxLength}
						</ThemedText>
					) : null}
				</View>
			</View>
		);
	},
);

TextAreaField.displayName = 'TextAreaField';

const styles = StyleSheet.create({
	container: {
		borderWidth: 1,
		minHeight: SIZE_TEXTAREA_MIN_HEIGHT,
	},
	input: {
		padding: SPACING_PX.md,
		textAlignVertical: 'top',
	},
	counter: {
		position: 'absolute',
		bottom: SPACING_PX.xs,
		right: SPACING_PX.sm,
	},
});
