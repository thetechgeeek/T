import React from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, TextInput } from 'react-native';
import { Save, RefreshCw } from 'lucide-react-native';
import { ScreenHeader } from '@easydesign/ui-shell';
import { SkeletonBlock } from '@easydesign/design-system';
import { Controller } from 'react-hook-form';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { useLocale } from '@/src/hooks/useLocale';
import { ThemedText } from '@easydesign/design-system';
import { Button } from '@easydesign/design-system';
import { Screen as AtomicScreen } from '@easydesign/design-system';
import { FormField } from '@easydesign/design-system';
import { layout } from '@easydesign/design-system/foundation';
import {
	INVENTORY_ADD_CATEGORIES,
	INVENTORY_ADD_GST_RATES,
	INVENTORY_PRIMARY_UNITS,
} from './inventoryAddFormModel';
import { useInventoryAddFlow } from './useInventoryAddFlow';

// ─── Constants ───────────────────────────────────────────────────────────────

// ─── Helper sub-components ───────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
	const { c, s } = useThemeTokens();
	return (
		<ThemedText
			variant="h3"
			style={[{ marginTop: s.lg, marginBottom: s.sm, color: c.onSurface }]}
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
	groupLabel,
}: {
	options: readonly T[];
	value: T;
	onChange: (v: T) => void;
	labelMap?: Record<string, string>;
	groupLabel: string;
}) {
	const { c, s, r } = useThemeTokens();
	return (
		<View
			style={[layout.row, { flexWrap: 'wrap', gap: s.sm, marginBottom: s.md }]}
			accessibilityLabel={groupLabel}
		>
			{options.map((opt) => {
				const displayLabel = labelMap ? (labelMap[opt] ?? opt) : opt;
				const selected = value === opt;
				return (
					<TouchableOpacity
						key={opt}
						onPress={() => onChange(opt)}
						accessibilityRole="button"
						accessibilityLabel={`${groupLabel}: ${displayLabel}`}
						accessibilityState={{ selected }}
						style={{
							paddingVertical: s.sm,
							paddingHorizontal: s.md,
							backgroundColor: selected ? c.primary : c.surfaceVariant,
							borderRadius: r.md,
						}}
					>
						<ThemedText
							variant="caption"
							weight="semibold"
							color={selected ? c.onPrimary : c.onSurfaceVariant}
						>
							{displayLabel}
						</ThemedText>
					</TouchableOpacity>
				);
			})}
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
				backgroundColor: isPositive ? c.successLight : c.errorLight,
				borderRadius: r.sm,
				padding: s.sm,
				marginBottom: s.md,
			}}
		>
			<ThemedText variant="caption" color={isPositive ? c.success : c.error}>
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
	const { c, s, r, typo } = useThemeTokens();
	const { t } = useLocale();
	const fieldLabelSpacing = s.xs + s.xxs;
	const footerPaddingBottom = s['2xl'];
	const formPaddingBottom = footerPaddingBottom + s.sm;
	const compactControlPadding = s.sm + s.xxs;
	const { form, watched, isEditing, loading, submitting, handleAutoGenerateCode, submitForm } =
		useInventoryAddFlow(t);
	const primaryUnitLabels = React.useMemo(
		() => ({
			Pcs: t('inventory.units.pcs'),
			Box: t('inventory.units.box'),
			Kg: t('inventory.units.kg'),
			Meter: t('inventory.units.meter'),
			'Sq.ft': t('inventory.units.sqft'),
			'Sq.meter': t('inventory.units.sqmeter'),
			Set: t('inventory.units.set'),
		}),
		[t],
	);
	const {
		control,
		formState: { errors },
	} = form;

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
		<AtomicScreen
			withKeyboard
			safeAreaEdges={['bottom']}
			scrollable
			header={
				<ScreenHeader
					title={isEditing ? t('inventory.editItem') : t('inventory.addItem')}
				/>
			}
			contentContainerStyle={{ padding: s.lg, paddingBottom: formPaddingBottom }}
			scrollViewProps={{
				keyboardDismissMode: 'on-drag',
				keyboardShouldPersistTaps: 'handled',
			}}
			footer={
				<View
					style={[
						styles.footer,
						{
							backgroundColor: c.surface,
							borderTopColor: c.border,
							padding: s.md,
							paddingBottom: footerPaddingBottom,
						},
					]}
				>
					<Button
						title={isEditing ? t('inventory.editItem') : t('inventory.saveItem')}
						onPress={submitForm}
						loading={submitting}
						leftIcon={!submitting && <Save size={20} color="white" />}
					/>
				</View>
			}
		>
			{/* ── Section 1: Basic Info ────────────────────────────── */}
			<SectionHeader label={t('inventory.sections.basicInfo')} />

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
			<ThemedText variant="label" color={c.onSurfaceVariant} style={{ marginBottom: s.xs }}>
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
										fontSize: typo.sizes.md,
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
							paddingVertical: s.sm,
						},
					]}
				>
					<RefreshCw size={14} color={c.primary} />
					<ThemedText variant="caption" color={c.primary} style={{ marginLeft: s.xs }}>
						Auto
					</ThemedText>
				</TouchableOpacity>
			</View>

			{/* Category chips */}
			<ThemedText
				variant="label"
				color={c.onSurfaceVariant}
				style={{ marginBottom: fieldLabelSpacing }}
			>
				{t('inventory.category')} *
			</ThemedText>
			<Controller
				control={control}
				name="category"
				render={({ field: { onChange, value } }) => (
					<ChipGroup
						options={INVENTORY_ADD_CATEGORIES}
						value={value}
						onChange={onChange}
						groupLabel={t('inventory.category')}
					/>
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
			<SectionHeader label={t('inventory.sections.pricing')} />

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
			<MarginBanner sellingPrice={watched.selling ?? ''} costPrice={watched.cost ?? ''} />

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

			<ThemedText
				variant="label"
				color={c.onSurfaceVariant}
				style={{ marginBottom: fieldLabelSpacing }}
			>
				{t('inventory.gstRate')} *
			</ThemedText>
			<Controller
				control={control}
				name="gst_rate"
				render={({ field: { onChange, value } }) => (
					<ChipGroup
						options={INVENTORY_ADD_GST_RATES}
						value={value as (typeof INVENTORY_ADD_GST_RATES)[number]}
						onChange={onChange}
						groupLabel={t('inventory.gstRate')}
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
				sellingPrice={watched.selling ?? '1000'}
				gstRate={watched.gst ?? '18'}
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
			<SectionHeader label={t('inventory.sections.stockUnits')} />

			{/* Track Stock toggle */}
			<View
				style={[
					styles.toggleRow,
					{
						borderColor: c.border,
						borderRadius: r.md,
						paddingHorizontal: s.md,
						paddingVertical: compactControlPadding,
						gap: s.md,
						marginBottom: s.md,
					},
				]}
			>
				<View style={{ flex: 1 }}>
					<ThemedText variant="body" weight="medium">
						{t('inventory.sections.trackStock')}
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

			{watched.trackStock && (
				<>
					{/* Primary Unit chips */}
					<ThemedText
						variant="label"
						color={c.onSurfaceVariant}
						style={{ marginBottom: fieldLabelSpacing }}
					>
						{t('inventory.primaryUnit')}
					</ThemedText>
					<Controller
						control={control}
						name="primary_unit"
						render={({ field: { onChange, value } }) => (
							<ChipGroup
								options={INVENTORY_PRIMARY_UNITS}
								value={(value ?? 'Box') as (typeof INVENTORY_PRIMARY_UNITS)[number]}
								onChange={onChange}
								groupLabel={t('inventory.primaryUnit')}
								labelMap={primaryUnitLabels}
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
												: `Opening Stock (${watched.primaryUnit ?? 'Box'})`
										}
										placeholder="0"
										keyboardType="numeric"
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										editable={!isEditing}
										helperText={
											isEditing ? t('inventory.emptyFilterHint') : undefined
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
							{
								borderColor: c.border,
								borderRadius: r.md,
								paddingHorizontal: s.md,
								paddingVertical: compactControlPadding,
								gap: s.md,
								marginBottom: s.md,
							},
						]}
					>
						<View style={{ flex: 1 }}>
							<ThemedText variant="body" weight="medium">
								{t('inventory.secondaryUnit')}
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

					{watched.secondaryUnit && (
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
											label={`1 ${watched.primaryUnit ?? 'Box'} = ___ ${
												watched.secondaryUnitName || 'Pcs'
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
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	footer: { borderTopWidth: 1 },
	toggleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
	},
	codeInput: {
		height: 44,
		borderWidth: 1,
	},
	autoGenBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		height: 44,
	},
});
