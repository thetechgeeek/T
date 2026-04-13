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
	Switch,
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
import { palette } from '@/src/theme/palette';
import { itemUnitService } from '@/src/services/itemCategoryService';
import type { ItemUnit } from '@/src/types/inventory';
import type { UUID } from '@/src/types/common';
import { BORDER_RADIUS_PX, SPACING_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

const ZERO_SPACING = 0;
const LIST_BOTTOM_PADDING = 100;

interface UnitFormState {
	name: string;
	abbreviation: string;
	is_default: boolean;
}

const DEFAULT_FORM: UnitFormState = {
	name: '',
	abbreviation: '',
	is_default: false,
};

export default function ItemUnitsScreen() {
	const { c, s, r } = useThemeTokens();
	const { t } = useLocale();
	const insets = useSafeAreaInsets();

	const [units, setUnits] = useState<ItemUnit[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalVisible, setModalVisible] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [editingId, setEditingId] = useState<UUID | null>(null);
	const [form, setForm] = useState<UnitFormState>(DEFAULT_FORM);

	const loadUnits = React.useCallback(async () => {
		try {
			setLoading(true);
			const data = await itemUnitService.fetchAll();
			setUnits(data);
		} catch {
			Alert.alert(t('common.error'), t('inventory.loadError'));
		} finally {
			setLoading(false);
		}
	}, [t]);

	useEffect(() => {
		loadUnits();
	}, [loadUnits]);

	function openAdd() {
		setEditingId(null);
		setForm(DEFAULT_FORM);
		setModalVisible(true);
	}

	function openEdit(unit: ItemUnit) {
		setEditingId(unit.id);
		setForm({
			name: unit.name,
			abbreviation: unit.abbreviation,
			is_default: unit.is_default,
		});
		setModalVisible(true);
	}

	function closeModal() {
		setModalVisible(false);
		setEditingId(null);
		setForm(DEFAULT_FORM);
	}

	async function handleSave() {
		if (!form.name.trim() || !form.abbreviation.trim()) {
			Alert.alert(t('common.validationError'), t('inventory.nameAbbrRequired'));
			return;
		}

		try {
			setSubmitting(true);
			if (editingId) {
				await itemUnitService.update(editingId, form);
			} else {
				await itemUnitService.create(form);
			}
			await loadUnits();
			closeModal();
		} catch {
			Alert.alert(t('common.error'), t('inventory.saveError'));
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(unit: ItemUnit) {
		Alert.alert(
			t('inventory.deleteUnit'),
			t('inventory.deleteUnitConfirm', { name: unit.name }),
			[
				{ text: t('common.cancel'), style: 'cancel' },
				{
					text: t('common.delete'),
					style: 'destructive',
					onPress: async () => {
						try {
							await itemUnitService.delete(unit.id);
							await loadUnits();
						} catch {
							Alert.alert(t('common.error'), t('inventory.deleteError'));
						}
					},
				},
			],
		);
	}

	function renderItem({ item }: { item: ItemUnit }) {
		return (
			<Card style={styles.card} padding="md">
				<View style={layout.rowBetween}>
					<View style={{ flex: 1 }}>
						<View style={layout.row}>
							<ThemedText variant="body" weight="bold">
								{item.name}
							</ThemedText>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ marginLeft: s.sm }}
							>
								({item.abbreviation})
							</ThemedText>
							{item.is_default && (
								<View
									style={[
										styles.defaultBadge,
										{ backgroundColor: c.primaryContainer },
									]}
								>
									<ThemedText variant="captionSmall" color={c.onPrimaryContainer}>
										{t('common.default')}
									</ThemedText>
								</View>
							)}
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
			<ScreenHeader title={t('inventory.itemUnits')} showBackButton />

			{loading ? (
				<View style={layout.center}>
					<ActivityIndicator size="large" color={c.primary} />
				</View>
			) : (
				<FlatList
					data={units}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					contentContainerStyle={[
						styles.listContent,
						{ paddingBottom: LIST_BOTTOM_PADDING + insets.bottom },
					]}
					ItemSeparatorComponent={() => <View style={{ height: s.sm }} />}
					ListEmptyComponent={
						<ThemedText variant="body" color={c.onSurfaceVariant} style={styles.empty}>
							{t('inventory.noUnits')}
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
						<View style={styles.sheetHandle} />
						<ThemedText variant="h3" style={styles.modalTitle}>
							{editingId ? t('inventory.editUnit') : t('inventory.newUnit')}
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
								{t('inventory.unitName')} *
							</ThemedText>
							<TextInput
								value={form.name}
								onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
								placeholder="e.g. Kilogram"
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
								{t('inventory.unitAbbreviation')} *
							</ThemedText>
							<TextInput
								value={form.abbreviation}
								onChangeText={(v) => setForm((f) => ({ ...f, abbreviation: v }))}
								placeholder="e.g. Kg"
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

							<View
								style={[
									layout.rowBetween,
									{ marginTop: s.lg, alignItems: 'center' },
								]}
							>
								<View>
									<ThemedText variant="body" weight="medium">
										{t('inventory.setAsDefault')}
									</ThemedText>
									<ThemedText variant="caption" color={c.onSurfaceVariant}>
										{t('inventory.defaultUnitHint')}
									</ThemedText>
								</View>
								<Switch
									value={form.is_default}
									onValueChange={(v) => setForm((f) => ({ ...f, is_default: v }))}
									trackColor={{ false: c.surfaceVariant, true: c.primary }}
								/>
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
		backgroundColor: palette.grayCCC,
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
	modalActions: { flexDirection: 'row', paddingTop: SPACING_PX.md },
	defaultBadge: {
		paddingHorizontal: SPACING_PX.xs,
		paddingVertical: SPACING_PX.xxs,
		borderRadius: BORDER_RADIUS_PX.sm,
		marginLeft: SPACING_PX.sm,
	},
});
