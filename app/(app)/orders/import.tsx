import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FileUp, FileText } from 'lucide-react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useOrderStore } from '@/src/stores/orderStore';
import { pdfService } from '@/src/services/pdfService';
import { useLocale } from '@/src/hooks/useLocale';
import { Button } from '@/src/components/atoms/Button';
import { TextInput } from '@/src/components/atoms/TextInput';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';

export default function ImportOrderScreen() {
	const { c, s } = useThemeTokens();
	const { t } = useLocale();
	const router = useRouter();

	const { parseDocument, isParsing, parsedData, importParsedData, clearParsedData } =
		useOrderStore();
	const [partyName, setPartyName] = useState('');
	const [saving, setSaving] = useState(false);

	const handleUpload = async () => {
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

	const handleSave = async () => {
		if (!partyName) {
			Alert.alert(t('order.detailsMissing'), t('order.partyNameRequired'));
			return;
		}
		if (!parsedData || parsedData.length === 0) {
			Alert.alert(t('order.noItemsTitle'), t('order.noItemsMessage'));
			return;
		}

		setSaving(true);
		try {
			await importParsedData(partyName, parsedData);
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
					Our AI is reading your document to automatically extract exactly what was
					ordered.
				</ThemedText>
			</AtomicScreen>
		);
	}

	if (parsedData) {
		return (
			<AtomicScreen safeAreaEdges={['bottom']}>
				<ScreenHeader
					title="Review Import"
					rightElement={
						<TouchableOpacity onPress={clearParsedData}>
							<ThemedText color={c.error}>Discard</ThemedText>
						</TouchableOpacity>
					}
				/>

				<ScrollView style={{ flex: 1, padding: s.lg }}>
					<View style={{ marginBottom: s.xl }}>
						<TextInput
							label="Party/Supplier Name *"
							placeholder="e.g. Kajaria Ceramics Ltd."
							value={partyName}
							onChangeText={setPartyName}
						/>
					</View>

					<ThemedText variant="h3" style={{ marginBottom: s.md }}>
						Extracted Items ({parsedData.length})
					</ThemedText>

					{parsedData.map((item, index) => (
						<View
							key={index}
							style={[
								styles.card,
								{ backgroundColor: c.surface, borderLeftColor: c.primary },
							]}
						>
							<View style={{ flex: 1 }}>
								<ThemedText weight="bold" style={{ fontSize: 15 }}>
									{item.design_name || 'Unknown Design'}
								</ThemedText>
								<ThemedText
									variant="caption"
									color={c.onSurfaceVariant}
									style={{ marginTop: 4 }}
								>
									{item.category || 'N/A'} • {item.size || 'Size N/A'}
								</ThemedText>
							</View>
							<View style={{ alignItems: 'flex-end' }}>
								<ThemedText
									color={c.primary}
									weight="bold"
									style={{ fontSize: 16 }}
								>
									{item.box_count} Boxes
								</ThemedText>
								{item.price_per_box ? (
									<ThemedText variant="caption" color={c.onSurfaceVariant}>
										₹{item.price_per_box}/box
									</ThemedText>
								) : null}
							</View>
						</View>
					))}
				</ScrollView>

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

	return (
		<AtomicScreen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Import Order (AI)" />

			<ScrollView contentContainerStyle={{ padding: s.lg }}>
				<ThemedText style={{ lineHeight: 22, marginBottom: s.xl }}>
					Upload a PDF performa invoice, bill, or image of an order. The AI will extract
					all items and automatically restock your inventory.
				</ThemedText>

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
					<Button title="Browse Files" onPress={handleUpload} variant="outline" />
				</View>
			</ScrollView>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	uploadBox: {
		borderWidth: 2,
		borderStyle: 'dashed',
		borderRadius: 16,
		padding: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		borderRadius: 12,
		marginBottom: 12,
		borderLeftWidth: 4,
	},
	footer: { padding: 20, paddingBottom: 12, borderTopWidth: 1 },
});
