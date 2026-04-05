import React, { forwardRef, useState } from 'react';
import {
	View,
	TextInput as RNTextInput,
	Text,
	StyleSheet,
	type TextInputProps as RNTextInputProps,
	type StyleProp,
	type ViewStyle,
	type TextStyle,
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

export interface TextInputProps extends RNTextInputProps {
	label?: string;
	/** Stable English identifier for screen readers and Maestro. Takes precedence over label. */
	accessibilityLabel?: string;
	error?: string;
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
			onFocus,
			onBlur,
			...props
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const r = theme.borderRadius;

		const [isFocused, setIsFocused] = useState(false);
		const borderColor = error ? c.error : isFocused ? c.primary : c.border;

		// Build a composed hint so error/helper is announced alongside the field
		const computedLabel = accessibilityLabel ?? label ?? undefined;
		const computedHint = error ? `Error: ${error}` : (helperText ?? undefined);

		return (
			<View style={[styles.container, containerStyle]}>
				{label && (
					<Text
						importantForAccessibility="no"
						style={[
							styles.label,
							{
								color: c.onSurfaceVariant,
								fontSize: theme.typography.sizes.sm,
								fontWeight: theme.typography.weights.medium,
							},
						]}
					>
						{label}
					</Text>
				)}
				<View
					style={[
						styles.inputContainer,
						{
							backgroundColor: c.surface,
							borderColor,
							borderRadius: r.md,
							borderWidth: 1,
						},
					]}
				>
					{leftIcon && (
						<View style={styles.leftIcon} importantForAccessibility="no">
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
							{ color: c.onSurface, fontSize: theme.typography.sizes.md },
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
						{...props}
					/>
					{rightIcon && (
						<View style={styles.rightIcon} importantForAccessibility="no">
							{rightIcon}
						</View>
					)}
				</View>
				{/* Error/helper text is announced via the input's accessibilityHint; kept visual-only here */}
				{!!(error || helperText) && (
					<Text
						importantForAccessibility="no"
						style={[
							styles.helper,
							{
								color: error ? c.error : c.onSurfaceVariant,
								fontSize: theme.typography.sizes.xs,
							},
						]}
					>
						{error || helperText}
					</Text>
				)}
			</View>
		);
	},
);

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
	container: {},
	label: { marginBottom: 6 },
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: 48,
		paddingHorizontal: 12,
	},
	input: { flex: 1, height: '100%', paddingVertical: 10 },
	leftIcon: { marginRight: 8 },
	rightIcon: { marginLeft: 8 },
	helper: { marginTop: 4 },
});
