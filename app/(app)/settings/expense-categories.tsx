import { FAB_SHADOW } from '@/theme/shadowMetrics';
import { SIZE_AVATAR_MD } from '@/theme/uiMetrics';

const COLOR_SWATCH_SELECTED_SHADOW = 0.5;
const COLOR_SWATCH_SELECTED_ELEVATION = 4;
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
import { expenseCategoryPickColors, palette } from '@/src/theme/palette';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRESET_COLORS = [...expenseCategoryPickColors];

const FALLBACK_CATEGORIES: ExpenseCategory[] = [
	{
		id: '1',
		nameEn: 'Rent',
		nameHi: 'किराया',
		color: expenseCategoryPickColors[0],
		emoji: '🏠',
		monthTotal: 0,
	},
	{
		id: '2',
		nameEn: 'Transport',
		nameHi: 'परिवहन',
		color: expenseCategoryPickColors[2],
		emoji: '🚛',
		monthTotal: 0,
	},
	{
		id: '3',
		nameEn: 'Labour',
		nameHi: 'मजदूरी',
		color: expenseCategoryPickColors[1],
		emoji: '👷',
		monthTotal: 0,
	},
	{
		id: '4',
		nameEn: 'Utilities',
		nameHi: 'उपयोगिता',
		color: expenseCategoryPickColors[5],
		emoji: '💡',
		monthTotal: 0,
	},
	{
		id: '5',
		nameEn: 'Packaging',
		nameHi: 'पैकेजिंग',
		color: expenseCategoryPickColors[3],
		emoji: '📦',
		monthTotal: 0,
	},
	{
		id: '6',
		nameEn: 'Maintenance',
		nameHi: 'रखरखाव',
		color: expenseCategoryPickColors[4],
		emoji: '🔧',
		monthTotal: 0,
	},
	{
		id: '7',
		nameEn: 'Advertisement',
		nameHi: 'विज्ञापन',
		color: expenseCategoryPickColors[6],
		emoji: '📢',
		monthTotal: 0,
	},
	{
		id: '8',
		nameEn: 'Miscellaneous',
		nameHi: 'विविध',
		color: expenseCategoryPickColors[8],
		emoji: '🗂️',
		monthTotal: 0,
	},
];

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

const DEFAULT_FORM: CategoryFormState = {
	nameEn: '',
	nameHi: '',
	color: PRESET_COLORS[0],
	emoji: '📁',
};

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function ExpenseCategoriesScreen() {
	const { c, s, r } = useThemeTokens();
	const { formatCurrency } = useLocale();
	const insets = useSafeAreaInsets();

	const [categories, setCategories] = useState<ExpenseCategory[]>(FALLBACK_CATEGORIES);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [form, setForm] = useState<CategoryFormState>(DEFAULT_FORM);

	// ── Modal helpers ──────────────────────────────────────────────────────

	function openAdd() {
		setEditingId(null);
		setForm(DEFAULT_FORM);
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
			<Card style={styles.row} padding="md">
				<View style={layout.rowBetween}>
					<View style={[layout.row, { alignItems: 'center', flex: 1 }]}>
						{/* Colored dot */}
						<View style={[styles.dot, { backgroundColor: item.color }]} />
						<ThemedText style={{ marginRight: s.xs, fontSize: 20 }}>
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
				contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
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
						bottom: 32 + insets.bottom,
					},
				]}
				onPress={openAdd}
				accessibilityRole="button"
				accessibilityLabel="add-expense-category"
			>
				<Plus color="white" size={28} />
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
						<View style={styles.sheetHandle} />
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
										fontSize: 24,
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
								{PRESET_COLORS.map((col) => (
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
														? COLOR_SWATCH_SELECTED_SHADOW
														: 0,
												shadowRadius: 4,
												shadowOffset: { width: 0, height: 0 },
												elevation:
													form.color === col
														? COLOR_SWATCH_SELECTED_ELEVATION
														: 0,
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
								<ThemedText style={{ fontSize: 20, marginRight: s.xs }}>
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
		padding: 16,
	},
	row: {
		marginBottom: 0,
	},
	dot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginRight: 8,
	},
	empty: {
		textAlign: 'center',
		marginTop: SIZE_AVATAR_MD,
	},
	fab: {
		position: 'absolute',
		right: 24,
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 4,
		shadowColor: palette.shadow,
		shadowOffset: { width: 0, height: 2 },
		...FAB_SHADOW,
	},
	modalOverlay: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	modalBackdrop: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.4)',
	},
	modalSheet: {
		maxHeight: '85%',
	},
	sheetHandle: {
		width: 40,
		height: 4,
		borderRadius: 2,
		backgroundColor: palette.grayCCC,
		alignSelf: 'center',
		marginTop: 12,
		marginBottom: 4,
	},
	modalTitle: {
		textAlign: 'center',
		marginBottom: 12,
		marginTop: 8,
		paddingHorizontal: 16,
	},
	modalScroll: {
		paddingHorizontal: 20,
		paddingBottom: 16,
	},
	label: {
		fontWeight: '600',
		marginBottom: 6,
	},
	textInput: {
		borderWidth: 1,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 15,
		minHeight: 48,
	},
	emojiInput: {
		width: 72,
		textAlign: 'center',
	},
	colorGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
		marginTop: 4,
	},
	colorCircle: {
		width: 36,
		height: 36,
		borderRadius: 18,
	},
	preview: {
		padding: 12,
		alignItems: 'center',
	},
	modalActions: {
		flexDirection: 'row',
		paddingTop: 12,
	},
});
