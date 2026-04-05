import React, { useState, useCallback } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	TextInput as RNTextInput,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
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
import { Button } from '@/src/components/atoms/Button';
import { TextInput } from '@/src/components/atoms/TextInput';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';

type InputMode = 'file' | 'text';

// ─── Editable Item Card ────────────────────────────────────────────────────────
interface EditableItemCardProps {
	item: ParsedOrderItem;
	index: number;
	onUpdate: (index: number, field: keyof ParsedOrderItem, value: string | number) => void;
	onRemove: (index: number) => void;
	colors: ReturnType<typeof useThemeTokens>['c'];
	spacing: ReturnType<typeof useThemeTokens>['s'];
}

function EditableItemCard({
	item,
	index,
	onUpdate,
	onRemove,
	colors: c,
	spacing: s,
}: EditableItemCardProps) {
	const [expanded, setExpanded] = useState(false);

	return (
		<View style={[styles.card, { backgroundColor: c.surface, borderLeftColor: c.primary }]}>
			{/* Header row — always visible */}
			<TouchableOpacity
				style={styles.cardHeader}
				onPress={() => setExpanded((v) => !v)}
				accessibilityLabel={`Item ${index + 1}: ${item.design_name || 'Unknown'}, tap to edit`}
				accessibilityRole="button"
			>
				<View style={{ flex: 1 }}>
					<ThemedText weight="bold" style={{ fontSize: 15 }}>
						{item.design_name || 'Unknown Design'}
					</ThemedText>
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={{ marginTop: 2 }}
					>
						{item.category || 'N/A'} • {item.size || 'Size N/A'}
					</ThemedText>
				</View>
				<View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
					<ThemedText color={c.primary} weight="bold" style={{ fontSize: 16 }}>
						{item.box_count ?? '—'} Boxes
					</ThemedText>
					{item.price_per_box ? (
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							₹{item.price_per_box}/box
						</ThemedText>
					) : null}
				</View>
				<View style={{ marginLeft: 8 }}>
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
						label="Design Name"
						value={item.design_name ?? ''}
						onChangeText={(v) => onUpdate(index, 'design_name', v)}
						containerStyle={{ marginBottom: s.sm }}
					/>
					<View style={{ flexDirection: 'row', gap: s.sm }}>
						<TextInput
							label="Category"
							value={item.category ?? ''}
							onChangeText={(v) => onUpdate(index, 'category', v)}
							containerStyle={{ flex: 1, marginBottom: s.sm }}
						/>
						<TextInput
							label="Size"
							value={item.size ?? ''}
							onChangeText={(v) => onUpdate(index, 'size', v)}
							containerStyle={{ flex: 1, marginBottom: s.sm }}
						/>
					</View>
					<View style={{ flexDirection: 'row', gap: s.sm }}>
						<TextInput
							label="Box Count *"
							value={item.box_count !== undefined ? String(item.box_count) : ''}
							onChangeText={(v) => {
								const n = parseFloat(v);
								onUpdate(index, 'box_count', isNaN(n) ? 0 : n);
							}}
							keyboardType="numeric"
							containerStyle={{ flex: 1, marginBottom: s.sm }}
						/>
						<TextInput
							label="Price / Box"
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
						accessibilityLabel={`Remove item ${index + 1}`}
						accessibilityRole="button"
					>
						<Trash2 size={14} color={c.error} />
						<ThemedText color={c.error} style={{ marginLeft: 4, fontSize: 13 }}>
							Remove Item
						</ThemedText>
					</TouchableOpacity>
				</View>
			)}
		</View>
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
			Alert.alert('No Text', 'Please paste or type some order text first.');
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
				<ScreenHeader title="Import Order" />
				<FileText
					size={64}
					color={c.primary}
					style={{ opacity: 0.5, marginBottom: s.xl }}
				/>
				<ThemedText variant="h3">Analyzing Document...</ThemedText>
				<ThemedText
					color={c.placeholder}
					align="center"
					style={{ marginTop: s.sm, paddingHorizontal: s.xl }}
				>
					Our AI is reading your input to automatically extract exactly what was ordered.
				</ThemedText>
			</AtomicScreen>
		);
	}

	// ── Review / edit extracted items ───────────────────────────────────────────
	if (resolvedItems) {
		return (
			<AtomicScreen safeAreaEdges={['bottom']}>
				<ScreenHeader
					title="Review Import"
					rightElement={
						<TouchableOpacity onPress={handleDiscard}>
							<ThemedText color={c.error}>Discard</ThemedText>
						</TouchableOpacity>
					}
				/>

				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					keyboardVerticalOffset={100}
				>
					<ScrollView style={{ flex: 1, padding: s.lg }}>
						<View style={{ marginBottom: s.xl }}>
							<TextInput
								label="Party/Supplier Name *"
								placeholder="e.g. Kajaria Ceramics Ltd."
								value={partyName}
								onChangeText={setPartyName}
							/>
						</View>

						<View style={styles.sectionHeader}>
							<ThemedText variant="h3">
								Extracted Items ({resolvedItems.length})
							</ThemedText>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ marginTop: 2 }}
							>
								Tap any card to edit
							</ThemedText>
						</View>

						{resolvedItems.map((item, index) => (
							<EditableItemCard
								key={`${item.design_name ?? item.base_item_number ?? ''}-${index}`}
								item={item}
								index={index}
								onUpdate={handleUpdateItem}
								onRemove={handleRemoveItem}
								colors={c}
								spacing={s}
							/>
						))}

						{/* Add item row */}
						<TouchableOpacity
							style={[styles.addItemBtn, { borderColor: c.primary }]}
							onPress={handleAddItem}
							accessibilityRole="button"
							accessibilityLabel="Add a new item"
						>
							<PlusCircle size={16} color={c.primary} />
							<ThemedText color={c.primary} style={{ marginLeft: 6, fontSize: 14 }}>
								Add Item Manually
							</ThemedText>
						</TouchableOpacity>

						{/* Bottom padding so last card isn't hidden by footer */}
						<View style={{ height: 80 }} />
					</ScrollView>
				</KeyboardAvoidingView>

				<View style={[styles.footer, { borderTopColor: c.border }]}>
					<Button
						title="Confirm Import & Add Stock"
						variant="primary"
						onPress={handleSave}
						loading={saving}
					/>
				</View>
			</AtomicScreen>
		);
	}

	// ── Upload / paste page ─────────────────────────────────────────────────────
	return (
		<AtomicScreen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Import Order (AI)" />

			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={80}
			>
				<ScrollView contentContainerStyle={{ padding: s.lg }}>
					<ThemedText style={{ lineHeight: 22, marginBottom: s.xl }}>
						Upload a PDF, image, or paste order text. The AI will extract all items and
						automatically restock your inventory.
					</ThemedText>

					{/* Tab switcher */}
					<View
						style={[
							styles.tabBar,
							{ backgroundColor: c.surfaceVariant, borderColor: c.border },
						]}
					>
						<TouchableOpacity
							style={[
								styles.tab,
								inputMode === 'file' && { backgroundColor: c.primary },
							]}
							onPress={() => setInputMode('file')}
							accessibilityRole="tab"
							accessibilityLabel="File upload tab"
							accessibilityState={{ selected: inputMode === 'file' }}
						>
							<FileUp
								size={16}
								color={inputMode === 'file' ? '#fff' : c.onSurfaceVariant}
							/>
							<ThemedText
								style={{ marginLeft: 6, fontSize: 14 }}
								color={inputMode === 'file' ? '#fff' : c.onSurfaceVariant}
								weight={inputMode === 'file' ? 'bold' : 'regular'}
							>
								File / Image
							</ThemedText>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.tab,
								inputMode === 'text' && { backgroundColor: c.primary },
							]}
							onPress={() => setInputMode('text')}
							accessibilityRole="tab"
							accessibilityLabel="Paste text tab"
							accessibilityState={{ selected: inputMode === 'text' }}
						>
							<ClipboardList
								size={16}
								color={inputMode === 'text' ? '#fff' : c.onSurfaceVariant}
							/>
							<ThemedText
								style={{ marginLeft: 6, fontSize: 14 }}
								color={inputMode === 'text' ? '#fff' : c.onSurfaceVariant}
								weight={inputMode === 'text' ? 'bold' : 'regular'}
							>
								Paste Text
							</ThemedText>
						</TouchableOpacity>
					</View>

					{/* File upload panel */}
					{inputMode === 'file' && (
						<View
							style={[
								styles.uploadBox,
								{ backgroundColor: c.surfaceVariant, borderColor: c.border },
							]}
						>
							<FileUp size={48} color={c.primary} style={{ marginBottom: s.md }} />
							<ThemedText weight="bold" style={{ fontSize: 16, marginBottom: 4 }}>
								Select Document or Image
							</ThemedText>
							<ThemedText
								variant="caption"
								color={c.placeholder}
								align="center"
								style={{ marginBottom: s.lg }}
							>
								Supported: .pdf, .jpg, .png
							</ThemedText>
							<Button
								title="Browse Files"
								onPress={handleUploadFile}
								variant="outline"
							/>
						</View>
					)}

					{/* Text paste panel */}
					{inputMode === 'text' && (
						<View
							style={[
								styles.textBox,
								{ backgroundColor: c.surfaceVariant, borderColor: c.border },
							]}
						>
							<View style={styles.textBoxHeader}>
								<ClipboardList size={20} color={c.primary} />
								<ThemedText weight="bold" style={{ marginLeft: 8, fontSize: 15 }}>
									Paste Order Text
								</ThemedText>
							</View>
							<ThemedText
								variant="caption"
								color={c.placeholder}
								style={{ marginBottom: s.md }}
							>
								Copy text from a WhatsApp message, SMS, email, or any source and
								paste it below. The AI will pick out item names, sizes, and
								quantities.
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
									placeholder={
										'Paste order text here…\n\nExample:\nKajaria GLPM 60x60 – 20 boxes\nOriental WF-8800 GVT 80x80 – 12 boxes @ ₹450'
									}
									placeholderTextColor={c.placeholder}
									value={pastedText}
									onChangeText={setPastedText}
									style={[styles.textArea, { color: c.onSurface }]}
									accessibilityLabel="Order text input"
								/>
							</View>

							<Button
								title="Analyze Text with AI"
								onPress={handleParseText}
								variant="primary"
								style={{ marginTop: s.lg }}
							/>
						</View>
					)}
				</ScrollView>
			</KeyboardAvoidingView>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	// Tab switcher
	tabBar: {
		flexDirection: 'row',
		borderRadius: 12,
		borderWidth: 1,
		overflow: 'hidden',
		marginBottom: 20,
	},
	tab: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		paddingHorizontal: 8,
		borderRadius: 11,
	},

	// File upload
	uploadBox: {
		borderWidth: 2,
		borderStyle: 'dashed',
		borderRadius: 16,
		padding: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},

	// Text paste
	textBox: {
		borderWidth: 1,
		borderRadius: 16,
		padding: 20,
	},
	textBoxHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	textAreaWrapper: {
		borderWidth: 1,
		borderRadius: 10,
		padding: 12,
		minHeight: 180,
	},
	textArea: {
		fontSize: 14,
		lineHeight: 22,
		minHeight: 160,
	},

	// Review screen
	sectionHeader: {
		marginBottom: 12,
	},
	card: {
		borderRadius: 12,
		marginBottom: 12,
		borderLeftWidth: 4,
		overflow: 'hidden',
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
	},
	editFields: {
		borderTopWidth: 1,
		padding: 16,
		paddingTop: 12,
	},
	removeBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderRadius: 8,
		paddingVertical: 8,
		marginTop: 4,
	},
	addItemBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1.5,
		borderStyle: 'dashed',
		borderRadius: 10,
		paddingVertical: 12,
		marginTop: 4,
	},
	footer: { padding: 20, paddingBottom: 12, borderTopWidth: 1 },
});
