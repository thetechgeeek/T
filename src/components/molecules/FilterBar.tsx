import React, { forwardRef, useState } from 'react';
import {
	Pressable,
	ScrollView,
	StyleSheet,
	type ScrollView as NativeScrollView,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { announceForScreenReader, buildFocusRingStyle } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';
import { SIZE_CHIP_HEIGHT } from '@/theme/uiMetrics';

export interface FilterOption {
	label: string;
	value: string;
}

export interface FilterBarProps {
	filters: FilterOption[];
	activeValue?: string;
	value?: string;
	onSelect: (value: string) => void;
	onValueChange?: (value: string, meta?: { source: 'selection' | 'clear' }) => void;
	defaultValue?: string;
	onClear?: () => void;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

/**
 * P0.7 — FilterBar
 * Horizontal scrollable chip bar. Active chip: terracotta fill.
 * Inactive chip: white bg + terracotta border/text.
 * Shows "Clear" chip when non-default filter is active.
 */
export const FilterBar = forwardRef<NativeScrollView, FilterBarProps>(
	(
		{
			filters,
			activeValue,
			value,
			onSelect,
			onValueChange,
			defaultValue,
			onClear,
			style,
			testID,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [focusedValue, setFocusedValue] = useState<string | null>(null);
		const [currentValue, setCurrentValue] = useControllableState({
			value: value ?? activeValue,
			defaultValue: defaultValue ?? filters[0]?.value ?? '',
			onChange: (nextValue, meta) => {
				onSelect(nextValue);
				onValueChange?.(nextValue, {
					source: meta?.source === 'clear' ? 'clear' : 'selection',
				});
			},
		});

		const showClear =
			defaultValue !== undefined && currentValue !== defaultValue && onClear !== undefined;

		return (
			<ScrollView
				ref={ref}
				testID={testID}
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={[styles.container, style]}
				keyboardShouldPersistTaps="handled"
			>
				{filters.map((filter) => {
					const isActive = filter.value === currentValue;
					const isFocused = filter.value === focusedValue;
					return (
						<Pressable
							key={filter.value}
							testID={
								isActive ? `chip-${filter.value}-active` : `chip-${filter.value}`
							}
							onPress={() => {
								setCurrentValue(filter.value, { source: 'selection' });
								void announceForScreenReader(`${filter.label} filter selected`);
							}}
							onFocus={() => setFocusedValue(filter.value)}
							onBlur={() => setFocusedValue(null)}
							accessibilityRole="button"
							accessibilityLabel={filter.label}
							accessibilityState={{ selected: isActive }}
							style={[
								styles.chip,
								{
									backgroundColor: isActive ? c.primary : c.surface,
									borderColor: c.primary,
									borderRadius: theme.borderRadius.full,
								},
								isFocused
									? buildFocusRingStyle({
											color: c.primary,
											radius: theme.borderRadius.full,
										})
									: null,
							]}
						>
							<ThemedText
								variant="caption"
								weight={isActive ? 'semibold' : 'regular'}
								style={{
									fontSize: FONT_SIZE.label,
									color: isActive ? c.onPrimary : c.primary,
								}}
							>
								{filter.label}
							</ThemedText>
						</Pressable>
					);
				})}

				{showClear ? (
					<Pressable
						testID="chip-clear"
						onPress={() => {
							const clearedValue = defaultValue ?? '';
							setCurrentValue(clearedValue, { source: 'clear' });
							onClear?.();
							void announceForScreenReader('Filters cleared');
						}}
						accessibilityRole="button"
						accessibilityLabel="Clear filters"
						style={[
							styles.chip,
							{
								backgroundColor: c.errorLight,
								borderColor: c.error,
								borderRadius: theme.borderRadius.full,
							},
						]}
					>
						<ThemedText
							variant="caption"
							weight="semibold"
							style={{ fontSize: FONT_SIZE.label, color: c.error }}
						>
							Clear
						</ThemedText>
					</Pressable>
				) : null}
			</ScrollView>
		);
	},
);

FilterBar.displayName = 'FilterBar';

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		gap: SPACING_PX.sm,
	},
	chip: {
		height: SIZE_CHIP_HEIGHT,
		paddingHorizontal: SPACING_PX.md,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
