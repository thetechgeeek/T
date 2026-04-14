import {
	SIZE_AVATAR_MD,
	OVERLAY_COLOR_MEDIUM,
	FAB_OFFSET_RIGHT,
	FAB_OFFSET_BOTTOM,
	SIZE_FAB,
	RADIUS_FAB,
	SIZE_MODAL_HANDLE_WIDTH,
	SIZE_MODAL_HANDLE_HEIGHT,
} from '@/theme/uiMetrics';
import React, { useState, useEffect } from 'react';
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
	ActivityIndicator,
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
import { itemCategoryService } from '@/src/services/itemCategoryService';
import type { ItemCategory } from '@/src/types/inventory';
import type { UUID } from '@/src/types/common';
import { BORDER_RADIUS_PX, SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

const ZERO_SPACING = 0;
const LIST_BOTTOM_PADDING = 100;
const CATEGORY_DOT_SIZE = 12;
const CATEGORY_DOT_RADIUS = 6;
const COLOR_SWATCH_SIZE = 36;
const COLOR_SWATCH_RADIUS = 18;
const EMOJI_INPUT_WIDTH = 72;

interface CategoryFormState {
	name_en: string;
	name_hi: string;
	color: string;
	icon: string;
}

export default function ItemCategoriesScreen() {
	const { c, s, r, theme } = useThemeTokens();
	const { t } = useLocale();
	const insets = useSafeAreaInsets();
	const presetColors = theme.collections.expenseCategoryPickColors;
	const defaultForm = React.useMemo<CategoryFormState>(
		() => ({
			name_en: '',
			name_hi: '',
			color: presetColors[0] ?? c.primary,
			icon: '📁',
		}),
		[c.primary, presetColors],
	);

	const [categories, setCategories] = useState<ItemCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalVisible, setModalVisible] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [editingId, setEditingId] = useState<UUID | null>(null);
	const [form, setForm] = useState<CategoryFormState>(defaultForm);

	const loadCategories = React.useCallback(async () => {
		try {
			setLoading(true);
			const data = await itemCategoryService.fetchAll();
			setCategories(data);
		} catch {
			Alert.alert(t('common.error'), t('inventory.loadError'));
		} finally {
			setLoading(false);
		}
	}, [t]);

	useEffect(() => {
		loadCategories();
	}, [loadCategories]);

	function openAdd() {
		setEditingId(null);
		setForm(defaultForm);
		setModalVisible(true);
	}

	function openEdit(cat: ItemCategory) {
		setEditingId(cat.id);
		setForm({
			name_en: cat.name_en,
			name_hi: cat.name_hi,
			color: cat.color || presetColors[0] || c.primary,
			icon: cat.icon || '📁',
		});
		setModalVisible(true);
	}

	function closeModal() {
		setModalVisible(false);
		setEditingId(null);
		setForm(defaultForm);
	}

	async function handleSave() {
		if (!form.name_en.trim()) {
			Alert.alert(t('common.validationError'), t('inventory.nameRequired'));
			return;
		}

		try {
			setSubmitting(true);
			if (editingId) {
				await itemCategoryService.update(editingId, form);
			} else {
				await itemCategoryService.create({ ...form, sort_order: categories.length });
			}
			await loadCategories();
			closeModal();
		} catch {
			Alert.alert(t('common.error'), t('inventory.saveError'));
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(cat: ItemCategory) {
		Alert.alert(
			t('inventory.deleteCategory'),
			t('inventory.deleteCategoryConfirm', { name: cat.name_en }),
			[
				{ text: t('common.cancel'), style: 'cancel' },
				{
					text: t('common.delete'),
					style: 'destructive',
					onPress: async () => {
						try {
							await itemCategoryService.delete(cat.id);
							await loadCategories();
						} catch {
							Alert.alert(t('common.error'), t('inventory.deleteError'));
						}
					},
				},
			],
		);
	}

	function renderItem({ item }: { item: ItemCategory }) {
		return (
			<Card style={styles.card} padding="md">
				<View style={layout.rowBetween}>
					<View style={[layout.row, { alignItems: 'center', flex: 1 }]}>
						<View style={[styles.dot, { backgroundColor: item.color || c.primary }]} />
						<ThemedText variant="h2" style={{ marginRight: s.xs }}>
							{item.icon || '📁'}
						</ThemedText>
						<View style={{ flex: 1 }}>
							<ThemedText variant="body" weight="bold" numberOfLines={1}>
								{item.name_en}
							</ThemedText>
							{item.name_hi ? (
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									numberOfLines={1}
								>
									{item.name_hi}
								</ThemedText>
							) : null}
						</View>
					</View>
					<View style={[layout.row, { gap: s.sm }]}>
						<Pressable onPress={() => openEdit(item)} hitSlop={8}>
							<Pencil size={18} color={c.primary} />
						</Pressable>
						<Pressable onPress={() => handleDelete(item)} hitSlop={8}>
							<Trash2 size={18} color={c.error} />
						</Pressable>
					</View>
				</View>
			</Card>
		);
	}

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title={t('inventory.itemCategories')} showBackButton />

			{loading ? (
				<View style={layout.center}>
					<ActivityIndicator size="large" color={c.primary} />
				</View>
			) : (
				<FlatList
					data={categories}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					contentContainerStyle={[
						styles.listContent,
						{ paddingBottom: LIST_BOTTOM_PADDING + insets.bottom },
					]}
					ItemSeparatorComponent={() => <View style={{ height: s.sm }} />}
					ListEmptyComponent={
						<ThemedText variant="body" color={c.onSurfaceVariant} style={styles.empty}>
							{t('inventory.noCategories')}
						</ThemedText>
					}
				/>
			)}

			<Pressable
				style={[
					styles.fab,
					{ backgroundColor: c.primary, bottom: FAB_OFFSET_BOTTOM + insets.bottom },
				]}
				onPress={openAdd}
			>
				<Plus color="white" size={28} />
			</Pressable>

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
							{editingId ? t('inventory.editCategory') : t('inventory.newCategory')}
						</ThemedText>

						<ScrollView
							keyboardShouldPersistTaps="handled"
							contentContainerStyle={styles.modalScroll}
						>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={styles.label}
							>
								{t('inventory.nameEn')} *
							</ThemedText>
							<TextInput
								value={form.name_en}
								onChangeText={(v) => setForm((f) => ({ ...f, name_en: v }))}
								placeholder="e.g. Tiles"
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
							/>

							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={[styles.label, { marginTop: s.md }]}
							>
								{t('inventory.nameHi')}
							</ThemedText>
							<TextInput
								value={form.name_hi}
								onChangeText={(v) => setForm((f) => ({ ...f, name_hi: v }))}
								placeholder="जैसे: टाइल्स"
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
							/>

							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={[styles.label, { marginTop: s.md }]}
							>
								{t('inventory.emojiIcon')}
							</ThemedText>
							<TextInput
								value={form.icon}
								onChangeText={(v) => setForm((f) => ({ ...f, icon: v }))}
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
							/>

							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={[styles.label, { marginTop: s.md }]}
							>
								{t('inventory.color')}
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
											},
										]}
									/>
								))}
							</View>
						</ScrollView>

						<View style={[styles.modalActions, { paddingHorizontal: s.lg }]}>
							<Button
								title={t('common.cancel')}
								onPress={closeModal}
								variant="outline"
								style={{ flex: 1, marginRight: s.sm }}
							/>
							<Button
								title={editingId ? t('common.update') : t('common.add')}
								onPress={handleSave}
								loading={submitting}
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
	listContent: { padding: SPACING_PX.lg },
	card: { marginBottom: ZERO_SPACING },
	dot: {
		width: CATEGORY_DOT_SIZE,
		height: CATEGORY_DOT_SIZE,
		borderRadius: CATEGORY_DOT_RADIUS,
		marginRight: SPACING_PX.sm,
	},
	empty: { textAlign: 'center', marginTop: SIZE_AVATAR_MD },
	fab: {
		position: 'absolute',
		right: FAB_OFFSET_RIGHT,
		width: SIZE_FAB,
		height: SIZE_FAB,
		borderRadius: RADIUS_FAB,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 4,
	},
	modalOverlay: { flex: 1, justifyContent: 'flex-end' },
	modalBackdrop: { flex: 1, backgroundColor: OVERLAY_COLOR_MEDIUM },
	modalSheet: { maxHeight: '85%' },
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
	modalScroll: { paddingHorizontal: SPACING_PX.xl, paddingBottom: SPACING_PX.lg },
	label: { fontWeight: '600', marginBottom: SPACING_PX.xs },
	textInput: {
		borderWidth: 1,
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		fontSize: FONT_SIZE.body,
		minHeight: TOUCH_TARGET_MIN_PX,
	},
	emojiInput: { width: EMOJI_INPUT_WIDTH, textAlign: 'center' },
	colorGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING_PX.md,
		marginTop: SPACING_PX.xs,
	},
	colorCircle: {
		width: COLOR_SWATCH_SIZE,
		height: COLOR_SWATCH_SIZE,
		borderRadius: COLOR_SWATCH_RADIUS,
	},
	modalActions: { flexDirection: 'row', paddingTop: SPACING_PX.md },
});
