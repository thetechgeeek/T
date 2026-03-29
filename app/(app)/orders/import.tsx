import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Animated, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FileUp, FileText, CheckCircle2, ChevronRight, Save, KeyRound } from 'lucide-react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useOrderStore } from '@/src/stores/orderStore';
import { pdfService } from '@/src/services/pdfService';
import { Button } from '@/src/components/atoms/Button';
import { TextInput } from '@/src/components/atoms/TextInput';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';

export default function ImportOrderScreen() {
	const { c, s } = useThemeTokens();
	const router = useRouter();

	const { parseDocument, isParsing, parsedData, importParsedData, clearParsedData } =
		useOrderStore();
	const [aiKey, setAiKey] = useState('');
	const [partyName, setPartyName] = useState('');
	const [saving, setSaving] = useState(false);

	const handleUpload = async () => {
		try {
			const doc = await pdfService.pickPdfDocument();
			if (!doc) return;

			// Try to upload to storage first (avoids large base64 in request body)
			const storagePath = await pdfService.uploadDocumentToStorage(
				doc.uri,
				doc.name,
				doc.mimeType,
			);

			await parseDocument(
				doc.uri,
				doc.mimeType,
				aiKey || undefined,
				storagePath ?? undefined,
			);
		} catch (err: unknown) {
			Alert.alert('Processing Failed', err instanceof Error ? err.message : 'Unknown error');
		}
	};

	const handleSave = async () => {
		if (!partyName) {
			Alert.alert('Details Missing', 'Please enter a Party/Supplier Name for this order.');
			return;
		}
		if (!parsedData || parsedData.length === 0) {
			Alert.alert('No Items', 'No items were parsed from this document.');
			return;
		}

		setSaving(true);
		try {
			await importParsedData(partyName, parsedData);
			Alert.alert('Success', 'Order has been imported and stock updated successfully!');
			router.back();
		} catch (err: any) {
			Alert.alert('Import Failed', err.message);
		} finally {
			setSaving(false);
		}
	};

	if (isParsing) {
		return (
			<Screen
				safeAreaEdges={['top', 'bottom']}
				style={{ alignItems: 'center', justifyContent: 'center' }}
			>
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
			</Screen>
		);
	}

	if (parsedData) {
		return (
			<Screen safeAreaEdges={['top', 'bottom']}>
				<View style={[styles.header, { borderBottomColor: c.border }]}>
					<ThemedText variant="h2">Review Import</ThemedText>
					<TouchableOpacity onPress={clearParsedData}>
						<ThemedText color={c.error}>Discard</ThemedText>
					</TouchableOpacity>
				</View>

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
			</Screen>
		);
	}

	return (
		<Screen safeAreaEdges={['top', 'bottom']}>
			<View style={[styles.header, { borderBottomColor: c.border }]}>
				<ThemedText variant="h2">Import Order (AI)</ThemedText>
			</View>

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

				<View
					style={{
						marginTop: s.xl,
						padding: s.lg,
						backgroundColor: c.surfaceVariant + '40',
						borderRadius: theme.borderRadius.md,
					}}
				>
					<View
						style={{ flexDirection: 'row', alignItems: 'center', marginBottom: s.md }}
					>
						<KeyRound size={20} color={c.onSurfaceVariant} />
						<ThemedText variant="label" weight="bold" style={{ marginLeft: s.sm }}>
							Developer Override (Optional)
						</ThemedText>
					</View>
					<ThemedText
						variant="caption"
						color={c.placeholder}
						style={{ marginBottom: s.md }}
					>
						If your Edge Function does not have the GEMINI_API_KEY secret set, paste
						your Gemini API key here to process the document.
					</ThemedText>
					<TextInput
						label="Gemini API Key"
						placeholder="AIzaSy..."
						value={aiKey}
						onChangeText={setAiKey}
						secureTextEntry
					/>
				</View>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	header: {
		paddingHorizontal: 20,
		paddingVertical: 12,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderBottomWidth: 1,
	},
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
