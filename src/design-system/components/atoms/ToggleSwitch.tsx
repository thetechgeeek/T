import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from './ThemedText';
import { announceForScreenReader, buildFocusRingStyle } from '@/src/utils/accessibility';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

export interface ToggleSwitchProps {
	label?: string;
	description?: string;
	value?: boolean;
	defaultValue?: boolean;
	onValueChange?: (value: boolean, meta?: { source: 'toggle' }) => void;
	disabled?: boolean;
	style?: StyleProp<ViewStyle>;
	testID?: string;
	accessibilityLabel?: string;
}

export const ToggleSwitch = forwardRef<React.ElementRef<typeof Pressable>, ToggleSwitchProps>(
	(
		{
			label,
			description,
			value,
			defaultValue = false,
			onValueChange,
			disabled = false,
			style,
			testID,
			accessibilityLabel,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const toggleTokens = theme.components.toggleSwitch;
		const [isFocused, setIsFocused] = useState(false);
		const [isOn, setIsOn] = useControllableState({
			value,
			defaultValue,
			onChange: (nextValue) => onValueChange?.(nextValue, { source: 'toggle' }),
		});

		const handleToggle = () => {
			if (disabled) {
				return;
			}

			const nextValue = !isOn;
			setIsOn(nextValue, { source: 'toggle' });
			void announceForScreenReader(
				`${label ?? accessibilityLabel ?? 'Switch'} ${nextValue ? 'on' : 'off'}`,
			);
		};

		return (
			<Pressable
				ref={ref}
				testID={testID}
				onPress={handleToggle}
				disabled={disabled}
				focusable={!disabled}
				accessibilityRole="switch"
				accessibilityLabel={accessibilityLabel ?? label ?? 'Toggle setting'}
				accessibilityHint={description}
				accessibilityState={{ checked: isOn, disabled }}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				style={[
					styles.row,
					{
						minHeight: toggleTokens.minHeight,
						gap: toggleTokens.gap,
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
				<View style={styles.copyBlock}>
					{label ? (
						<ThemedText variant="body" style={{ color: c.onSurface }}>
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
				</View>
				<View
					importantForAccessibility="no"
					style={[
						styles.track,
						{
							width: toggleTokens.trackWidth,
							height: toggleTokens.trackHeight,
							borderRadius: theme.borderRadius.full,
							backgroundColor: isOn ? c.primary : c.surfaceVariant,
							justifyContent: isOn ? 'flex-end' : 'flex-start',
						},
					]}
				>
					<View
						style={[
							styles.thumb,
							{
								width: toggleTokens.thumbSize,
								height: toggleTokens.thumbSize,
								borderRadius: theme.borderRadius.full,
								backgroundColor: isOn ? c.onPrimary : c.onSurface,
							},
						]}
					/>
				</View>
			</Pressable>
		);
	},
);

ToggleSwitch.displayName = 'ToggleSwitch';

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	copyBlock: {
		flex: 1,
	},
	track: {
		paddingHorizontal: SPACING_PX.xs,
		flexDirection: 'row',
		alignItems: 'center',
	},
	thumb: {},
});
