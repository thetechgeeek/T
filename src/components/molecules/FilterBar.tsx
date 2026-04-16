import React from 'react';
import {
	Text,
	Pressable,
	ScrollView,
	StyleSheet,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';
import { SIZE_CHIP_HEIGHT } from '@/theme/uiMetrics';

export interface FilterOption {
	label: string;
	value: string;
}

export interface FilterBarProps {
	filters: FilterOption[];
	activeValue: string;
	onSelect: (value: string) => void;
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
export function FilterBar({
	filters,
	activeValue,
	onSelect,
	defaultValue,
	onClear,
	style,
	testID,
}: FilterBarProps) {
	const { theme } = useTheme();
	const c = theme.colors;

	const showClear =
		defaultValue !== undefined && activeValue !== defaultValue && onClear !== undefined;

	return (
		<ScrollView
			testID={testID}
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={[styles.container, style]}
			keyboardShouldPersistTaps="handled"
		>
			{filters.map((filter) => {
				const isActive = filter.value === activeValue;
				return (
					<Pressable
						key={filter.value}
						testID={isActive ? `chip-${filter.value}-active` : `chip-${filter.value}`}
						onPress={() => onSelect(filter.value)}
						accessibilityRole="button"
						accessibilityState={{ selected: isActive }}
						style={[
							styles.chip,
							{
								backgroundColor: isActive ? c.primary : c.surface,
								borderColor: c.primary,
								borderRadius: theme.borderRadius.full,
							},
						]}
					>
						<Text
							style={{
								fontSize: FONT_SIZE.label,
								color: isActive ? c.onPrimary : c.primary,
								fontWeight: isActive ? '600' : '400',
							}}
						>
							{filter.label}
						</Text>
					</Pressable>
				);
			})}

			{showClear ? (
				<Pressable
					testID="chip-clear"
					onPress={onClear}
					accessibilityRole="button"
					style={[
						styles.chip,
						{
							backgroundColor: c.errorLight,
							borderColor: c.error,
							borderRadius: theme.borderRadius.full,
						},
					]}
				>
					<Text style={{ fontSize: FONT_SIZE.label, color: c.error, fontWeight: '600' }}>
						Clear
					</Text>
				</Pressable>
			) : null}
		</ScrollView>
	);
}

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
