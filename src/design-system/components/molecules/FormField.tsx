import React, { forwardRef } from 'react';
import { View, StyleSheet, TextInput as NativeTextInput } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../foundation/theme/ThemeProvider';
import { ThemedText } from '../atoms/ThemedText';
import {
	TextInput as AtomTextInput,
	type TextInputProps as AtomTextInputProps,
} from '../atoms/TextInput';
import { layout } from '../../foundation/theme/layout';
import { SPACING_PX } from '../../foundation/theme/layoutMetrics';

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

export const FormField = React.memo(
	forwardRef<NativeTextInput, FormFieldProps>(
		(
			{
				label,
				accessibilityLabel,
				error,
				required,
				helperText,
				warningText,
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
				[
					required ? 'Required' : null,
					error
						? `Error: ${error}`
						: warningText
							? `Warning: ${warningText}`
							: (helperText ?? null),
				]
					.filter(Boolean)
					.join('. ') || undefined;
			const footerCopy = error || warningText || helperText;
			const footerColor = error ? c.error : warningText ? c.warning : c.onSurfaceVariant;

			return (
				<View style={[styles.container, containerStyle]}>
					{/* Visual label row — hidden from a11y tree; input carries the label */}
					<View
						importantForAccessibility="no"
						style={[layout.row, styles.labelRow, { marginBottom: theme.spacing.xs }]}
					>
						<ThemedText
							variant="label"
							color={c.onSurfaceVariant}
							style={styles.labelText}
						>
							{label}
						</ThemedText>
						{required && (
							<ThemedText color={c.error} style={{ marginStart: theme.spacing.xxs }}>
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
						helperText={undefined}
						label={undefined}
						warningText={undefined}
					/>
					{/* Error copy stays live; helper and warning copy remain visible and readable. */}
					{!!footerCopy &&
						(error ? (
							<ThemedText
								accessibilityRole="alert"
								variant="caption"
								color={footerColor}
								style={{ marginTop: theme.spacing.xs }}
							>
								{footerCopy}
							</ThemedText>
						) : (
							<ThemedText
								variant="caption"
								color={footerColor}
								style={{ marginTop: theme.spacing.xs }}
							>
								{footerCopy}
							</ThemedText>
						))}
				</View>
			);
		},
	),
);

FormField.displayName = 'FormField';

const styles = StyleSheet.create({
	container: {
		marginBottom: SPACING_PX.lg,
	},
	labelRow: {
		alignItems: 'flex-start',
		flexWrap: 'wrap',
	},
	labelText: {
		flexShrink: 1,
	},
});
