import React, { useState, useMemo } from 'react';
import { Modal, View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

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
						<Text style={{ fontSize: 20, color: c.onSurfaceVariant }}>×</Text>
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
										style={{ color: c.success, fontSize: 18 }}
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
		paddingBottom: 24,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 12,
	},
	closeBtn: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
	search: {
		marginHorizontal: 16,
		marginBottom: 8,
		borderWidth: 1,
		paddingHorizontal: 16,
		height: 44,
	},
	list: {
		flex: 1,
	},
	option: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 14,
		borderBottomWidth: StyleSheet.hairlineWidth,
		minHeight: 48,
	},
	addNew: {
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderTopWidth: 1,
		minHeight: 52,
		justifyContent: 'center',
	},
});
