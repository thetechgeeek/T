import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Check, Minus } from 'lucide-react-native';
import { LucideIconGlyph } from '@/src/design-system/iconography';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from './ThemedText';
import { announceForScreenReader, buildFocusRingStyle } from '@/src/utils/accessibility';
import { SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';

export interface CheckboxProps {
	label: string;
	description?: string;
	checked?: boolean;
	defaultChecked?: boolean;
	indeterminate?: boolean;
	onCheckedChange?: (checked: boolean, meta?: { source: 'toggle' }) => void;
	disabled?: boolean;
	style?: StyleProp<ViewStyle>;
	testID?: string;
	accessibilityLabel?: string;
}

export interface CheckboxGroupOption {
	label: string;
	value: string;
	description?: string;
	disabled?: boolean;
	testID?: string;
}

export interface CheckboxGroupProps {
	label?: string;
	description?: string;
	options: readonly CheckboxGroupOption[];
	values?: readonly string[];
	defaultValues?: readonly string[];
	onValuesChange?: (values: string[], meta?: { source: 'toggle' }) => void;
	style?: StyleProp<ViewStyle>;
	testID?: string;
	accessibilityLabel?: string;
}

function toggleGroupValue(values: readonly string[], targetValue: string) {
	return values.includes(targetValue)
		? values.filter((value) => value !== targetValue)
		: [...values, targetValue];
}

export const Checkbox = forwardRef<React.ElementRef<typeof Pressable>, CheckboxProps>(
	(
		{
			label,
			description,
			checked,
			defaultChecked = false,
			indeterminate = false,
			onCheckedChange,
			disabled = false,
			style,
			testID,
			accessibilityLabel,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const selectionTokens = theme.components.selectionControl;
		const [isFocused, setIsFocused] = useState(false);
		const [isChecked, setIsChecked] = useControllableState({
			value: checked,
			defaultValue: defaultChecked,
			onChange: (nextChecked) => onCheckedChange?.(nextChecked, { source: 'toggle' }),
		});
		const isMixed = indeterminate && !isChecked;
		const visualChecked = isChecked || isMixed;
		const checkboxState: boolean | 'mixed' = isMixed ? 'mixed' : isChecked;

		const handleToggle = () => {
			if (disabled) {
				return;
			}

			const nextChecked = isMixed ? true : !isChecked;
			setIsChecked(nextChecked, { source: 'toggle' });
			void announceForScreenReader(`${label} ${nextChecked ? 'checked' : 'unchecked'}`);
		};

		return (
			<Pressable
				ref={ref}
				testID={testID}
				onPress={handleToggle}
				disabled={disabled}
				focusable={!disabled}
				accessibilityRole="checkbox"
				accessibilityLabel={accessibilityLabel ?? label}
				accessibilityHint={description}
				accessibilityState={{ checked: checkboxState, disabled }}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				style={[
					styles.row,
					{
						minHeight: TOUCH_TARGET_MIN_PX,
						gap: selectionTokens.gap,
						opacity: disabled ? theme.opacity.inactive : 1,
					},
					isFocused
						? buildFocusRingStyle({
								color: c.primary,
								radius: theme.borderRadius.md,
							})
						: null,
					style,
				]}
			>
				<View
					importantForAccessibility="no"
					style={[
						styles.control,
						{
							width: selectionTokens.size,
							height: selectionTokens.size,
							borderRadius: selectionTokens.radius,
							borderWidth: selectionTokens.borderWidth,
							borderColor: visualChecked ? c.primary : c.borderStrong,
							backgroundColor: visualChecked ? c.primary : c.surface,
						},
					]}
				>
					{isMixed ? (
						<LucideIconGlyph
							icon={Minus}
							size={selectionTokens.indicatorSize}
							color={c.onPrimary}
						/>
					) : isChecked ? (
						<LucideIconGlyph
							icon={Check}
							size={selectionTokens.indicatorSize}
							color={c.onPrimary}
						/>
					) : null}
				</View>
				<View style={styles.copyBlock}>
					<ThemedText variant="body" style={{ color: c.onSurface }}>
						{label}
					</ThemedText>
					{description ? (
						<ThemedText
							variant="caption"
							style={{
								color: c.onSurfaceVariant,
								marginTop: selectionTokens.descriptionGap,
							}}
						>
							{description}
						</ThemedText>
					) : null}
				</View>
			</Pressable>
		);
	},
);

Checkbox.displayName = 'Checkbox';

export const CheckboxGroup = forwardRef<React.ElementRef<typeof View>, CheckboxGroupProps>(
	(
		{
			label,
			description,
			options,
			values,
			defaultValues = [],
			onValuesChange,
			style,
			testID,
			accessibilityLabel,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [currentValues, setCurrentValues] = useControllableState({
			value: values ? [...values] : undefined,
			defaultValue: [...defaultValues],
			onChange: (nextValues) => onValuesChange?.(nextValues, { source: 'toggle' }),
		});

		return (
			<View ref={ref} testID={testID} style={[styles.group, style]}>
				{label ? (
					<ThemedText
						accessibilityLabel={accessibilityLabel ?? label}
						variant="label"
						style={{ color: c.onSurface }}
					>
						{label}
					</ThemedText>
				) : null}
				{description ? (
					<ThemedText
						variant="caption"
						style={{ color: c.onSurfaceVariant, marginTop: theme.spacing.xxs }}
					>
						{description}
					</ThemedText>
				) : null}
				<View style={{ marginTop: theme.spacing.sm, gap: theme.spacing.xs }}>
					{options.map((option) => (
						<Checkbox
							key={option.value}
							testID={option.testID}
							label={option.label}
							description={option.description}
							checked={currentValues.includes(option.value)}
							disabled={option.disabled}
							onCheckedChange={() =>
								setCurrentValues(toggleGroupValue(currentValues, option.value), {
									source: 'toggle',
								})
							}
						/>
					))}
				</View>
			</View>
		);
	},
);

CheckboxGroup.displayName = 'CheckboxGroup';

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	control: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	copyBlock: {
		flex: 1,
	},
	group: {
		gap: SPACING_PX.xs,
	},
});
