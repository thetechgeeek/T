import React, { forwardRef, useState } from 'react';
import {
	View,
	TextInput as RNTextInput,
	StyleSheet,
	type TextInputProps as RNTextInputProps,
	type StyleProp,
	type ViewStyle,
	type TextStyle,
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from './ThemedText';

export interface TextInputProps extends RNTextInputProps {
	label?: string;
	/** Stable English identifier for screen readers and Maestro. Takes precedence over label. */
	accessibilityLabel?: string;
	error?: string;
	onValueChange?: (value: string, meta?: { source: 'input' }) => void;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	containerStyle?: StyleProp<ViewStyle>;
	inputStyle?: StyleProp<TextStyle>;
	helperText?: string;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
	(
		{
			label,
			accessibilityLabel,
			error,
			leftIcon,
			rightIcon,
			containerStyle,
			inputStyle,
			helperText,
			onValueChange,
			onFocus,
			onBlur,
			onChangeText,
			...props
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const inputTokens = theme.components.input;

		const [isFocused, setIsFocused] = useState(false);
		const borderColor = error ? c.error : isFocused ? c.primary : c.border;

		// Build a composed hint so error/helper is announced alongside the field
		const computedLabel = accessibilityLabel ?? label ?? undefined;
		const computedHint = error ? `Error: ${error}` : (helperText ?? undefined);

		return (
			<View style={[styles.container, containerStyle]}>
				{label && (
					<ThemedText
						importantForAccessibility="no"
						variant="label"
						style={[
							styles.label,
							{
								color: c.onSurfaceVariant,
								fontWeight: theme.typography.weights.medium,
								marginBottom: inputTokens.labelGap,
							},
						]}
					>
						{label}
					</ThemedText>
				)}
				<View
					style={[
						styles.inputContainer,
						{
							backgroundColor: c.surface,
							borderColor,
							borderRadius: inputTokens.radius,
							borderWidth: error
								? inputTokens.errorBorderWidth
								: inputTokens.borderWidth,
							minHeight: inputTokens.minHeight,
							paddingHorizontal: inputTokens.paddingX,
						},
					]}
				>
					{leftIcon && (
						<View
							style={{ marginRight: inputTokens.iconGap }}
							importantForAccessibility="no"
						>
							{leftIcon}
						</View>
					)}
					<RNTextInput
						ref={ref}
						accessible={true}
						accessibilityLabel={computedLabel}
						accessibilityHint={computedHint}
						placeholderTextColor={c.placeholder}
						style={[
							styles.input,
							{
								color: c.onSurface,
								fontSize: theme.typography.sizes.md,
								paddingVertical: inputTokens.paddingY,
							},
							inputStyle,
						]}
						onFocus={(e) => {
							setIsFocused(true);
							onFocus?.(e);
						}}
						onBlur={(e) => {
							setIsFocused(false);
							onBlur?.(e);
						}}
						onChangeText={(nextValue) => {
							onChangeText?.(nextValue);
							onValueChange?.(nextValue, { source: 'input' });
						}}
						{...props}
					/>
					{rightIcon && (
						<View
							style={{ marginLeft: inputTokens.iconGap }}
							importantForAccessibility="no"
						>
							{rightIcon}
						</View>
					)}
				</View>
				{/* Error/helper text is announced via the input's accessibilityHint; kept visual-only here */}
				{!!(error || helperText) && (
					<ThemedText
						importantForAccessibility="no"
						variant="caption"
						style={[
							styles.helper,
							{
								color: error ? c.error : c.onSurfaceVariant,
								marginTop: inputTokens.helperGap,
							},
						]}
					>
						{error || helperText}
					</ThemedText>
				)}
			</View>
		);
	},
);

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
	container: {},
	label: {},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	input: { flex: 1, height: '100%' },
	helper: {},
});
