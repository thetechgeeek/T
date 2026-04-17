import React, { forwardRef, useEffect, useMemo, useRef } from 'react';
import { TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

function splitCode(value: string, length: number) {
	return Array.from({ length }, (_, index) => value[index] ?? '');
}

export interface OtpCodeInputProps {
	label: string;
	value?: string;
	defaultValue?: string;
	onChange: (value: string) => void;
	onValueChange?: (value: string, meta?: { source: 'input' }) => void;
	length?: number;
	masked?: boolean;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export const OtpCodeInput = forwardRef<View, OtpCodeInputProps>(
	(
		{
			label,
			value,
			defaultValue = '',
			onChange,
			onValueChange,
			length = 6,
			masked = false,
			testID,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const inputRefs = useRef<Array<TextInput | null>>([]);
		const [currentValue, setCurrentValue] = useControllableState({
			value,
			defaultValue,
			onChange: (nextValue) => {
				onChange(nextValue);
				onValueChange?.(nextValue, { source: 'input' });
			},
		});
		const cells = useMemo(() => splitCode(currentValue, length), [currentValue, length]);

		useEffect(() => {
			if (currentValue.length === 0) {
				inputRefs.current[0]?.focus();
			}
		}, [currentValue.length]);

		return (
			<View ref={ref} testID={testID} style={style}>
				<ThemedText
					variant="label"
					style={{ color: c.onSurfaceVariant, marginBottom: theme.spacing.xs }}
				>
					{label}
				</ThemedText>
				<View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
					{cells.map((cell, index) => (
						<TextInput
							key={`${label}-${index}`}
							ref={(element) => {
								inputRefs.current[index] = element;
							}}
							testID={`${testID ?? 'otp'}-${index}`}
							value={masked && cell ? '•' : cell}
							onChangeText={(nextValue) => {
								const sanitized = nextValue.replace(/\D/g, '');
								const digits =
									sanitized.length > 1 ? sanitized.slice(0, length) : sanitized;
								if (digits.length > 1) {
									setCurrentValue(digits, { source: 'input' });
									inputRefs.current[Math.min(digits.length, length) - 1]?.focus();
									return;
								}

								const nextCells = [...cells];
								nextCells[index] = digits;
								const nextCode = nextCells.join('').slice(0, length);
								setCurrentValue(nextCode, { source: 'input' });
								if (digits && index < length - 1) {
									inputRefs.current[index + 1]?.focus();
								}
							}}
							onKeyPress={(event) => {
								if (
									event.nativeEvent.key === 'Backspace' &&
									!cells[index] &&
									index > 0
								) {
									inputRefs.current[index - 1]?.focus();
								}
							}}
							keyboardType="number-pad"
							maxLength={length}
							autoComplete={index === 0 ? 'sms-otp' : 'off'}
							textContentType={index === 0 ? 'oneTimeCode' : 'none'}
							accessibilityLabel={`${label} digit ${index + 1}`}
							style={{
								flex: 1,
								minHeight: 48,
								borderWidth: theme.borderWidth.sm,
								borderColor: c.border,
								borderRadius: theme.borderRadius.md,
								textAlign: 'center',
								color: c.onSurface,
								fontSize: theme.typography.sizes.lg,
							}}
						/>
					))}
				</View>
			</View>
		);
	},
);

OtpCodeInput.displayName = 'OtpCodeInput';
