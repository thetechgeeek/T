import { View, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle, TextInputProps } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { TextInput as AtomTextInput } from '@/src/components/atoms/TextInput';
import { layout } from '@/src/theme/layout';

export interface FormFieldProps extends TextInputProps {
	label: string;
	/** Stable English identifier passed to the underlying input. Screen readers and Maestro use this. */
	accessibilityLabel?: string;
	error?: string;
	required?: boolean;
	helperText?: string;
	editable?: boolean;
	containerStyle?: StyleProp<ViewStyle>;
}

export const FormField: React.FC<FormFieldProps> = ({
	label,
	accessibilityLabel,
	error,
	required,
	helperText,
	editable,
	containerStyle,
	...props
}) => {
	const { theme } = useTheme();
	const c = theme.colors;

	// Compose a full hint so required/error state is announced with the field
	const hint =
		[required ? 'Required' : null, error ? `Error: ${error}` : (helperText ?? null)]
			.filter(Boolean)
			.join('. ') || undefined;

	return (
		<View style={[styles.container, containerStyle]}>
			{/* Visual label row — hidden from a11y tree; input carries the label */}
			<View importantForAccessibility="no" style={[layout.row, { marginBottom: 4 }]}>
				<ThemedText variant="label" color={c.onSurfaceVariant}>
					{label}
				</ThemedText>
				{required && (
					<ThemedText color={c.error} style={{ marginLeft: 2 }}>
						*
					</ThemedText>
				)}
			</View>
			<AtomTextInput
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
					style={{ marginTop: 4 }}
				>
					{error || helperText}
				</ThemedText>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: 16,
	},
});
