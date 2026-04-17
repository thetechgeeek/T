import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import {
	Keyboard,
	KeyboardAvoidingView,
	Modal,
	View,
	Pressable,
	ScrollView,
	SectionList,
	TextInput,
	StyleSheet,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useControllableState } from '@/src/hooks/useControllableState';
import { announceForScreenReader, buildFocusRingStyle } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { SIZE_BUTTON_HEIGHT_SM, SIZE_INPUT_HEIGHT } from '@/theme/uiMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';
import { SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';

const SNAP_POINT_OPTIONS = ['25%', '50%', '90%'] as const;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- drag dismissal should require roughly one quarter of the sheet height.
const DISMISS_DISTANCE_RATIO = 0.25;

export type BottomSheetSnapPoint = (typeof SNAP_POINT_OPTIONS)[number];

export interface PickerOption {
	label: string;
	value: string;
}

export interface PickerSection {
	label: string;
	options: PickerOption[];
}

export interface BottomSheetPickerProps {
	visible?: boolean;
	open?: boolean;
	defaultOpen?: boolean;
	title: string;
	options: PickerOption[];
	sections?: PickerSection[];
	onSelect: (value: string) => void;
	onValuesChange?: (values: string[]) => void;
	onValueChange?: (value: string, meta?: { source: 'selection' | 'dismiss' }) => void;
	onClose: () => void;
	onOpenChange?: (open: boolean, meta?: { source: 'selection' | 'dismiss' }) => void;
	selectedValue?: string;
	selectedValues?: string[];
	value?: string;
	values?: string[];
	defaultValue?: string;
	defaultValues?: string[];
	multiple?: boolean;
	loading?: boolean;
	emptyLabel?: string;
	allowAdd?: boolean;
	onAddNew?: () => void;
	confirmLabel?: string;
	snapPoint?: BottomSheetSnapPoint;
	snapPoints?: BottomSheetSnapPoint[];
	dragToDismiss?: boolean;
	keyboardAware?: boolean;
	dismissVelocityThreshold?: number;
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
			sections,
			onSelect,
			onValuesChange,
			onValueChange,
			onClose,
			onOpenChange,
			selectedValue,
			selectedValues,
			value,
			values,
			defaultValue,
			defaultValues,
			multiple = false,
			loading = false,
			emptyLabel = 'No options match this search.',
			allowAdd = false,
			onAddNew,
			confirmLabel = 'Done',
			snapPoint = '50%',
			snapPoints = [...SNAP_POINT_OPTIONS],
			dragToDismiss = true,
			keyboardAware = true,
			dismissVelocityThreshold = 800,
			style,
			testID,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [search, setSearch] = useState('');
		const [keyboardVisible, setKeyboardVisible] = useState(false);
		const [focusedControl, setFocusedControl] = useState<string | null>(null);
		const sheetHeightRef = useRef(0);
		const translateY = useSharedValue(0);
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
		const [currentValues, setCurrentValues] = useControllableState({
			value: values ?? selectedValues,
			defaultValue: defaultValues ?? [],
			onChange: (nextValues) => {
				onValuesChange?.(nextValues);
			},
		});

		const filteredOptions = useMemo(() => {
			const q = search.toLowerCase().trim();
			if (!q) return options;
			return options.filter((o) => o.label.toLowerCase().includes(q));
		}, [options, search]);
		const filteredSections = useMemo(() => {
			const q = search.toLowerCase().trim();
			if (!sections?.length) {
				return [];
			}
			return sections
				.map((section) => ({
					title: section.label,
					data: q
						? section.options.filter((option) => option.label.toLowerCase().includes(q))
						: section.options,
				}))
				.filter((section) => section.data.length > 0);
		}, [search, sections]);
		const hasGroupedOptions = filteredSections.length > 0;
		const visibleOptions = hasGroupedOptions
			? filteredSections.flatMap((section) => section.data)
			: filteredOptions;
		const noMatches = !loading && visibleOptions.length === 0;
		const resolvedSnapPoints = snapPoints.length > 0 ? snapPoints : [...SNAP_POINT_OPTIONS];
		const resolvedSnapPoint = resolvedSnapPoints.includes(snapPoint)
			? snapPoint
			: (resolvedSnapPoints[resolvedSnapPoints.length - 1] ?? '50%');
		const activeSnapPoint =
			keyboardAware && keyboardVisible && resolvedSnapPoints.includes('90%')
				? '90%'
				: resolvedSnapPoint;
		const animatedSheetStyle = useAnimatedStyle(() => ({
			transform: [{ translateY: translateY.value }],
		}));

		const handleDismiss = () => {
			translateY.value = 0;
			setIsOpen(false, { source: 'dismiss' });
			onClose();
		};

		const handleSingleSelect = (option: PickerOption) => {
			setCurrentValue(option.value, { source: 'selection' });
			void announceForScreenReader(`${option.label} selected`);
			setIsOpen(false, { source: 'selection' });
			onClose();
		};

		const toggleMultiValue = (option: PickerOption) => {
			const nextValues = currentValues.includes(option.value)
				? currentValues.filter((entry) => entry !== option.value)
				: [...currentValues, option.value];
			setCurrentValues(nextValues);
			void announceForScreenReader(
				currentValues.includes(option.value)
					? `${option.label} removed`
					: `${option.label} selected`,
			);
		};

		useEffect(() => {
			if (!isOpen || !keyboardAware) {
				return;
			}

			const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
				setKeyboardVisible(true);
			});
			const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
				setKeyboardVisible(false);
			});

			return () => {
				showSubscription.remove();
				hideSubscription.remove();
			};
		}, [isOpen, keyboardAware]);

		useEffect(() => {
			if (isOpen) {
				translateY.value = 0;
			}
		}, [isOpen, translateY]);

		const panGesture = Gesture.Pan()
			.runOnJS(true)
			.onChange((event) => {
				if (!dragToDismiss) {
					return;
				}

				translateY.value = Math.max(0, event.translationY);
			})
			.onEnd((event) => {
				if (!dragToDismiss) {
					translateY.value = withSpring(0);
					return;
				}

				const shouldDismiss =
					event.velocityY > dismissVelocityThreshold ||
					event.translationY > sheetHeightRef.current * DISMISS_DISTANCE_RATIO;

				if (shouldDismiss) {
					translateY.value = withSpring(sheetHeightRef.current || 360);
					handleDismiss();
					return;
				}

				translateY.value = withSpring(0);
			});

		if (!isOpen) return null;

		return (
			<Modal
				visible={isOpen}
				transparent
				animationType="slide"
				onRequestClose={handleDismiss}
			>
				<Pressable
					testID="bottom-sheet-backdrop"
					style={[styles.backdrop, { backgroundColor: c.scrim }]}
					onPress={handleDismiss}
				/>
				<KeyboardAvoidingView style={styles.keyboardShell}>
					<GestureDetector gesture={panGesture}>
						<Animated.View
							ref={ref}
							testID={testID}
							onLayout={(event) => {
								sheetHeightRef.current = event.nativeEvent.layout.height;
							}}
							style={[
								styles.sheet,
								{
									backgroundColor: c.surface,
									borderTopLeftRadius: theme.borderRadius.xl,
									borderTopRightRadius: theme.borderRadius.xl,
									height: activeSnapPoint,
								},
								theme.elevation.modal,
								animatedSheetStyle,
								style,
							]}
						>
							<View style={styles.handleZone}>
								<View
									testID="bottom-sheet-handle"
									style={[
										styles.handlePill,
										{
											backgroundColor: c.border,
											borderRadius: theme.borderRadius.full,
										},
									]}
								/>
							</View>

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
									onPress={handleDismiss}
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
										style={{
											fontSize: FONT_SIZE.h2,
											color: c.onSurfaceVariant,
										}}
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
							{loading ? (
								<View style={styles.emptyState}>
									<ThemedText
										variant="body"
										style={{ color: c.onSurfaceVariant }}
									>
										Loading options…
									</ThemedText>
								</View>
							) : hasGroupedOptions ? (
								<SectionList
									sections={filteredSections}
									style={styles.list}
									keyboardShouldPersistTaps="handled"
									nestedScrollEnabled
									keyExtractor={(item) => item.value}
									renderSectionHeader={({ section }) => (
										<ThemedText
											variant="captionBold"
											style={{
												color: c.onSurfaceVariant,
												paddingHorizontal: SPACING_PX.lg,
												paddingTop: SPACING_PX.sm,
											}}
										>
											{section.title}
										</ThemedText>
									)}
									renderItem={({ item }) =>
										renderPickerOption({
											option: item,
											currentValue,
											currentValues,
											multiple,
											c,
											theme,
											focusedControl,
											setFocusedControl,
											onSingleSelect: handleSingleSelect,
											onToggleMultiValue: toggleMultiValue,
										})
									}
									ListEmptyComponent={
										noMatches ? (
											<View style={styles.emptyState}>
												<ThemedText
													variant="body"
													style={{ color: c.onSurfaceVariant }}
												>
													{emptyLabel}
												</ThemedText>
											</View>
										) : null
									}
								/>
							) : (
								<ScrollView
									style={styles.list}
									keyboardShouldPersistTaps="handled"
									nestedScrollEnabled
								>
									{filteredOptions.map((option) =>
										renderPickerOption({
											option,
											currentValue,
											currentValues,
											multiple,
											c,
											theme,
											focusedControl,
											setFocusedControl,
											onSingleSelect: handleSingleSelect,
											onToggleMultiValue: toggleMultiValue,
										}),
									)}
									{noMatches ? (
										<View style={styles.emptyState}>
											<ThemedText
												variant="body"
												style={{ color: c.onSurfaceVariant }}
											>
												{emptyLabel}
											</ThemedText>
										</View>
									) : null}
								</ScrollView>
							)}

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
										Add new
									</ThemedText>
								</Pressable>
							) : null}
							{multiple ? (
								<Pressable
									testID="bottom-sheet-confirm"
									onPress={() => {
										void announceForScreenReader('Selections confirmed');
										setIsOpen(false, { source: 'selection' });
										onClose();
									}}
									accessibilityRole="button"
									accessibilityLabel={confirmLabel}
									style={[
										styles.addNew,
										{
											borderTopColor: c.border,
										},
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
										{confirmLabel}
									</ThemedText>
								</Pressable>
							) : null}
						</Animated.View>
					</GestureDetector>
				</KeyboardAvoidingView>
			</Modal>
		);
	},
);

BottomSheetPicker.displayName = 'BottomSheetPicker';

function renderPickerOption({
	option,
	currentValue,
	currentValues,
	multiple,
	c,
	theme,
	focusedControl,
	setFocusedControl,
	onSingleSelect,
	onToggleMultiValue,
}: {
	option: PickerOption;
	currentValue: string;
	currentValues: string[];
	multiple: boolean;
	c: ReturnType<typeof useTheme>['theme']['colors'];
	theme: ReturnType<typeof useTheme>['theme'];
	focusedControl: string | null;
	setFocusedControl: (value: string | null) => void;
	onSingleSelect: (option: PickerOption) => void;
	onToggleMultiValue: (option: PickerOption) => void;
}) {
	const isSelected = multiple
		? currentValues.includes(option.value)
		: option.value === currentValue;

	return (
		<Pressable
			key={option.value}
			onPress={() => (multiple ? onToggleMultiValue(option) : onSingleSelect(option))}
			onFocus={() => setFocusedControl(`option-${option.value}`)}
			onBlur={() => setFocusedControl(null)}
			accessibilityRole="button"
			accessibilityLabel={option.label}
			accessibilityState={{ selected: isSelected }}
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
}

const styles = StyleSheet.create({
	backdrop: {
		...StyleSheet.absoluteFillObject,
	},
	keyboardShell: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	sheet: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
		alignSelf: 'stretch',
		paddingBottom: SPACING_PX.xl,
	},
	handleZone: {
		alignItems: 'center',
		paddingTop: SPACING_PX.sm,
		paddingBottom: SPACING_PX.xxs,
	},
	handlePill: {
		width: 48,
		height: 4,
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
	emptyState: {
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.xl,
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
