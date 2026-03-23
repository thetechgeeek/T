import React, { forwardRef } from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet, type TextInputProps as RNTextInputProps, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  helperText?: string;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  helperText,
  ...props
}, ref) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const s = theme.spacing;
  const r = theme.borderRadius;

  const isFocused = false; // We can add onFocus/onBlur state if needed
  const borderColor = error ? c.error : (isFocused ? c.primary : c.border);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: c.onSurfaceVariant, fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.medium }]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputContainer,
        { backgroundColor: c.surface, borderColor, borderRadius: r.md, borderWidth: 1 }
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <RNTextInput
          ref={ref}
          placeholderTextColor={c.placeholder}
          style={[
            styles.input,
            { color: c.onSurface, fontSize: theme.typography.sizes.md },
            inputStyle
          ]}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {!!(error || helperText) && (
        <Text style={[
          styles.helper,
          { color: error ? c.error : c.onSurfaceVariant, fontSize: theme.typography.sizes.xs }
        ]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
});

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { marginBottom: 6 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingHorizontal: 12 },
  input: { flex: 1, height: '100%', paddingVertical: 10 },
  leftIcon: { marginRight: 8 },
  rightIcon: { marginLeft: 8 },
  helper: { marginTop: 4 },
});
