import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
	View,
	StyleSheet,
	ScrollView,
	Alert,
	TouchableOpacity,
	Switch,
	TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Save, RefreshCw } from 'lucide-react-native';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SkeletonBlock } from '@/src/components/molecules/SkeletonBlock';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { FormField } from '@/src/components/molecules/FormField';
import type { TileCategory } from '@/src/types/inventory';
import type { UUID } from '@/src/types/common';
import { inventoryService } from '@/src/services/inventoryService';
import { layout } from '@/src/theme/layout';

// ─── Schema ─────────────────────────────────────────────────────────────────

const getSchema = (t: (key: string) => string) =>
	z.object({
		// Section 1 — Basic Info
		design_name: z.string().min(1, t('common.required')),
		item_code: z.string().optional(),
		category: z.enum(['GLOSSY', 'FLOOR', 'MATT', 'SATIN', 'WOODEN', 'ELEVATION', 'OTHER']),
		custom_category: z.string().optional(),
		item_description: z.string().max(500).optional(),

		// Section 2 — Pricing
		selling_price: z.string().min(1, t('common.required')),
		cost_price: z.string().optional(),
		mrp: z.string().optional(),
		default_discount_pct: z.string().optional(),

		// Section 3 — Tax
		gst_rate: z.string().min(1, t('common.required')),
		hsn_code: z.string().optional(),

		// Section 4 — Stock & Units
		track_stock: z.boolean(),
		primary_unit: z.string().optional(),
		box_count: z.string().optional(),
		has_batch_tracking: z.boolean(),
		has_serial_tracking: z.boolean(),
		low_stock_threshold: z.string().optional(),
		use_secondary_unit: z.boolean(),
		secondary_unit_name: z.string().optional(),
		secondary_unit_conversion: z.string().optional(),

		// Section 5 — Tile-specific
		size_name: z.string().optional(),
		brand_name: z.string().optional(),
		pcs_per_box: z.string().optional(),
		sqft_per_box: z.string().optional(),
	});

type FormData = z.infer<ReturnType<typeof getSchema>>;

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES: TileCategory[] = [
	'GLOSSY',
	'FLOOR',
	'MATT',
	'SATIN',
	'WOODEN',
	'ELEVATION',
	'OTHER',
];

const GST_RATES = ['0', '5', '12', '18', '28'];

const PRIMARY_UNITS = ['Pcs', 'Box', 'Kg', 'Meter', 'Sq.ft', 'Sq.meter', 'Set'];

// ─── Helper sub-components ───────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
	const { c, s } = useThemeTokens();
	return (
		<ThemedText
			variant="h3"
			style={[{ marginTop: s.lg, marginBottom: s.sm, color: c.onSurface }] as any}
		>
			{label}
		</ThemedText>
	);
}

function ChipGroup<T extends string>({
	options,
	value,
	onChange,
	labelMap,
}: {
	options: T[];
	value: T;
	onChange: (v: T) => void;
	labelMap?: Record<string, string>;
}) {
	const { c, s, r } = useThemeTokens();
	return (
		<View style={[layout.row, { flexWrap: 'wrap', gap: 8, marginBottom: s.md }]}>
			{options.map((opt) => (
				<TouchableOpacity
					key={opt}
					onPress={() => onChange(opt)}
					style={{
						paddingVertical: 8,
						paddingHorizontal: 12,
						backgroundColor: value === opt ? c.primary : c.surfaceVariant,
						borderRadius: r.md,
					}}
				>
					<ThemedText
						variant="caption"
						weight="semibold"
						color={value === opt ? c.onPrimary : c.onSurfaceVariant}
					>
						{labelMap ? (labelMap[opt] ?? opt) : opt}
					</ThemedText>
				</TouchableOpacity>
			))}
		</View>
	);
}

// ─── Live Margin Banner ───────────────────────────────────────────────────────

function MarginBanner({ sellingPrice, costPrice }: { sellingPrice: string; costPrice: string }) {
	const { c, s, r } = useThemeTokens();
	const sp = parseFloat(sellingPrice) || 0;
	const cp = parseFloat(costPrice) || 0;
	if (!sp || !cp) return null;
	const margin = sp - cp;
	const pct = ((margin / sp) * 100).toFixed(1);
	const isPositive = margin >= 0;
	return (
		<View
			style={{
				backgroundColor: isPositive
					? (c.successLight ?? '#e6f4ea')
					: (c.errorLight ?? '#fce8e6'),
				borderRadius: r.sm,
				padding: s.sm,
				marginBottom: s.md,
			}}
		>
			<ThemedText variant="caption" color={isPositive ? (c.success ?? '#1e8e3e') : c.error}>
				{`Margin: ₹${margin.toFixed(2)} (${pct}%)`}
			</ThemedText>
		</View>
	);
}

// ─── GST Preview Banner ───────────────────────────────────────────────────────

function GSTPreviewBanner({ sellingPrice, gstRate }: { sellingPrice: string; gstRate: string }) {
	const { c, s, r } = useThemeTokens();
	const base = parseFloat(sellingPrice) || 1000;
	const rate = parseFloat(gstRate) || 0;
	if (!rate) return null;
	const halfRate = rate / 2;
	const cgst = ((base * halfRate) / 100).toFixed(2);
	const sgst = ((base * halfRate) / 100).toFixed(2);
	const total = (base + (base * rate) / 100).toFixed(2);
	return (
		<View
			style={{
				backgroundColor: c.surfaceVariant,
				borderRadius: r.sm,
				padding: s.sm,
				marginBottom: s.md,
			}}
		>
			<ThemedText variant="caption" color={c.onSurfaceVariant}>
				{`On ₹${base.toFixed(0)}: CGST ₹${cgst} + SGST ₹${sgst} = Total ₹${total}`}
			</ThemedText>
		</View>
	);
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AddItemScreen() {
	const { c, s, r } = useThemeTokens();
	const { t } = useLocale();
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id?: UUID }>();
	const isEditing = !!id;

	const { createItem, updateItem } = useInventoryStore(
		useShallow((st) => ({ createItem: st.createItem, updateItem: st.updateItem })),
	);
	const [loading, setLoading] = useState(isEditing);
	const [submitting, setSubmitting] = useState(false);

	const {
		control,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(getSchema(t)),
		defaultValues: {
			// Basic Info
			design_name: '',
			item_code: '',
			category: 'GLOSSY',
			custom_category: '',
			item_description: '',
			// Pricing
			selling_price: '',
			cost_price: '',
			mrp: '',
			default_discount_pct: '',
			// Tax
			gst_rate: '18',
			hsn_code: '6908',
			// Stock & Units
			track_stock: true,
			primary_unit: 'Box',
			box_count: '0',
			has_batch_tracking: false,
			has_serial_tracking: false,
			low_stock_threshold: '5',
			use_secondary_unit: false,
			secondary_unit_name: '',
			secondary_unit_conversion: '',
			// Tile-specific
			size_name: '',
			brand_name: '',
			pcs_per_box: '',
			sqft_per_box: '',
		},
	});

	// Watch values for live calculations
	const watchedSelling = useWatch({ control, name: 'selling_price' });
	const watchedCost = useWatch({ control, name: 'cost_price' });
	const watchedGst = useWatch({ control, name: 'gst_rate' });
	const watchedTrackStock = useWatch({ control, name: 'track_stock' });
	const watchedSecondaryUnit = useWatch({ control, name: 'use_secondary_unit' });
	const watchedPrimaryUnit = useWatch({ control, name: 'primary_unit' });
	const watchedSecondaryUnitName = useWatch({ control, name: 'secondary_unit_name' });

	// Auto-generate item code
	const handleAutoGenerateCode = () => {
		const now = new Date();
		const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let rand = '';
		for (let i = 0; i < 4; i++) {
			rand += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		setValue('item_code', `${datePart}-${rand}`, { shouldDirty: true });
	};

	useEffect(() => {
		if (isEditing && id) {
			inventoryService
				.fetchItemById(id)
				.then((data: any) => {
					reset({
						design_name: data.design_name,
						item_code: '',
						category: data.category as any,
						custom_category: data.custom_category as any,
						item_description: data.notes || '',
						selling_price: data.selling_price.toString(),
						cost_price: data.cost_price?.toString() || '',
						mrp: '',
						default_discount_pct: '',
						gst_rate: data.gst_rate.toString(),
						hsn_code: data.hsn_code || '6908',
						track_stock: true,
						primary_unit: 'Box',
						box_count: data.box_count.toString(),
						has_batch_tracking: false,
						has_serial_tracking: false,
						low_stock_threshold: data.low_stock_threshold.toString(),
						use_secondary_unit: false,
						secondary_unit_name: '',
						secondary_unit_conversion: '',
						size_name: data.size_name || '',
						brand_name: data.brand_name || '',
						pcs_per_box: data.pcs_per_box?.toString() || '',
						sqft_per_box: data.sqft_per_box?.toString() || '',
					});
					setLoading(false);
				})
				.catch((_err) => {
					Alert.alert(t('common.errorTitle'), t('inventory.loadError'), [
						{ text: t('common.ok') },
					]);
					router.back();
				});
		}
	}, [id, isEditing, reset, router, t]);

	const onSubmit = async (data: FormData) => {
		setSubmitting(true);
		try {
			const payload = {
				// Core existing fields
				design_name: data.design_name,
				category: data.category,
				size_name: data.size_name || undefined,
				brand_name: data.brand_name || undefined,
				pcs_per_box: data.pcs_per_box ? parseInt(data.pcs_per_box) : undefined,
				sqft_per_box: data.sqft_per_box ? parseFloat(data.sqft_per_box) : undefined,
				box_count: data.track_stock ? parseInt(data.box_count || '0') || 0 : 0,
				has_batch_tracking: false,
				has_serial_tracking: false,
				selling_price: parseFloat(data.selling_price) || 0,
				cost_price: parseFloat(data.cost_price || '0') || 0,
				low_stock_threshold: data.track_stock
					? parseInt(data.low_stock_threshold || '5') || 5
					: 0,
				gst_rate: parseInt(data.gst_rate) || 18,
				hsn_code: data.hsn_code || '6908',
				notes: data.item_description || undefined,
				// Extra fields passed through to Supabase
				item_code: data.item_code || undefined,
				mrp: data.mrp ? parseFloat(data.mrp) : undefined,
				default_discount_pct: data.default_discount_pct
					? parseFloat(data.default_discount_pct)
					: undefined,
				track_stock: data.track_stock,
				primary_unit: data.primary_unit || 'Box',
				secondary_unit_name: data.use_secondary_unit
					? data.secondary_unit_name || undefined
					: undefined,
				secondary_unit_conversion: data.use_secondary_unit
					? data.secondary_unit_conversion
						? parseFloat(data.secondary_unit_conversion)
						: undefined
					: undefined,
			};

			if (isEditing && id) {
				await updateItem(id, payload);
				Alert.alert(t('common.successTitle'), t('inventory.updateSuccess'));
				router.back();
			} else {
				await createItem(payload);
				Alert.alert(t('common.successTitle'), t('inventory.addSuccess'));
				router.back();
			}
		} catch (err: unknown) {
			Alert.alert(
				t('common.errorTitle'),
				err instanceof Error ? err.message : t('inventory.saveError'),
				[{ text: t('common.ok') }],
			);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
				<ScreenHeader
					title={isEditing ? t('inventory.editItem') : t('inventory.addItem')}
				/>
				<View style={{ padding: s.lg, gap: s.md }}>
					<SkeletonBlock height={52} borderRadius={r.md} />
					<View style={{ flexDirection: 'row', gap: s.md }}>
						<SkeletonBlock height={52} borderRadius={r.md} style={{ flex: 1 }} />
						<SkeletonBlock height={52} borderRadius={r.md} style={{ flex: 1 }} />
					</View>
					<SkeletonBlock height={52} borderRadius={r.md} />
					<SkeletonBlock height={52} borderRadius={r.md} />
					<SkeletonBlock height={52} borderRadius={r.md} />
				</View>
			</AtomicScreen>
		);
	}

	return (
		<AtomicScreen withKeyboard safeAreaEdges={['bottom']}>
			<ScreenHeader title={isEditing ? t('inventory.editItem') : t('inventory.addItem')} />

			<ScrollView
				keyboardDismissMode="on-drag"
				contentContainerStyle={{ padding: s.lg, paddingBottom: 40 }}
				keyboardShouldPersistTaps="handled"
			>
				{/* ── Section 1: Basic Info ────────────────────────────── */}
				<SectionHeader label="Basic Info" />

				<Controller
					control={control}
					name="design_name"
					render={({ field: { onChange, onBlur, value } }) => (
						<FormField
							label={t('inventory.designName')}
							required
							placeholder="जैसे: सफेद ग्लॉसी टाइल 60×60"
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							error={errors.design_name?.message}
						/>
					)}
				/>

				{/* Item Code with Auto-generate */}
				<ThemedText variant="label" color={c.onSurfaceVariant} style={{ marginBottom: 4 }}>
					Item Code / SKU
				</ThemedText>
				<View style={[layout.row, { gap: s.sm, marginBottom: s.md }]}>
					<View style={{ flex: 1 }}>
						<Controller
							control={control}
							name="item_code"
							render={({ field: { onChange, onBlur, value } }) => (
								<TextInput
									placeholder="e.g. WGT-6060"
									placeholderTextColor={c.onSurfaceVariant}
									autoCapitalize="characters"
									onBlur={onBlur}
									onChangeText={(v) => onChange(v.toUpperCase())}
									value={value}
									style={[
										styles.codeInput,
										{
											borderColor: c.border,
											backgroundColor: c.surface,
											color: c.onSurface,
											borderRadius: r.md,
											paddingHorizontal: s.md,
											paddingVertical: s.sm,
										},
									]}
								/>
							)}
						/>
					</View>
					<TouchableOpacity
						onPress={handleAutoGenerateCode}
						style={[
							styles.autoGenBtn,
							{
								borderColor: c.primary,
								borderRadius: r.md,
								paddingHorizontal: s.sm,
							},
						]}
					>
						<RefreshCw size={14} color={c.primary} />
						<ThemedText variant="caption" color={c.primary} style={{ marginLeft: 4 }}>
							Auto
						</ThemedText>
					</TouchableOpacity>
				</View>

				{/* Category chips */}
				<ThemedText variant="label" color={c.onSurfaceVariant} style={{ marginBottom: 6 }}>
					{t('inventory.category')} *
				</ThemedText>
				<Controller
					control={control}
					name="category"
					render={({ field: { onChange, value } }) => (
						<ChipGroup options={CATEGORIES} value={value} onChange={onChange} />
					)}
				/>

				<Controller
					control={control}
					name="item_description"
					render={({ field: { onChange, onBlur, value } }) => (
						<FormField
							label="Description"
							placeholder="Optional product description (max 500 chars)"
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							multiline
							numberOfLines={3}
							maxLength={500}
						/>
					)}
				/>

				{/* ── Section 2: Pricing ──────────────────────────────── */}
				<SectionHeader label="Pricing" />

				<View style={[layout.row, { gap: s.md }]}>
					<View style={{ flex: 1 }}>
						<Controller
							control={control}
							name="selling_price"
							render={({ field: { onChange, onBlur, value } }) => (
								<FormField
									label="Sale Price (₹)"
									required
									placeholder="0.00"
									keyboardType="numeric"
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
									error={errors.selling_price?.message}
								/>
							)}
						/>
					</View>
					<View style={{ flex: 1 }}>
						<Controller
							control={control}
							name="cost_price"
							render={({ field: { onChange, onBlur, value } }) => (
								<FormField
									label="Cost Price (₹)"
									placeholder="0.00"
									keyboardType="numeric"
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
								/>
							)}
						/>
					</View>
				</View>

				{/* Live margin */}
				<MarginBanner sellingPrice={watchedSelling ?? ''} costPrice={watchedCost ?? ''} />

				<View style={[layout.row, { gap: s.md }]}>
					<View style={{ flex: 1 }}>
						<Controller
							control={control}
							name="mrp"
							render={({ field: { onChange, onBlur, value } }) => (
								<FormField
									label="MRP (₹)"
									placeholder="0.00"
									keyboardType="numeric"
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
								/>
							)}
						/>
					</View>
					<View style={{ flex: 1 }}>
						<Controller
							control={control}
							name="default_discount_pct"
							render={({ field: { onChange, onBlur, value } }) => (
								<FormField
									label="Default Discount %"
									placeholder="0–100"
									keyboardType="numeric"
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
								/>
							)}
						/>
					</View>
				</View>

				{/* ── Section 3: Tax ──────────────────────────────────── */}
				<SectionHeader label="Tax" />

				<ThemedText variant="label" color={c.onSurfaceVariant} style={{ marginBottom: 6 }}>
					GST Rate *
				</ThemedText>
				<Controller
					control={control}
					name="gst_rate"
					render={({ field: { onChange, value } }) => (
						<ChipGroup
							options={GST_RATES as (typeof GST_RATES)[number][]}
							value={value as (typeof GST_RATES)[number]}
							onChange={onChange}
							labelMap={{
								'0': '0%',
								'5': '5%',
								'12': '12%',
								'18': '18%',
								'28': '28%',
							}}
						/>
					)}
				/>

				{/* GST Preview */}
				<GSTPreviewBanner
					sellingPrice={watchedSelling ?? '1000'}
					gstRate={watchedGst ?? '18'}
				/>

				<Controller
					control={control}
					name="hsn_code"
					render={({ field: { onChange, onBlur, value } }) => (
						<FormField
							label={t('inventory.hsnCode')}
							placeholder="e.g. 6908"
							keyboardType="numeric"
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
						/>
					)}
				/>

				{/* ── Section 4: Stock & Units ─────────────────────────── */}
				<SectionHeader label="Stock & Units" />

				{/* Track Stock toggle */}
				<View
					style={[
						styles.toggleRow,
						{ borderColor: c.border, borderRadius: r.md, marginBottom: s.md },
					]}
				>
					<View style={{ flex: 1 }}>
						<ThemedText variant="body" weight="medium">
							Track Stock
						</ThemedText>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							Monitor quantity and get low-stock alerts
						</ThemedText>
					</View>
					<Controller
						control={control}
						name="track_stock"
						render={({ field: { onChange, value } }) => (
							<Switch
								value={value}
								onValueChange={onChange}
								trackColor={{ false: c.surfaceVariant, true: c.primary }}
							/>
						)}
					/>
				</View>

				{watchedTrackStock && (
					<>
						{/* Primary Unit chips */}
						<ThemedText
							variant="label"
							color={c.onSurfaceVariant}
							style={{ marginBottom: 6 }}
						>
							Primary Unit
						</ThemedText>
						<Controller
							control={control}
							name="primary_unit"
							render={({ field: { onChange, value } }) => (
								<ChipGroup
									options={PRIMARY_UNITS as (typeof PRIMARY_UNITS)[number][]}
									value={(value ?? 'Box') as (typeof PRIMARY_UNITS)[number]}
									onChange={onChange}
								/>
							)}
						/>

						<View style={[layout.row, { gap: s.md }]}>
							<View style={{ flex: 1 }}>
								<Controller
									control={control}
									name="box_count"
									render={({ field: { onChange, onBlur, value } }) => (
										<FormField
											label={
												isEditing
													? t('inventory.currentStock')
													: `Opening Stock (${watchedPrimaryUnit ?? 'Box'})`
											}
											placeholder="0"
											keyboardType="numeric"
											onBlur={onBlur}
											onChangeText={onChange}
											value={value}
											editable={!isEditing}
											helperText={
												isEditing
													? t('inventory.emptyFilterHint')
													: undefined
											}
										/>
									)}
								/>
							</View>
							<View style={{ flex: 1 }}>
								<Controller
									control={control}
									name="low_stock_threshold"
									render={({ field: { onChange, onBlur, value } }) => (
										<FormField
											label="Low Stock Alert"
											placeholder="5"
											keyboardType="numeric"
											onBlur={onBlur}
											onChangeText={onChange}
											value={value}
										/>
									)}
								/>
							</View>
						</View>

						{/* Secondary Unit toggle */}
						<View
							style={[
								styles.toggleRow,
								{ borderColor: c.border, borderRadius: r.md, marginBottom: s.md },
							]}
						>
							<View style={{ flex: 1 }}>
								<ThemedText variant="body" weight="medium">
									Secondary Unit
								</ThemedText>
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									e.g. sell in Pcs but stock in Box
								</ThemedText>
							</View>
							<Controller
								control={control}
								name="use_secondary_unit"
								render={({ field: { onChange, value } }) => (
									<Switch
										value={value}
										onValueChange={onChange}
										trackColor={{ false: c.surfaceVariant, true: c.primary }}
									/>
								)}
							/>
						</View>

						{watchedSecondaryUnit && (
							<View style={[layout.row, { gap: s.md }]}>
								<View style={{ flex: 1 }}>
									<Controller
										control={control}
										name="secondary_unit_name"
										render={({ field: { onChange, onBlur, value } }) => (
											<FormField
												label="Secondary Unit Name"
												placeholder="e.g. Pcs"
												onBlur={onBlur}
												onChangeText={onChange}
												value={value}
											/>
										)}
									/>
								</View>
								<View style={{ flex: 1 }}>
									<Controller
										control={control}
										name="secondary_unit_conversion"
										render={({ field: { onChange, onBlur, value } }) => (
											<FormField
												label={`1 ${watchedPrimaryUnit ?? 'Box'} = ___ ${
													watchedSecondaryUnitName || 'Pcs'
												}`}
												placeholder="e.g. 6"
												keyboardType="numeric"
												onBlur={onBlur}
												onChangeText={onChange}
												value={value}
											/>
										)}
									/>
								</View>
							</View>
						)}
					</>
				)}

				{/* ── Section 5: Tile-specific ─────────────────────────── */}
				<SectionHeader label={t('inventory.tileSet')} />

				<View style={[layout.row, { gap: s.md }]}>
					<View style={{ flex: 1 }}>
						<Controller
							control={control}
							name="size_name"
							render={({ field: { onChange, onBlur, value } }) => (
								<FormField
									label={t('inventory.size')}
									placeholder={t('inventory.placeholders.size')}
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
								/>
							)}
						/>
					</View>
					<View style={{ flex: 1 }}>
						<Controller
							control={control}
							name="brand_name"
							render={({ field: { onChange, onBlur, value } }) => (
								<FormField
									label={t('inventory.brandName')}
									placeholder={t('inventory.placeholders.brand')}
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
								/>
							)}
						/>
					</View>
				</View>

				<View style={[layout.row, { gap: s.md }]}>
					<View style={{ flex: 1 }}>
						<Controller
							control={control}
							name="pcs_per_box"
							render={({ field: { onChange, value } }) => (
								<FormField
									label={t('inventory.pcsPerBox')}
									keyboardType="numeric"
									onChangeText={onChange}
									value={value}
								/>
							)}
						/>
					</View>
					<View style={{ flex: 1 }}>
						<Controller
							control={control}
							name="sqft_per_box"
							render={({ field: { onChange, value } }) => (
								<FormField
									label={t('inventory.sqftPerBox')}
									keyboardType="numeric"
									onChangeText={onChange}
									value={value}
								/>
							)}
						/>
					</View>
				</View>

				<View style={{ height: 40 }} />
			</ScrollView>

			<View
				style={[
					styles.footer,
					{
						backgroundColor: c.surface,
						borderTopColor: c.border,
						padding: s.md,
						paddingBottom: 32,
					},
				]}
			>
				<Button
					title={isEditing ? t('inventory.editItem') : t('inventory.saveItem')}
					onPress={handleSubmit(onSubmit)}
					loading={submitting}
					leftIcon={!submitting && <Save size={20} color="white" />}
				/>
			</View>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	footer: { borderTopWidth: 1 },
	toggleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		paddingHorizontal: 12,
		paddingVertical: 10,
		gap: 12,
	},
	codeInput: {
		height: 44,
		borderWidth: 1,
		fontSize: 14,
	},
	autoGenBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		paddingVertical: 8,
		paddingHorizontal: 10,
		height: 44,
	},
	center: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 20,
		textAlign: 'center',
	} as any,
});
