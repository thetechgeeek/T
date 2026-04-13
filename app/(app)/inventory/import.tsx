import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

/** Template preview: sample item cost price shown before user data is loaded */
const TEMPLATE_PREVIEW_COST_PRICE = 350;
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { Upload, Download, CheckCircle2, RefreshCw } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { Card } from '@/src/components/atoms/Card';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { inventoryService } from '@/src/services/inventoryService';
import { itemCategoryService, itemUnitService } from '@/src/services/itemCategoryService';
import type { ItemCategory, ItemUnit, InventoryItemInsert } from '@/src/types/inventory';
const STEPS = [
	{ id: 1, title: 'Template' },
	{ id: 2, title: 'Upload' },
	{ id: 3, title: 'Map' },
	{ id: 4, title: 'Validate' },
	{ id: 5, title: 'Import' },
];

const REQUIRED_FIELDS = ['design_name', 'selling_price', 'category_id', 'unit_id'];

function mappedCell(
	row: Record<string, unknown>,
	mapping: Record<string, string>,
	field: string,
): string {
	const header = Object.keys(mapping).find((k) => mapping[k] === field);
	if (!header) return '';
	const v = row[header];
	return v == null ? '' : String(v);
}

export default function InventoryImportScreen() {
	const { c, s } = useThemeTokens();
	const { t } = useLocale();
	const router = useRouter();

	const [currentStep, setCurrentStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [categories, setCategories] = useState<ItemCategory[]>([]);
	const [units, setUnits] = useState<ItemUnit[]>([]);
	const [rawFileData, setRawFileData] = useState<Record<string, unknown>[]>([]);
	const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
	const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(
		null,
	);

	useEffect(() => {
		loadMasterData();
	}, []);

	const loadMasterData = async () => {
		try {
			const [cats, uns] = await Promise.all([
				itemCategoryService.fetchAll(),
				itemUnitService.fetchAll(),
			]);
			setCategories(cats);
			setUnits(uns);
		} catch {
			Alert.alert(t('common.error'), 'Failed to load master data');
		}
	};

	const downloadTemplate = async () => {
		try {
			const ws = XLSX.utils.json_to_sheet([
				{
					design_name: 'Glossy White 60x60',
					item_code: 'GW-6060',
					category: categories[0]?.name_en || 'Tiles',
					unit: units[0]?.abbreviation || 'Box',
					selling_price: 500,
					cost_price: TEMPLATE_PREVIEW_COST_PRICE,
					hsn_code: '6908',
					gst_rate: 18,
					low_stock_threshold: 10,
					has_batch_tracking: false,
					has_serial_tracking: false,
					notes: 'Imported from template',
				},
			]);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
			const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
			const base = FileSystem.documentDirectory;
			if (!base) {
				Alert.alert(t('common.error'), 'Storage unavailable');
				return;
			}
			const uri = base + 'Inventory_Template.xlsx';
			await FileSystem.writeAsStringAsync(uri, wbout, {
				encoding: FileSystem.EncodingType.Base64,
			});
			await Sharing.shareAsync(uri);
		} catch {
			Alert.alert(t('common.error'), 'Failed to generate template');
		}
	};

	const pickFile = async () => {
		try {
			setLoading(true);
			const res = await DocumentPicker.getDocumentAsync({
				type: [
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
					'text/csv',
				],
			});

			if (!res.canceled && res.assets && res.assets[0]) {
				const file = res.assets[0];
				const content = await FileSystem.readAsStringAsync(file.uri, {
					encoding: FileSystem.EncodingType.Base64,
				});
				const wb = XLSX.read(content, { type: 'base64' });
				const wsname = wb.SheetNames[0];
				const ws = wb.Sheets[wsname];
				const data = XLSX.utils.sheet_to_json(ws);

				if (data.length === 0) {
					Alert.alert(t('common.error'), 'The selected file is empty');
					return;
				}

				setRawFileData(data as Record<string, unknown>[]);
				// Initial auto-mapping
				const headers = Object.keys(data[0] as Record<string, unknown>);
				const initialMapping: Record<string, string> = {};
				headers.forEach((h) => {
					const match = REQUIRED_FIELDS.find((rf) =>
						h.toLowerCase().includes(rf.toLowerCase().replace('_', ' ')),
					);
					if (match) initialMapping[h] = match;
				});
				setColumnMapping(initialMapping);
				setCurrentStep(3);
			}
		} catch {
			Alert.alert(t('common.error'), 'Failed to read file');
		} finally {
			setLoading(false);
		}
	};

	const handleImport = async () => {
		try {
			setLoading(true);
			const itemsToInsert: InventoryItemInsert[] = rawFileData.map((row) => {
				const item: InventoryItemInsert = {
					design_name: mappedCell(row, columnMapping, 'design_name') || 'Unnamed Item',
					selling_price: parseFloat(mappedCell(row, columnMapping, 'selling_price')) || 0,
					gst_rate: 18,
					hsn_code: '6908',
					cost_price: 0,
					box_count: 0,
					has_batch_tracking: false,
					has_serial_tracking: false,
					low_stock_threshold: 5,
					category_id: categories[0]?.id,
					unit_id: units[0]?.id,
				};

				// Map category/unit by name if possible
				const catName = mappedCell(row, columnMapping, 'category_id');
				if (catName) {
					const cat = categories.find(
						(c) => c.name_en === catName || c.name_hi === catName,
					);
					if (cat) item.category_id = cat.id;
				}
				if (!item.category_id && categories.length > 0) item.category_id = categories[0].id;

				const unitAbbr = mappedCell(row, columnMapping, 'unit_id');
				if (unitAbbr) {
					const unit = units.find(
						(u) => u.abbreviation === unitAbbr || u.name === unitAbbr,
					);
					if (unit) item.unit_id = unit.id;
				}
				if (!item.unit_id && units.length > 0)
					item.unit_id = units.find((u) => u.is_default)?.id || units[0].id;

				return item;
			});

			const results = await inventoryService.bulkCreateItems(itemsToInsert);
			setImportResult({ success: results.length, failed: 0 });
			setCurrentStep(5);
		} catch (err) {
			Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Import failed');
		} finally {
			setLoading(false);
		}
	};

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<Card style={styles.stepCard}>
						<Download
							size={48}
							color={c.primary}
							style={{ alignSelf: 'center', marginBottom: s.md }}
						/>
						<ThemedText
							variant="h3"
							style={{ textAlign: 'center', marginBottom: s.sm }}
						>
							{t('inventory.step1Template')}
						</ThemedText>
						<ThemedText
							variant="body"
							color={c.onSurfaceVariant}
							style={{ textAlign: 'center', marginBottom: s.lg }}
						>
							Download correctly formatted Excel template to avoid import errors.
						</ThemedText>
						<Button
							title="Download Excel Template"
							onPress={downloadTemplate}
							variant="outline"
						/>
						<Button
							title="Continue to Upload"
							onPress={() => setCurrentStep(2)}
							style={{ marginTop: s.md }}
						/>
					</Card>
				);
			case 2:
				return (
					<Card style={styles.stepCard}>
						<Upload
							size={48}
							color={c.primary}
							style={{ alignSelf: 'center', marginBottom: s.md }}
						/>
						<ThemedText
							variant="h3"
							style={{ textAlign: 'center', marginBottom: s.sm }}
						>
							{t('inventory.step2Upload')}
						</ThemedText>
						<ThemedText
							variant="body"
							color={c.onSurfaceVariant}
							style={{ textAlign: 'center', marginBottom: s.lg }}
						>
							Select your Excel (.xlsx) or CSV file containing item data.
						</ThemedText>
						<Button title="Select File" onPress={pickFile} loading={loading} />
					</Card>
				);
			case 3:
				return (
					<Card style={styles.stepCard}>
						<RefreshCw
							size={48}
							color={c.primary}
							style={{ alignSelf: 'center', marginBottom: s.md }}
						/>
						<ThemedText
							variant="h3"
							style={{ textAlign: 'center', marginBottom: s.sm }}
						>
							{t('inventory.step3Map')}
						</ThemedText>
						<ThemedText
							variant="body"
							color={c.onSurfaceVariant}
							style={{ textAlign: 'center', marginBottom: s.lg }}
						>
							Ensure your Excel columns match our system fields.
						</ThemedText>
						{/* Mapping logic here - simplified version */}
						<ThemedText variant="captionBold" style={{ marginBottom: s.xs }}>
							Required matches found: {Object.keys(columnMapping).length} /{' '}
							{REQUIRED_FIELDS.length}
						</ThemedText>
						<Button
							title="Validate Data"
							onPress={() => setCurrentStep(4)}
							style={{ marginTop: s.md }}
						/>
					</Card>
				);
			case 4:
				return (
					<Card style={styles.stepCard}>
						<CheckCircle2
							size={48}
							color={c.success}
							style={{ alignSelf: 'center', marginBottom: s.md }}
						/>
						<ThemedText
							variant="h3"
							style={{ textAlign: 'center', marginBottom: s.sm }}
						>
							{t('inventory.step4Validate')}
						</ThemedText>
						<ThemedText
							variant="body"
							color={c.onSurfaceVariant}
							style={{ textAlign: 'center', marginBottom: s.lg }}
						>
							We found {rawFileData.length} items to import. Ready to proceed?
						</ThemedText>
						<Button
							title={`Import ${rawFileData.length} Items`}
							onPress={handleImport}
							loading={loading}
						/>
					</Card>
				);
			case 5:
				return (
					<Card style={styles.stepCard}>
						<CheckCircle2
							size={64}
							color={c.success}
							style={{ alignSelf: 'center', marginBottom: s.md }}
						/>
						<ThemedText
							variant="h2"
							style={{ textAlign: 'center', marginBottom: s.sm }}
						>
							Import Complete!
						</ThemedText>
						<ThemedText
							variant="body"
							color={c.onSurfaceVariant}
							style={{ textAlign: 'center', marginBottom: s.lg }}
						>
							Successfully added {importResult?.success} new products to your
							inventory. 🎉
						</ThemedText>
						<Button
							title="Go to Inventory"
							onPress={() => router.replace('/(app)/(tabs)/inventory')}
						/>
					</Card>
				);
			default:
				return null;
		}
	};

	return (
		<AtomicScreen safeAreaEdges={['bottom']}>
			<ScreenHeader title={t('inventory.importItems')} />

			<View style={[styles.stepper, { paddingHorizontal: s.lg }]}>
				{STEPS.map((s, idx) => (
					<View key={s.id} style={styles.stepIndicator}>
						<View
							style={[
								styles.stepCircle,
								{
									backgroundColor:
										currentStep >= s.id ? c.primary : c.surfaceVariant,
									borderColor: currentStep === s.id ? c.primary : 'transparent',
									borderWidth: currentStep === s.id ? 2 : 0,
								},
							]}
						>
							<ThemedText
								variant="captionSmall"
								color={currentStep >= s.id ? c.onPrimary : c.onSurfaceVariant}
							>
								{s.id}
							</ThemedText>
						</View>
						{idx < STEPS.length - 1 && (
							<View
								style={[
									styles.stepLine,
									{ backgroundColor: currentStep > s.id ? c.primary : c.border },
								]}
							/>
						)}
					</View>
				))}
			</View>

			<ScrollView contentContainerStyle={{ padding: s.lg }}>{renderStep()}</ScrollView>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	stepper: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 20,
		marginBottom: 32,
	},
	stepIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	stepCircle: {
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	stepLine: {
		flex: 1,
		height: 2,
		marginHorizontal: 4,
	},
	stepCard: {
		paddingVertical: 40,
		alignItems: 'stretch',
	},
});
