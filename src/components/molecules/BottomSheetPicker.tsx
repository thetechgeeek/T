import React, { useState, useMemo } from 'react';
import { Modal, View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { SIZE_BUTTON_HEIGHT_SM, SIZE_INPUT_HEIGHT } from '@/theme/uiMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';
import { SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';

export interface PickerOption {
	label: string;
	value: string;
}

export interface BottomSheetPickerProps {
	visible: boolean;
	title: string;
	options: PickerOption[];
	onSelect: (value: string) => void;
	onClose: () => void;
	selectedValue?: string;
	allowAdd?: boolean;
	onAddNew?: () => void;
}

/**
 * P0.6 — BottomSheetPicker
 * Modal bottom sheet: title, search bar, option list, optional Add New button.
 * Selected option shows green checkmark.
 */
export function BottomSheetPicker({
	visible,
	title,
	options,
	onSelect,
	onClose,
	selectedValue,
	allowAdd = false,
	onAddNew,
}: BottomSheetPickerProps) {
	const { theme } = useTheme();
	const c = theme.colors;
	const [search, setSearch] = useState('');

	const filtered = useMemo(() => {
		const q = search.toLowerCase().trim();
		if (!q) return options;
		return options.filter((o) => o.label.toLowerCase().includes(q));
	}, [options, search]);

	if (!visible) return null;

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
			<Pressable style={[styles.backdrop, { backgroundColor: c.scrim }]} onPress={onClose} />
			<View
				style={[
					styles.sheet,
					{
						backgroundColor: c.surface,
						borderTopLeftRadius: theme.borderRadius.xl,
						borderTopRightRadius: theme.borderRadius.xl,
					},
				]}
			>
				{/* Header */}
				<View style={styles.header}>
					<Text
						style={{
							fontSize: theme.typography.sizes.lg,
							fontWeight: '700',
							color: c.onSurface,
							flex: 1,
						}}
					>
						{title}
					</Text>
					<Pressable
						testID="bottom-sheet-close"
						onPress={onClose}
						accessibilityRole="button"
						accessibilityLabel="Close"
						style={styles.closeBtn}
					>
						<Text style={{ fontSize: FONT_SIZE.h2, color: c.onSurfaceVariant }}>×</Text>
					</Pressable>
				</View>

				{/* Search */}
				<TextInput
					value={search}
					onChangeText={setSearch}
					placeholder="Search..."
					placeholderTextColor={c.placeholder}
					style={[
						styles.search,
						{
							borderColor: c.border,
							borderRadius: theme.borderRadius.full,
							color: c.onSurface,
							fontSize: theme.typography.sizes.md,
						},
					]}
				/>

				{/* Options */}
				<ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
					{filtered.map((option) => {
						const isSelected = option.value === selectedValue;
						return (
							<Pressable
								key={option.value}
								onPress={() => {
									onSelect(option.value);
									onClose();
								}}
								style={[styles.option, { borderBottomColor: c.separator }]}
							>
								<Text
									style={{
										flex: 1,
										fontSize: theme.typography.sizes.md,
										color: c.onSurface,
									}}
								>
									{option.label}
								</Text>
								{isSelected ? (
									<Text
										testID={`check-${option.value}`}
										style={{ color: c.success, fontSize: FONT_SIZE.h3 }}
									>
										✓
									</Text>
								) : null}
							</Pressable>
						);
					})}
				</ScrollView>

				{/* Add New */}
				{allowAdd && onAddNew ? (
					<Pressable
						onPress={onAddNew}
						style={[
							styles.addNew,
							{
								borderTopColor: c.border,
							},
						]}
					>
						<Text
							style={{
								color: c.primary,
								fontSize: theme.typography.sizes.md,
								fontWeight: '600',
							}}
						>
							+ नया जोड़ें / Add new
						</Text>
					</Pressable>
				) : null}
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	sheet: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		maxHeight: '80%',
		paddingBottom: SPACING_PX.xl,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.xl,
		paddingTop: SPACING_PX.xl,
		paddingBottom: SPACING_PX.md,
	},
	closeBtn: {
		width: SPACING_PX['2xl'],
		height: SPACING_PX['2xl'],
		alignItems: 'center',
		justifyContent: 'center',
	},
	search: {
		marginHorizontal: SPACING_PX.lg,
		marginBottom: SPACING_PX.sm,
		borderWidth: 1,
		paddingHorizontal: SPACING_PX.lg,
		height: SIZE_BUTTON_HEIGHT_SM,
	},
	list: {
		flex: 1,
	},
	option: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: SPACING_PX.xl,
		paddingVertical: SPACING_PX.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
		minHeight: TOUCH_TARGET_MIN_PX,
	},
	addNew: {
		paddingHorizontal: SPACING_PX.xl,
		paddingVertical: SPACING_PX.lg,
		borderTopWidth: 1,
		minHeight: SIZE_INPUT_HEIGHT,
		justifyContent: 'center',
	},
});
