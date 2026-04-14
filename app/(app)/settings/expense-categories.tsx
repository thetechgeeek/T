import { FAB_SHADOW } from '@/theme/shadowMetrics';
import {
	BORDER_WIDTH_BASE,
	OPACITY_SWATCH_SELECTED,
	SIZE_AVATAR_MD,
	SIZE_CATEGORY_DOT,
	SIZE_COLOR_SWATCH,
	SIZE_EMOJI_INPUT_WIDTH,
	OVERLAY_COLOR_MEDIUM,
	FAB_OFFSET_RIGHT,
	FAB_OFFSET_BOTTOM,
	SIZE_FAB,
	RADIUS_FAB,
	SIZE_MODAL_HANDLE_WIDTH,
	SIZE_MODAL_HANDLE_HEIGHT,
} from '@/theme/uiMetrics';
import React, { useState } from 'react';
import {
	View,
	StyleSheet,
	FlatList,
	Pressable,
	TextInput,
	Modal,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Pencil, Trash2 } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { Card } from '@/src/components/atoms/Card';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { layout } from '@/src/theme/layout';
import { BORDER_RADIUS_PX, SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';
import { ELEVATION } from '@/theme/shadowMetrics';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExpenseCategory {
	id: string;
	nameEn: string;
	nameHi: string;
	color: string;
	emoji: string;
	monthTotal: number;
}

interface CategoryFormState {
	nameEn: string;
	nameHi: string;
	color: string;
	emoji: string;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function ExpenseCategoriesScreen() {
	const { c, s, r, theme } = useThemeTokens();
	const { formatCurrency } = useLocale();
	const insets = useSafeAreaInsets();
	const presetColors = theme.collections.expenseCategoryPickColors;
	const listBottomPadding = FAB_OFFSET_BOTTOM + SIZE_FAB + s.xl;
	const fallbackCategories = React.useMemo<ExpenseCategory[]>(
		() => [
			{
				id: '1',
				nameEn: 'Rent',
				nameHi: 'किराया',
				color: presetColors[0] ?? c.primary,
				emoji: '🏠',
				monthTotal: 0,
			},
			{
				id: '2',
				nameEn: 'Transport',
				nameHi: 'परिवहन',
				color: presetColors[2] ?? presetColors[0] ?? c.primary,
				emoji: '🚛',
				monthTotal: 0,
			},
			{
				id: '3',
				nameEn: 'Labour',
				nameHi: 'मजदूरी',
				color: presetColors[1] ?? presetColors[0] ?? c.primary,
				emoji: '👷',
				monthTotal: 0,
			},
			{
				id: '4',
				nameEn: 'Utilities',
				nameHi: 'उपयोगिता',
				color: presetColors[5] ?? presetColors[0] ?? c.primary,
				emoji: '💡',
				monthTotal: 0,
			},
			{
				id: '5',
				nameEn: 'Packaging',
				nameHi: 'पैकेजिंग',
				color: presetColors[3] ?? presetColors[0] ?? c.primary,
				emoji: '📦',
				monthTotal: 0,
			},
			{
				id: '6',
				nameEn: 'Maintenance',
				nameHi: 'रखरखाव',
				color: presetColors[4] ?? presetColors[0] ?? c.primary,
				emoji: '🔧',
				monthTotal: 0,
			},
			{
				id: '7',
				nameEn: 'Advertisement',
				nameHi: 'विज्ञापन',
				color: presetColors[6] ?? presetColors[0] ?? c.primary,
				emoji: '📢',
				monthTotal: 0,
			},
			{
				id: '8',
				nameEn: 'Miscellaneous',
				nameHi: 'विविध',
				color: presetColors[8] ?? presetColors[0] ?? c.primary,
				emoji: '🗂️',
				monthTotal: 0,
			},
		],
		[c.primary, presetColors],
	);
	const defaultForm = React.useMemo<CategoryFormState>(
		() => ({
			nameEn: '',
			nameHi: '',
			color: presetColors[0] ?? c.primary,
			emoji: '📁',
		}),
		[c.primary, presetColors],
	);

	const [categories, setCategories] = useState<ExpenseCategory[]>(() => fallbackCategories);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [form, setForm] = useState<CategoryFormState>(defaultForm);

	// ── Modal helpers ──────────────────────────────────────────────────────

	function openAdd() {
		setEditingId(null);
		setForm(defaultForm);
		setModalVisible(true);
	}

	function openEdit(cat: ExpenseCategory) {
		setEditingId(cat.id);
		setForm({ nameEn: cat.nameEn, nameHi: cat.nameHi, color: cat.color, emoji: cat.emoji });
		setModalVisible(true);
	}

	function closeModal() {
		setModalVisible(false);
		setEditingId(null);
	}

	function handleSave() {
		if (!form.nameEn.trim()) {
			Alert.alert('Validation', 'Category name (English) is required.');
			return;
		}
		if (editingId) {
			setCategories((prev) =>
				prev.map((cat) => (cat.id === editingId ? { ...cat, ...form } : cat)),
			);
		} else {
			const newCat: ExpenseCategory = {
				id: Date.now().toString(),
				...form,
				monthTotal: 0,
			};
			setCategories((prev) => [...prev, newCat]);
		}
		closeModal();
	}

	function handleDelete(cat: ExpenseCategory) {
		Alert.alert(
			'Delete Category',
			`This will delete "${cat.nameEn}". All expenses will be moved to Miscellaneous.`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: () => setCategories((prev) => prev.filter((c) => c.id !== cat.id)),
				},
			],
		);
	}

	// ── Render item ────────────────────────────────────────────────────────

	function renderItem({ item }: { item: ExpenseCategory }) {
		return (
			<Card padding="md">
				<View style={layout.rowBetween}>
					<View style={[layout.row, { alignItems: 'center', flex: 1 }]}>
						{/* Colored dot */}
						<View style={[styles.dot, { backgroundColor: item.color }]} />
						<ThemedText variant="h2" style={{ marginRight: s.xs }}>
							{item.emoji}
						</ThemedText>
						<View style={{ flex: 1 }}>
							<ThemedText variant="body" weight="bold" numberOfLines={1}>
								{item.nameEn}
							</ThemedText>
							{item.nameHi ? (
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									numberOfLines={1}
								>
									{item.nameHi}
								</ThemedText>
							) : null}
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								this month: {formatCurrency(item.monthTotal)}
							</ThemedText>
						</View>
					</View>
					<View style={[layout.row, { gap: s.sm }]}>
						<Pressable
							onPress={() => openEdit(item)}
							accessibilityRole="button"
							accessibilityLabel={`edit-${item.nameEn}`}
							hitSlop={8}
						>
							<Pencil size={18} color={c.primary} />
						</Pressable>
						<Pressable
							onPress={() => handleDelete(item)}
							accessibilityRole="button"
							accessibilityLabel={`delete-${item.nameEn}`}
							hitSlop={8}
						>
							<Trash2 size={18} color={c.error} />
						</Pressable>
					</View>
				</View>
			</Card>
		);
	}

	// ── Modal content ──────────────────────────────────────────────────────

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="Expense Categories" showBackButton />

			<FlatList
				data={categories}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				contentContainerStyle={[
					styles.listContent,
					{ paddingBottom: listBottomPadding + insets.bottom },
				]}
				ItemSeparatorComponent={() => <View style={{ height: s.sm }} />}
				ListEmptyComponent={
					<ThemedText variant="body" color={c.onSurfaceVariant} style={styles.empty}>
						No categories yet
					</ThemedText>
				}
			/>

			{/* FAB */}
			<Pressable
				style={[
					styles.fab,
					{
						backgroundColor: c.primary,
						bottom: FAB_OFFSET_BOTTOM + insets.bottom,
						shadowColor: c.shadow,
					},
				]}
				onPress={openAdd}
				accessibilityRole="button"
				accessibilityLabel="add-expense-category"
			>
				<Plus color={c.white} size={28} />
			</Pressable>

			{/* Add / Edit Modal */}
			<Modal
				visible={modalVisible}
				animationType="slide"
				transparent
				onRequestClose={closeModal}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}
					style={styles.modalOverlay}
				>
					<Pressable style={styles.modalBackdrop} onPress={closeModal} />
					<View
						style={[
							styles.modalSheet,
							{
								backgroundColor: c.background,
								borderRadius: r.xl,
								paddingBottom: insets.bottom + s.lg,
							},
						]}
					>
						<View style={[styles.sheetHandle, { backgroundColor: c.borderStrong }]} />
						<ThemedText variant="h3" style={styles.modalTitle}>
							{editingId ? 'Edit Category' : 'New Category'}
						</ThemedText>

						<ScrollView
							keyboardShouldPersistTaps="handled"
							contentContainerStyle={styles.modalScroll}
						>
							{/* Name (English) */}
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={styles.label}
							>
								Name (English) *
							</ThemedText>
							<TextInput
								value={form.nameEn}
								onChangeText={(v) => setForm((f) => ({ ...f, nameEn: v }))}
								placeholder="e.g. Rent"
								placeholderTextColor={c.placeholder}
								style={[
									styles.textInput,
									{
										color: c.onSurface,
										borderColor: c.border,
										borderRadius: r.md,
										backgroundColor: c.surface,
									},
								]}
								accessibilityLabel="category-name-en"
							/>

							{/* Name (Hindi) */}
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={[styles.label, { marginTop: s.md }]}
							>
								Name (Hindi)
							</ThemedText>
							<TextInput
								value={form.nameHi}
								onChangeText={(v) => setForm((f) => ({ ...f, nameHi: v }))}
								placeholder="जैसे: किराया"
								placeholderTextColor={c.placeholder}
								style={[
									styles.textInput,
									{
										color: c.onSurface,
										borderColor: c.border,
										borderRadius: r.md,
										backgroundColor: c.surface,
									},
								]}
								accessibilityLabel="category-name-hi"
							/>

							{/* Emoji */}
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={[styles.label, { marginTop: s.md }]}
							>
								Emoji / Icon
							</ThemedText>
							<TextInput
								value={form.emoji}
								onChangeText={(v) => setForm((f) => ({ ...f, emoji: v }))}
								placeholder="📁"
								placeholderTextColor={c.placeholder}
								style={[
									styles.textInput,
									styles.emojiInput,
									{
										color: c.onSurface,
										borderColor: c.border,
										borderRadius: r.md,
										backgroundColor: c.surface,
										fontSize: FONT_SIZE.h1,
									},
								]}
								accessibilityLabel="category-emoji"
							/>

							{/* Color picker */}
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={[styles.label, { marginTop: s.md }]}
							>
								Color
							</ThemedText>
							<View style={styles.colorGrid}>
								{presetColors.map((col) => (
									<Pressable
										key={col}
										onPress={() => setForm((f) => ({ ...f, color: col }))}
										style={[
											styles.colorCircle,
											{
												backgroundColor: col,
												borderWidth: form.color === col ? 3 : 0,
												borderColor: 'white',
												shadowColor: col,
												shadowOpacity:
													form.color === col
														? OPACITY_SWATCH_SELECTED
														: 0,
												shadowRadius: SPACING_PX.xs,
												shadowOffset: {
													width: 0,
													height: 0,
												},
												elevation: form.color === col ? ELEVATION.md : 0,
											},
										]}
										accessibilityRole="radio"
										accessibilityState={{ checked: form.color === col }}
										accessibilityLabel={`color-${col}`}
									/>
								))}
							</View>

							{/* Preview */}
							<View
								style={[
									layout.row,
									styles.preview,
									{
										backgroundColor: c.surface,
										borderRadius: r.md,
										marginTop: s.md,
									},
								]}
							>
								<View style={[styles.dot, { backgroundColor: form.color }]} />
								<ThemedText variant="h2" style={{ marginRight: s.xs }}>
									{form.emoji}
								</ThemedText>
								<ThemedText variant="body" weight="bold">
									{form.nameEn || 'Preview'}
								</ThemedText>
							</View>
						</ScrollView>

						<View style={[styles.modalActions, { paddingHorizontal: s.lg }]}>
							<Button
								title="Cancel"
								onPress={closeModal}
								variant="outline"
								style={{ flex: 1, marginRight: s.sm }}
							/>
							<Button
								title={editingId ? 'Update' : 'Add Category'}
								onPress={handleSave}
								style={{ flex: 1 }}
							/>
						</View>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	listContent: {
		padding: SPACING_PX.lg,
	},
	dot: {
		width: SIZE_CATEGORY_DOT,
		height: SIZE_CATEGORY_DOT,
		borderRadius: SIZE_CATEGORY_DOT / 2,
		marginRight: SPACING_PX.sm,
	},
	empty: {
		textAlign: 'center',
		marginTop: SIZE_AVATAR_MD,
	},
	fab: {
		position: 'absolute',
		right: FAB_OFFSET_RIGHT,
		width: SIZE_FAB,
		height: SIZE_FAB,
		borderRadius: RADIUS_FAB,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: ELEVATION.md,
		shadowOffset: { width: 0, height: SPACING_PX.xxs },
		...FAB_SHADOW,
	},
	modalOverlay: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	modalBackdrop: {
		flex: 1,
		backgroundColor: OVERLAY_COLOR_MEDIUM,
	},
	modalSheet: {
		maxHeight: '85%',
	},
	sheetHandle: {
		width: SIZE_MODAL_HANDLE_WIDTH,
		height: SIZE_MODAL_HANDLE_HEIGHT,
		borderRadius: BORDER_RADIUS_PX.xs,
		alignSelf: 'center',
		marginTop: SPACING_PX.md,
		marginBottom: SPACING_PX.xs,
	},
	modalTitle: {
		textAlign: 'center',
		marginBottom: SPACING_PX.md,
		marginTop: SPACING_PX.sm,
		paddingHorizontal: SPACING_PX.lg,
	},
	modalScroll: {
		paddingHorizontal: SPACING_PX.xl,
		paddingBottom: SPACING_PX.lg,
	},
	label: {
		fontWeight: '600',
		marginBottom: SPACING_PX.xs,
	},
	textInput: {
		borderWidth: BORDER_WIDTH_BASE,
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		fontSize: FONT_SIZE.body,
		minHeight: TOUCH_TARGET_MIN_PX,
	},
	emojiInput: {
		width: SIZE_EMOJI_INPUT_WIDTH,
		textAlign: 'center',
	},
	colorGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING_PX.md,
		marginTop: SPACING_PX.xs,
	},
	colorCircle: {
		width: SIZE_COLOR_SWATCH,
		height: SIZE_COLOR_SWATCH,
		borderRadius: SIZE_COLOR_SWATCH / 2,
	},
	preview: {
		padding: SPACING_PX.md,
		alignItems: 'center',
	},
	modalActions: {
		flexDirection: 'row',
		paddingTop: SPACING_PX.md,
	},
});
