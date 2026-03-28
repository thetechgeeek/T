import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { TextInput as AtomTextInput } from '@/src/components/atoms/TextInput';
import type { TextInputProps } from 'react-native';
import { layout } from '@/src/theme/layout';

export interface FormFieldProps extends TextInputProps {
	label: string;
	error?: string;
	required?: boolean;
	helperText?: string;
	editable?: boolean;
	containerStyle?: any;
}

export const FormField: React.FC<FormFieldProps> = ({
	label,
	error,
	required,
	helperText,
	editable,
	containerStyle,
	...props
}) => {
	const { theme } = useTheme();
	const c = theme.colors;

	return (
		<View style={[styles.container, containerStyle]}>
			<View style={[layout.row, { marginBottom: 4 }]}>
				<ThemedText variant="label" color={c.onSurfaceVariant}>
					{label}
				</ThemedText>
				{required && (
					<ThemedText color={c.error} style={{ marginLeft: 2 }}>
						*
					</ThemedText>
				)}
			</View>
			<AtomTextInput {...props} editable={editable} error={undefined} label={undefined} />
			{!!(error || helperText) && (
				<ThemedText
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
