import React, { forwardRef, useState } from 'react';
import {
	View,
	Pressable,
	ActivityIndicator,
	TextInput as RNTextInput,
	StyleSheet,
	type TextInputProps as RNTextInputProps,
	type StyleProp,
	type ViewStyle,
	type TextStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { LucideIconGlyph } from '@/src/design-system/iconography';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { ThemedText } from './ThemedText';

export interface TextInputProps extends RNTextInputProps {
	label?: string;
	/** Stable English identifier for screen readers and Maestro. Takes precedence over label. */
	accessibilityLabel?: string;
	error?: string;
	onValueChange?: (value: string, meta?: { source: 'input' | 'clear' }) => void;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	containerStyle?: StyleProp<ViewStyle>;
	inputStyle?: StyleProp<TextStyle>;
	helperText?: string;
	warningText?: string;
	loading?: boolean;
	clearable?: boolean;
	clearAccessibilityLabel?: string;
	showCharacterCount?: boolean;
	onClear?: () => void;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
	(
		{
			label,
			accessibilityLabel,
			error,
			warningText,
			leftIcon,
			rightIcon,
			containerStyle,
			inputStyle,
			helperText,
			loading = false,
			clearable = false,
			clearAccessibilityLabel = 'Clear input',
			showCharacterCount = false,
			onClear,
			value,
			defaultValue = '',
			editable = true,
			readOnly = false,
			accessibilityState,
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
		const isDisabled = !editable;
		const isInteractive = editable && !readOnly;
		const [currentValue, setCurrentValue] = useControllableState({
			value,
			defaultValue,
			onChange: (nextValue, meta) => {
				onChangeText?.(nextValue);
				onValueChange?.(nextValue, {
					source: meta?.source === 'clear' ? 'clear' : 'input',
				});
			},
		});
		const characterCount = currentValue.length;
		const footerMessage = error || warningText || helperText;
		const footerTone = error ? 'error' : warningText ? 'warning' : 'helper';
		const hasFooter = Boolean(footerMessage) || showCharacterCount;
		const borderColor = error
			? c.error
			: warningText
				? c.warning
				: isFocused
					? c.primary
					: c.border;
		const backgroundColor = isDisabled || readOnly ? c.surfaceVariant : c.surface;

		// Build a composed hint so error/helper is announced alongside the field
		const computedLabel = accessibilityLabel ?? label ?? undefined;
		const computedHint = error
			? `Error: ${error}`
			: warningText
				? `Warning: ${warningText}`
				: (helperText ?? undefined);
		const canClear = clearable && isInteractive && currentValue.length > 0;

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
							backgroundColor,
							borderColor,
							borderRadius: inputTokens.radius,
							borderWidth: error
								? inputTokens.errorBorderWidth
								: inputTokens.borderWidth,
							minHeight: inputTokens.minHeight,
							paddingHorizontal: inputTokens.paddingX,
							opacity: isDisabled ? theme.opacity.inactive : 1,
						},
					]}
				>
					{leftIcon && (
						<View
							style={{ marginEnd: inputTokens.iconGap }}
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
						accessibilityState={{
							...accessibilityState,
							busy: loading || accessibilityState?.busy,
							disabled: isDisabled || accessibilityState?.disabled,
						}}
						placeholderTextColor={c.placeholder}
						style={[
							styles.input,
							{
								color: isDisabled ? c.onSurfaceVariant : c.onSurface,
								fontSize: theme.typography.sizes.md,
								fontFamily: theme.typography.fontFamily,
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
						value={currentValue}
						defaultValue={undefined}
						editable={editable}
						readOnly={readOnly}
						onChangeText={(nextValue) =>
							setCurrentValue(nextValue, { source: 'input' })
						}
						{...props}
					/>
					{(rightIcon || loading || canClear) && (
						<View style={[styles.accessoryRow, { marginStart: inputTokens.iconGap }]}>
							{rightIcon ? (
								<View importantForAccessibility="no">{rightIcon}</View>
							) : null}
							{loading ? (
								<ActivityIndicator
									size="small"
									color={c.primary}
									accessibilityLabel="Input loading"
								/>
							) : null}
							{canClear ? (
								<Pressable
									hitSlop={10}
									accessibilityRole="button"
									accessibilityLabel={clearAccessibilityLabel}
									onPress={() => {
										setCurrentValue('', { source: 'clear' });
										onClear?.();
									}}
								>
									<LucideIconGlyph
										icon={X}
										size={16}
										color={c.onSurfaceVariant}
									/>
								</Pressable>
							) : null}
						</View>
					)}
				</View>
				{/* Footer copy is announced via the input hint and remains visual-only here. */}
				{hasFooter && (
					<View
						importantForAccessibility="no"
						style={[
							styles.footerRow,
							{
								marginTop: inputTokens.helperGap,
							},
						]}
					>
						<View style={styles.footerMessage}>
							{footerMessage ? (
								<ThemedText
									variant="caption"
									style={[
										styles.helper,
										{
											color:
												footerTone === 'error'
													? c.error
													: footerTone === 'warning'
														? c.warning
														: c.onSurfaceVariant,
										},
									]}
								>
									{footerMessage}
								</ThemedText>
							) : null}
						</View>
						{showCharacterCount ? (
							<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
								{props.maxLength
									? `${characterCount}/${props.maxLength}`
									: characterCount}
							</ThemedText>
						) : null}
					</View>
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
	accessoryRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING_PX.xs,
	},
	input: { flex: 1, height: '100%' },
	footerRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		gap: SPACING_PX.xs,
	},
	footerMessage: {
		flex: 1,
	},
	helper: {},
});
