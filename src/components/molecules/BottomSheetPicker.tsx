import React, { forwardRef, useMemo, useState } from 'react';
import {
	Modal,
	View,
	Pressable,
	ScrollView,
	TextInput,
	StyleSheet,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { announceForScreenReader, buildFocusRingStyle } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { SIZE_BUTTON_HEIGHT_SM, SIZE_INPUT_HEIGHT } from '@/theme/uiMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';
import { SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';

export interface PickerOption {
	label: string;
	value: string;
}

export interface BottomSheetPickerProps {
	visible?: boolean;
	open?: boolean;
	defaultOpen?: boolean;
	title: string;
	options: PickerOption[];
	onSelect: (value: string) => void;
	onValueChange?: (value: string, meta?: { source: 'selection' | 'dismiss' }) => void;
	onClose: () => void;
	onOpenChange?: (open: boolean, meta?: { source: 'selection' | 'dismiss' }) => void;
	selectedValue?: string;
	value?: string;
	defaultValue?: string;
	allowAdd?: boolean;
	onAddNew?: () => void;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

/**
 * P0.6 — BottomSheetPicker
 * Modal bottom sheet: title, search bar, option list, optional Add New button.
 * Selected option shows green checkmark.
 */
export const BottomSheetPicker = forwardRef<React.ElementRef<typeof View>, BottomSheetPickerProps>(
	(
		{
			visible,
			open,
			defaultOpen = false,
			title,
			options,
			onSelect,
			onValueChange,
			onClose,
			onOpenChange,
			selectedValue,
			value,
			defaultValue,
			allowAdd = false,
			onAddNew,
			style,
			testID,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [search, setSearch] = useState('');
		const [focusedControl, setFocusedControl] = useState<string | null>(null);
		const [isOpen, setIsOpen] = useControllableState({
			value: open ?? visible,
			defaultValue: defaultOpen || visible === true,
			onChange: (nextOpen, meta) =>
				onOpenChange?.(nextOpen, {
					source: meta?.source === 'selection' ? 'selection' : 'dismiss',
				}),
		});
		const [currentValue, setCurrentValue] = useControllableState({
			value: value ?? selectedValue,
			defaultValue: defaultValue ?? '',
			onChange: (nextValue, meta) => {
				onSelect(nextValue);
				onValueChange?.(nextValue, {
					source: meta?.source === 'dismiss' ? 'dismiss' : 'selection',
				});
			},
		});

		const filtered = useMemo(() => {
			const q = search.toLowerCase().trim();
			if (!q) return options;
			return options.filter((o) => o.label.toLowerCase().includes(q));
		}, [options, search]);

		if (!isOpen) return null;

		return (
			<Modal
				visible={isOpen}
				transparent
				animationType="slide"
				onRequestClose={() => {
					setIsOpen(false, { source: 'dismiss' });
					onClose();
				}}
			>
				<Pressable
					style={[styles.backdrop, { backgroundColor: c.scrim }]}
					onPress={() => {
						setIsOpen(false, { source: 'dismiss' });
						onClose();
					}}
				/>
				<View
					ref={ref}
					testID={testID}
					style={[
						styles.sheet,
						{
							backgroundColor: c.surface,
							borderTopLeftRadius: theme.borderRadius.xl,
							borderTopRightRadius: theme.borderRadius.xl,
						},
						style,
					]}
				>
					{/* Header */}
					<View style={styles.header}>
						<ThemedText
							variant="sectionTitle"
							style={{
								fontSize: theme.typography.sizes.lg,
								color: c.onSurface,
								flex: 1,
							}}
						>
							{title}
						</ThemedText>
						<Pressable
							testID="bottom-sheet-close"
							onPress={() => {
								setIsOpen(false, { source: 'dismiss' });
								onClose();
							}}
							onFocus={() => setFocusedControl('close')}
							onBlur={() => setFocusedControl(null)}
							accessibilityRole="button"
							accessibilityLabel="Close"
							style={[
								styles.closeBtn,
								focusedControl === 'close'
									? buildFocusRingStyle({
											color: c.primary,
											radius: theme.borderRadius.full,
										})
									: null,
							]}
						>
							<ThemedText
								variant="body"
								style={{ fontSize: FONT_SIZE.h2, color: c.onSurfaceVariant }}
							>
								×
							</ThemedText>
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
							const isSelected = option.value === currentValue;
							return (
								<Pressable
									key={option.value}
									onPress={() => {
										setCurrentValue(option.value, { source: 'selection' });
										void announceForScreenReader(`${option.label} selected`);
										setIsOpen(false, { source: 'selection' });
										onClose();
									}}
									onFocus={() => setFocusedControl(`option-${option.value}`)}
									onBlur={() => setFocusedControl(null)}
									accessibilityRole="button"
									accessibilityLabel={option.label}
									style={[
										styles.option,
										{ borderBottomColor: c.separator },
										focusedControl === `option-${option.value}`
											? buildFocusRingStyle({
													color: c.primary,
													radius: theme.borderRadius.md,
												})
											: null,
									]}
								>
									<ThemedText
										variant="body"
										style={{
											flex: 1,
											fontSize: theme.typography.sizes.md,
											color: c.onSurface,
										}}
									>
										{option.label}
									</ThemedText>
									{isSelected ? (
										<ThemedText
											variant="body"
											testID={`check-${option.value}`}
											style={{ color: c.success, fontSize: FONT_SIZE.h3 }}
										>
											✓
										</ThemedText>
									) : null}
								</Pressable>
							);
						})}
					</ScrollView>

					{/* Add New */}
					{allowAdd && onAddNew ? (
						<Pressable
							onPress={onAddNew}
							onFocus={() => setFocusedControl('add')}
							onBlur={() => setFocusedControl(null)}
							accessibilityRole="button"
							accessibilityLabel="Add new option"
							style={[
								styles.addNew,
								{
									borderTopColor: c.border,
								},
								focusedControl === 'add'
									? buildFocusRingStyle({
											color: c.primary,
											radius: theme.borderRadius.md,
										})
									: null,
							]}
						>
							<ThemedText
								variant="body"
								weight="semibold"
								style={{
									color: c.primary,
									fontSize: theme.typography.sizes.md,
								}}
							>
								+ नया जोड़ें / Add new
							</ThemedText>
						</Pressable>
					) : null}
				</View>
			</Modal>
		);
	},
);

BottomSheetPicker.displayName = 'BottomSheetPicker';

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
