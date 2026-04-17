import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from './ThemedText';
import { announceForScreenReader, buildFocusRingStyle } from '@/src/utils/accessibility';
import { SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';
import { SIZE_RADIO_INNER } from '@/src/theme/uiMetrics';

export interface RadioProps {
	label: string;
	description?: string;
	selected?: boolean;
	defaultSelected?: boolean;
	onSelectedChange?: (selected: boolean, meta?: { source: 'selection' }) => void;
	disabled?: boolean;
	style?: StyleProp<ViewStyle>;
	testID?: string;
	accessibilityLabel?: string;
}

export interface RadioGroupOption {
	label: string;
	value: string;
	description?: string;
	disabled?: boolean;
	testID?: string;
}

export interface RadioGroupProps {
	label?: string;
	description?: string;
	options: readonly RadioGroupOption[];
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string, meta?: { source: 'selection' }) => void;
	style?: StyleProp<ViewStyle>;
	testID?: string;
	accessibilityLabel?: string;
}

export const Radio = forwardRef<React.ElementRef<typeof Pressable>, RadioProps>(
	(
		{
			label,
			description,
			selected,
			defaultSelected = false,
			onSelectedChange,
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
		const [isSelected, setIsSelected] = useControllableState({
			value: selected,
			defaultValue: defaultSelected,
			onChange: (nextSelected) => onSelectedChange?.(nextSelected, { source: 'selection' }),
		});

		const handleSelect = () => {
			if (disabled || isSelected) {
				return;
			}

			setIsSelected(true, { source: 'selection' });
			void announceForScreenReader(`${label} selected`);
		};

		return (
			<Pressable
				ref={ref}
				testID={testID}
				onPress={handleSelect}
				disabled={disabled}
				focusable={!disabled}
				accessibilityRole="radio"
				accessibilityLabel={accessibilityLabel ?? label}
				accessibilityHint={description}
				accessibilityState={{ selected: isSelected, disabled }}
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
						styles.outerControl,
						{
							width: selectionTokens.size,
							height: selectionTokens.size,
							borderRadius: theme.borderRadius.full,
							borderWidth: selectionTokens.borderWidth,
							borderColor: isSelected ? c.primary : c.borderStrong,
						},
					]}
				>
					{isSelected ? (
						<View
							style={[
								styles.innerControl,
								{
									width: SIZE_RADIO_INNER,
									height: SIZE_RADIO_INNER,
									borderRadius: theme.borderRadius.full,
									backgroundColor: c.primary,
								},
							]}
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

Radio.displayName = 'Radio';

export const RadioGroup = forwardRef<React.ElementRef<typeof View>, RadioGroupProps>(
	(
		{
			label,
			description,
			options,
			value,
			defaultValue = options[0]?.value ?? '',
			onValueChange,
			style,
			testID,
			accessibilityLabel,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [currentValue, setCurrentValue] = useControllableState({
			value,
			defaultValue,
			onChange: (nextValue) => onValueChange?.(nextValue, { source: 'selection' }),
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
						<Radio
							key={option.value}
							testID={option.testID}
							label={option.label}
							description={option.description}
							disabled={option.disabled}
							selected={currentValue === option.value}
							onSelectedChange={(nextSelected) => {
								if (nextSelected) {
									setCurrentValue(option.value, { source: 'selection' });
								}
							}}
						/>
					))}
				</View>
			</View>
		);
	},
);

RadioGroup.displayName = 'RadioGroup';

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	outerControl: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
	},
	innerControl: {},
	copyBlock: {
		flex: 1,
	},
	group: {
		gap: SPACING_PX.xs,
	},
});
