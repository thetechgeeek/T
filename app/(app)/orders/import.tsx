import React, { useState, useCallback } from 'react';
import { OPACITY_SKELETON_PEAK, SIZE_TEXTAREA_MIN_HEIGHT } from '@/theme/uiMetrics';
import { View, StyleSheet, TouchableOpacity, Alert, TextInput as RNTextInput } from 'react-native';
import { useRouter } from 'expo-router';
import {
	FileUp,
	FileText,
	ClipboardList,
	Trash2,
	PlusCircle,
	ChevronDown,
	ChevronUp,
} from 'lucide-react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useOrderStore } from '@/src/stores/orderStore';
import { pdfService } from '@/src/services/pdfService';
import type { ParsedOrderItem } from '@/src/services/pdfService';
import { useLocale } from '@/src/hooks/useLocale';
import { Button } from '@/src/design-system/components/atoms/Button';
import { Card } from '@/src/design-system/components/atoms/Card';
import { TextInput } from '@/src/design-system/components/atoms/TextInput';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { SectionHeader } from '@/src/design-system/components/molecules/SectionHeader';
import { BORDER_RADIUS_PX, SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

const TEXTAREA_MIN_HEIGHT = SIZE_TEXTAREA_MIN_HEIGHT * 2;
const TEXTAREA_WRAPPER_MIN_HEIGHT = TEXTAREA_MIN_HEIGHT + SPACING_PX.md + SPACING_PX.xxs * 4;
const REVIEW_BOTTOM_SPACER_HEIGHT = TEXTAREA_MIN_HEIGHT / 2;
const TAB_LABEL_MARGIN_LEFT = SPACING_PX.sm - SPACING_PX.xxs;
const ITEM_CARD_TITLE_FONT_SIZE = FONT_SIZE.body - 1;
const UPLOAD_ZONE_BORDER_WIDTH = 1.5;

type InputMode = 'file' | 'text';

// ─── Editable Item Card ────────────────────────────────────────────────────────
interface EditableItemCardProps {
	item: ParsedOrderItem;
	index: number;
	onUpdate: (index: number, field: keyof ParsedOrderItem, value: string | number) => void;
	onRemove: (index: number) => void;
	colors: ReturnType<typeof useThemeTokens>['c'];
	spacing: ReturnType<typeof useThemeTokens>['s'];
	t: (key: string, options?: Record<string, unknown>) => string;
}

function EditableItemCard({
	item,
	index,
	onUpdate,
	onRemove,
	colors: c,
	spacing: s,
	t,
}: EditableItemCardProps) {
	const [expanded, setExpanded] = useState(false);

	return (
		<Card
			padding="none"
			style={{
				backgroundColor: c.surface,
				borderLeftColor: c.primary,
				borderLeftWidth: 4,
				borderRadius: BORDER_RADIUS_PX.lg,
				marginBottom: SPACING_PX.md,
				overflow: 'hidden',
			}}
		>
			{/* Header row — always visible */}
			<TouchableOpacity
				style={styles.cardHeader}
				onPress={() => setExpanded((v) => !v)}
				accessibilityLabel={`${t('invoice.addItem')} ${index + 1}: ${item.design_name || t('inventory.itemNotFound')}, ${t('order.reviewExtracted')}`}
				accessibilityRole="button"
			>
				<View style={{ flex: 1 }}>
					<ThemedText weight="bold" style={{ fontSize: ITEM_CARD_TITLE_FONT_SIZE }}>
						{item.design_name || t('inventory.itemNotFound')}
					</ThemedText>
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={{ marginTop: SPACING_PX.xxs }}
					>
						{item.category || t('common.na')} • {item.size || t('common.na')}
					</ThemedText>
				</View>
				<View style={{ alignItems: 'flex-end', marginLeft: SPACING_PX.sm }}>
					<ThemedText
						color={c.primary}
						weight="bold"
						style={{ fontSize: FONT_SIZE.body }}
					>
						{item.box_count ?? '—'} {t('order.boxesSuffix')}
					</ThemedText>
					{item.price_per_box ? (
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							{t('finance.currencySymbol')}
							{item.price_per_box}
							{t('inventory.perBox')}
						</ThemedText>
					) : null}
				</View>
				<View style={{ marginLeft: SPACING_PX.sm }}>
					{expanded ? (
						<ChevronUp size={18} color={c.onSurfaceVariant} />
					) : (
						<ChevronDown size={18} color={c.onSurfaceVariant} />
					)}
				</View>
			</TouchableOpacity>

			{/* Expanded edit fields */}
			{expanded && (
				<View style={[styles.editFields, { borderTopColor: c.border }]}>
					<TextInput
						label={t('inventory.designName')}
						value={item.design_name ?? ''}
						onChangeText={(v) => onUpdate(index, 'design_name', v)}
						containerStyle={{ marginBottom: s.sm }}
					/>
					<View style={{ flexDirection: 'row', gap: s.sm }}>
						<TextInput
							label={t('inventory.category')}
							value={item.category ?? ''}
							onChangeText={(v) => onUpdate(index, 'category', v)}
							containerStyle={{ flex: 1, marginBottom: s.sm }}
						/>
						<TextInput
							label={t('inventory.size')}
							value={item.size ?? ''}
							onChangeText={(v) => onUpdate(index, 'size', v)}
							containerStyle={{ flex: 1, marginBottom: s.sm }}
						/>
					</View>
					<View style={{ flexDirection: 'row', gap: s.sm }}>
						<TextInput
							label={t('inventory.boxCount') + ' *'}
							value={item.box_count !== undefined ? String(item.box_count) : ''}
							onChangeText={(v) => {
								const n = parseFloat(v);
								onUpdate(index, 'box_count', isNaN(n) ? 0 : n);
							}}
							keyboardType="numeric"
							containerStyle={{ flex: 1, marginBottom: s.sm }}
						/>
						<TextInput
							label={t('inventory.sellingPrice')}
							value={
								item.price_per_box !== undefined ? String(item.price_per_box) : ''
							}
							onChangeText={(v) => {
								const n = parseFloat(v);
								onUpdate(index, 'price_per_box', isNaN(n) ? 0 : n);
							}}
							keyboardType="numeric"
							containerStyle={{ flex: 1, marginBottom: s.sm }}
						/>
					</View>

					<TouchableOpacity
						onPress={() => onRemove(index)}
						style={[styles.removeBtn, { borderColor: c.error }]}
						accessibilityLabel={`${t('common.delete')} ${index + 1}`}
						accessibilityRole="button"
					>
						<Trash2 size={14} color={c.error} />
						<ThemedText
							color={c.error}
							style={{ marginLeft: SPACING_PX.xs, fontSize: FONT_SIZE.label }}
						>
							{t('common.delete')}
						</ThemedText>
					</TouchableOpacity>
				</View>
			)}
		</Card>
	);
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function ImportOrderScreen() {
	const { c, s } = useThemeTokens();
	const { t } = useLocale();
	const router = useRouter();

	const { parseDocument, parseText, isParsing, parsedData, importParsedData, clearParsedData } =
		useOrderStore();

	// Local editable copy of parsed items so the store data isn't mutated directly
	const [editableItems, setEditableItems] = useState<ParsedOrderItem[] | null>(null);
	const [partyName, setPartyName] = useState('');
	const [saving, setSaving] = useState(false);

	// Upload page state
	const [inputMode, setInputMode] = useState<InputMode>('file');
	const [pastedText, setPastedText] = useState('');

	// Sync store parsed data into local editable copy (one-time on arrival)
	const resolvedItems = editableItems ?? parsedData;

	const handleUploadFile = async () => {
		try {
			const doc = await pdfService.pickPdfDocument();
			if (!doc) return;

			const storagePath = await pdfService.uploadDocumentToStorage(
				doc.uri,
				doc.name,
				doc.mimeType,
			);

			await parseDocument(doc.uri, doc.mimeType, storagePath ?? undefined);
		} catch (err: unknown) {
			Alert.alert(
				t('order.processFailed'),
				err instanceof Error ? err.message : t('common.unexpectedError'),
			);
		}
	};

	const handleParseText = async () => {
		const trimmed = pastedText.trim();
		if (!trimmed) {
			Alert.alert(t('order.detailsMissing'), t('order.detailsMissing'));
			return;
		}
		try {
			await parseText(trimmed);
		} catch (err: unknown) {
			Alert.alert(
				t('order.processFailed'),
				err instanceof Error ? err.message : t('common.unexpectedError'),
			);
		}
	};

	const handleSave = async () => {
		if (!partyName) {
			Alert.alert(t('order.detailsMissing'), t('order.partyNameRequired'));
			return;
		}
		if (!resolvedItems || resolvedItems.length === 0) {
			Alert.alert(t('order.noItemsTitle'), t('order.noItemsMessage'));
			return;
		}

		setSaving(true);
		try {
			await importParsedData(partyName, resolvedItems);
			setEditableItems(null);
			Alert.alert(t('common.successTitle'), t('order.importSuccessMessage'));
			router.back();
		} catch (err: unknown) {
			Alert.alert(
				t('order.importFailed'),
				err instanceof Error ? err.message : t('common.unexpectedError'),
			);
		} finally {
			setSaving(false);
		}
	};

	const handleDiscard = () => {
		setEditableItems(null);
		clearParsedData();
	};

	// ── Item editing helpers ──
	const handleUpdateItem = useCallback(
		(index: number, field: keyof ParsedOrderItem, value: string | number) => {
			setEditableItems((prev) => {
				const base = prev ?? parsedData ?? [];
				const next = base.map((item, i) =>
					i === index ? { ...item, [field]: value } : item,
				);
				return next;
			});
		},
		[parsedData],
	);

	const handleRemoveItem = useCallback((index: number) => {
		setEditableItems((prev) => {
			const base = prev ?? [];
			return base.filter((_, i) => i !== index);
		});
	}, []);

	const handleAddItem = useCallback(() => {
		const blank: ParsedOrderItem = {
			design_name: '',
			category: '',
			size: '',
			box_count: 0,
			has_batch_tracking: false,
			has_serial_tracking: false,
			price_per_box: 0,
		};
		setEditableItems((prev) => [...(prev ?? parsedData ?? []), blank]);
	}, [parsedData]);

	// ── Loading state ───────────────────────────────────────────────────────────
	if (isParsing) {
		return (
			<AtomicScreen
				safeAreaEdges={['bottom']}
				style={{ alignItems: 'center', justifyContent: 'center' }}
			>
				<ScreenHeader title={t('order.importBtn')} />
				<FileText
					size={64}
					color={c.primary}
					style={{ opacity: OPACITY_SKELETON_PEAK, marginBottom: s.xl }}
				/>
				<ThemedText variant="h3">{t('order.analyzing')}</ThemedText>
				<ThemedText
					color={c.placeholder}
					align="center"
					style={{ marginTop: s.sm, paddingHorizontal: s.xl }}
				>
					{t('order.aiDescription')}
				</ThemedText>
			</AtomicScreen>
		);
	}

	// ── Review / edit extracted items ───────────────────────────────────────────
	if (resolvedItems) {
		return (
			<AtomicScreen
				safeAreaEdges={['bottom']}
				scrollable
				header={
					<ScreenHeader
						title={t('order.reviewTitle')}
						rightElement={
							<TouchableOpacity onPress={handleDiscard}>
								<ThemedText color={c.error}>{t('order.discard')}</ThemedText>
							</TouchableOpacity>
						}
					/>
				}
				contentContainerStyle={{ padding: s.lg }}
				footer={
					<View style={[styles.footer, { borderTopColor: c.border }]}>
						<Button
							title={t('order.confirmImport')}
							variant="primary"
							onPress={handleSave}
							loading={saving}
						/>
					</View>
				}
			>
				<View style={{ marginBottom: s.xl }}>
					<TextInput
						label={t('order.partyName') + ' *'}
						placeholder={t('order.exampleText')}
						value={partyName}
						onChangeText={setPartyName}
					/>
				</View>

				<SectionHeader
					title={`${t('order.extractedItems')} (${resolvedItems.length})`}
					subtitle={t('order.reviewExtracted')}
					style={{ paddingHorizontal: 0, marginBottom: SPACING_PX.md }}
				/>

				{resolvedItems.map((item, index) => (
					<EditableItemCard
						key={`${item.design_name ?? item.base_item_number ?? ''}-${index}`}
						item={item}
						index={index}
						onUpdate={handleUpdateItem}
						onRemove={handleRemoveItem}
						colors={c}
						spacing={s}
						t={t}
					/>
				))}

				<TouchableOpacity
					style={[styles.addItemBtn, { borderColor: c.primary }]}
					onPress={handleAddItem}
					accessibilityRole="button"
					accessibilityLabel={t('order.addManually')}
				>
					<PlusCircle size={16} color={c.primary} />
					<ThemedText
						color={c.primary}
						style={{
							marginLeft: TAB_LABEL_MARGIN_LEFT,
							fontSize: FONT_SIZE.caption,
						}}
					>
						{t('order.addManually')}
					</ThemedText>
				</TouchableOpacity>

				<View style={{ height: REVIEW_BOTTOM_SPACER_HEIGHT }} />
			</AtomicScreen>
		);
	}

	// ── Upload / paste page ─────────────────────────────────────────────────────
	return (
		<AtomicScreen
			safeAreaEdges={['bottom']}
			scrollable
			header={<ScreenHeader title={t('order.importBtn')} />}
			contentContainerStyle={{ padding: s.lg }}
		>
			<ThemedText style={{ lineHeight: 22, marginBottom: s.xl }}>
				{t('order.howItWorks')}
			</ThemedText>

			<View
				style={[
					styles.tabBar,
					{ backgroundColor: c.surfaceVariant, borderColor: c.border },
				]}
			>
				<TouchableOpacity
					style={[styles.tab, inputMode === 'file' && { backgroundColor: c.primary }]}
					onPress={() => setInputMode('file')}
					accessibilityRole="tab"
					accessibilityLabel={t('order.fileUploadTab')}
					accessibilityState={{ selected: inputMode === 'file' }}
				>
					<FileUp
						size={16}
						color={inputMode === 'file' ? c.onPrimary : c.onSurfaceVariant}
					/>
					<ThemedText
						style={{ marginLeft: TAB_LABEL_MARGIN_LEFT, fontSize: FONT_SIZE.caption }}
						color={inputMode === 'file' ? c.onPrimary : c.onSurfaceVariant}
						weight={inputMode === 'file' ? 'bold' : 'regular'}
					>
						{t('inventory.listView')} {t('common.and')} {t('scanner.title')}
					</ThemedText>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.tab, inputMode === 'text' && { backgroundColor: c.primary }]}
					onPress={() => setInputMode('text')}
					accessibilityRole="tab"
					accessibilityLabel={t('order.pasteTextTab')}
					accessibilityState={{ selected: inputMode === 'text' }}
				>
					<ClipboardList
						size={16}
						color={inputMode === 'text' ? c.onPrimary : c.onSurfaceVariant}
					/>
					<ThemedText
						style={{ marginLeft: TAB_LABEL_MARGIN_LEFT, fontSize: FONT_SIZE.caption }}
						color={inputMode === 'text' ? c.onPrimary : c.onSurfaceVariant}
						weight={inputMode === 'text' ? 'bold' : 'regular'}
					>
						{t('order.actions.analyzeAi')}
					</ThemedText>
				</TouchableOpacity>
			</View>

			{inputMode === 'file' && (
				<View
					style={[
						styles.uploadBox,
						{ backgroundColor: c.surfaceVariant, borderColor: c.border },
					]}
				>
					<FileUp size={48} color={c.primary} style={{ marginBottom: s.md }} />
					<ThemedText
						weight="bold"
						style={{ fontSize: FONT_SIZE.body, marginBottom: SPACING_PX.xs }}
					>
						{t('order.uploadTitle')}
					</ThemedText>
					<ThemedText
						variant="caption"
						color={c.placeholder}
						align="center"
						style={{ marginBottom: s.lg }}
					>
						{t('order.supportedFiles')}
					</ThemedText>
					<Button
						title={t('order.browseFiles')}
						onPress={handleUploadFile}
						variant="outline"
					/>
				</View>
			)}

			{inputMode === 'text' && (
				<View
					style={[
						styles.textBox,
						{ backgroundColor: c.surfaceVariant, borderColor: c.border },
					]}
				>
					<View style={styles.textBoxHeader}>
						<ClipboardList size={20} color={c.primary} />
						<ThemedText
							weight="bold"
							style={{
								marginLeft: SPACING_PX.sm,
								fontSize: ITEM_CARD_TITLE_FONT_SIZE,
							}}
						>
							{t('order.actions.analyzeAi')}
						</ThemedText>
					</View>
					<ThemedText
						variant="caption"
						color={c.placeholder}
						style={{ marginBottom: s.md }}
					>
						{t('order.howItWorks')}
					</ThemedText>

					<View
						style={[
							styles.textAreaWrapper,
							{ backgroundColor: c.surface, borderColor: c.border },
						]}
					>
						<RNTextInput
							multiline
							numberOfLines={10}
							textAlignVertical="top"
							placeholder={`${t('order.placeholderText')}\n\n${t('common.selectAll')}\n${t('order.exampleText')}`}
							placeholderTextColor={c.placeholder}
							value={pastedText}
							onChangeText={setPastedText}
							style={[styles.textArea, { color: c.onSurface }]}
							accessibilityLabel={t('order.textInputLabel')}
						/>
					</View>

					<Button
						title={t('order.actions.analyzeAi')}
						onPress={handleParseText}
						variant="primary"
						style={{ marginTop: s.lg }}
					/>
				</View>
			)}
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	// Tab switcher
	tabBar: {
		flexDirection: 'row',
		borderRadius: BORDER_RADIUS_PX.lg,
		borderWidth: 1,
		overflow: 'hidden',
		marginBottom: SPACING_PX.lg + SPACING_PX.xs,
	},
	tab: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.sm,
		borderRadius: BORDER_RADIUS_PX.lg,
	},

	// File upload
	uploadBox: {
		borderWidth: 2,
		borderStyle: 'dashed',
		borderRadius: BORDER_RADIUS_PX.xl,
		padding: SPACING_PX['2xl'],
		alignItems: 'center',
		justifyContent: 'center',
	},

	// Text paste
	textBox: {
		borderWidth: 1,
		borderRadius: BORDER_RADIUS_PX.xl,
		padding: SPACING_PX.lg + SPACING_PX.xs,
	},
	textBoxHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: SPACING_PX.sm,
	},
	textAreaWrapper: {
		borderWidth: 1,
		borderRadius: BORDER_RADIUS_PX.md + SPACING_PX.xxs,
		padding: SPACING_PX.md,
		minHeight: TEXTAREA_WRAPPER_MIN_HEIGHT,
	},
	textArea: {
		fontSize: FONT_SIZE.caption,
		lineHeight: 22,
		minHeight: TEXTAREA_MIN_HEIGHT,
	},

	// Review screen
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: SPACING_PX.lg,
	},
	editFields: {
		borderTopWidth: 1,
		padding: SPACING_PX.lg,
		paddingTop: SPACING_PX.md,
	},
	removeBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderRadius: BORDER_RADIUS_PX.md,
		paddingVertical: SPACING_PX.sm,
		marginTop: SPACING_PX.xs,
	},
	addItemBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: UPLOAD_ZONE_BORDER_WIDTH,
		borderStyle: 'dashed',
		borderRadius: BORDER_RADIUS_PX.md + SPACING_PX.xxs,
		paddingVertical: SPACING_PX.md,
		marginTop: SPACING_PX.xs,
	},
	footer: {
		padding: SPACING_PX.lg + SPACING_PX.xs,
		paddingBottom: SPACING_PX.md,
		borderTopWidth: 1,
	},
});
