import React from 'react';
import { Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

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
}: FilterBarProps) {
	const { theme } = useTheme();
	const c = theme.colors;

	const showClear =
		defaultValue !== undefined && activeValue !== defaultValue && onClear !== undefined;

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={styles.container}
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
								fontSize: 13,
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
					<Text style={{ fontSize: 13, color: c.error, fontWeight: '600' }}>Clear</Text>
				</Pressable>
			) : null}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 8,
		gap: 8,
	},
	chip: {
		height: 36,
		paddingHorizontal: 12,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
