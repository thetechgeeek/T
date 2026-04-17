import React, { forwardRef } from 'react';
import { View, StyleSheet, TextInput as NativeTextInput } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import {
	TextInput as AtomTextInput,
	type TextInputProps as AtomTextInputProps,
} from '@/src/components/atoms/TextInput';
import { layout } from '@/src/theme/layout';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

export interface FormFieldProps extends AtomTextInputProps {
	label: string;
	/** Stable English identifier passed to the underlying input. Screen readers and Maestro use this. */
	accessibilityLabel?: string;
	/** Stable automation handle forwarded to the underlying input. */
	testID?: string;
	error?: string;
	required?: boolean;
	helperText?: string;
	editable?: boolean;
	containerStyle?: StyleProp<ViewStyle>;
}

export const FormField = forwardRef<NativeTextInput, FormFieldProps>(
	(
		{
			label,
			accessibilityLabel,
			error,
			required,
			helperText,
			editable,
			containerStyle,
			...props
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;

		// Compose a full hint so required/error state is announced with the field.
		const hint =
			[required ? 'Required' : null, error ? `Error: ${error}` : (helperText ?? null)]
				.filter(Boolean)
				.join('. ') || undefined;

		return (
			<View style={[styles.container, containerStyle]}>
				{/* Visual label row — hidden from a11y tree; input carries the label */}
				<View
					importantForAccessibility="no"
					style={[layout.row, { marginBottom: theme.spacing.xs }]}
				>
					<ThemedText variant="label" color={c.onSurfaceVariant}>
						{label}
					</ThemedText>
					{required && (
						<ThemedText color={c.error} style={{ marginLeft: theme.spacing.xxs }}>
							*
						</ThemedText>
					)}
				</View>
				<AtomTextInput
					ref={ref}
					{...props}
					editable={editable}
					accessibilityLabel={accessibilityLabel ?? label}
					accessibilityHint={hint}
					error={undefined}
					label={undefined}
				/>
				{/* Visual error/helper — announced via input hint, kept visual-only */}
				{!!(error || helperText) && (
					<ThemedText
						importantForAccessibility="no"
						variant="caption"
						color={error ? c.error : c.onSurfaceVariant}
						style={{ marginTop: theme.spacing.xs }}
					>
						{error || helperText}
					</ThemedText>
				)}
			</View>
		);
	},
);

FormField.displayName = 'FormField';

const styles = StyleSheet.create({
	container: {
		marginBottom: SPACING_PX.lg,
	},
});
