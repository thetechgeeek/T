import { SIZE_AVATAR_MD, OVERLAY_COLOR_MEDIUM } from '@/theme/uiMetrics';
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
import { expenseCategoryPickColors, palette } from '@/src/theme/palette';

const PRESET_COLORS = [...expenseCategoryPickColors];

interface CategoryFormState {
	name_en: string;
	name_hi: string;
	color: string;
	icon: string;
}

const DEFAULT_FORM: CategoryFormState = {
	name_en: '',
	name_hi: '',
	color: PRESET_COLORS[0],
	icon: '📁',
};

export default function ItemCategoriesScreen() {
	const { c, s, r } = useThemeTokens();
	const { t } = useLocale();
	const insets = useSafeAreaInsets();

	const [categories, setCategories] = useState<ItemCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalVisible, setModalVisible] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [editingId, setEditingId] = useState<UUID | null>(null);
	const [form, setForm] = useState<CategoryFormState>(DEFAULT_FORM);

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
		setForm(DEFAULT_FORM);
		setModalVisible(true);
	}

	function openEdit(cat: ItemCategory) {
		setEditingId(cat.id);
		setForm({
			name_en: cat.name_en,
			name_hi: cat.name_hi,
			color: cat.color || PRESET_COLORS[0],
			icon: cat.icon || '📁',
		});
		setModalVisible(true);
	}

	function closeModal() {
		setModalVisible(false);
		setEditingId(null);
		setForm(DEFAULT_FORM);
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
						<ThemedText style={{ marginRight: s.xs, fontSize: 20 }}>
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
						{ paddingBottom: 100 + insets.bottom },
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
				style={[styles.fab, { backgroundColor: c.primary, bottom: 32 + insets.bottom }]}
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
						<View style={styles.sheetHandle} />
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
										fontSize: 24,
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
	listContent: { padding: 16 },
	card: { marginBottom: 0 },
	dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
	empty: { textAlign: 'center', marginTop: SIZE_AVATAR_MD },
	fab: {
		position: 'absolute',
		right: 24,
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 4,
	},
	modalOverlay: { flex: 1, justifyContent: 'flex-end' },
	modalBackdrop: { flex: 1, backgroundColor: OVERLAY_COLOR_MEDIUM },
	modalSheet: { maxHeight: '85%' },
	sheetHandle: {
		width: 40,
		height: 4,
		borderRadius: 2,
		backgroundColor: palette.grayCCC,
		alignSelf: 'center',
		marginTop: 12,
		marginBottom: 4,
	},
	modalTitle: { textAlign: 'center', marginBottom: 12, marginTop: 8, paddingHorizontal: 16 },
	modalScroll: { paddingHorizontal: 20, paddingBottom: 16 },
	label: { fontWeight: '600', marginBottom: 6 },
	textInput: {
		borderWidth: 1,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 15,
		minHeight: 48,
	},
	emojiInput: { width: 72, textAlign: 'center' },
	colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
	colorCircle: { width: 36, height: 36, borderRadius: 18 },
	modalActions: { flexDirection: 'row', paddingTop: 12 },
});
