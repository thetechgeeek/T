import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Save } from 'lucide-react-native';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SkeletonBlock } from '@/src/components/molecules/SkeletonBlock';
import { useForm, Controller } from 'react-hook-form';
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

const getSchema = (t: (key: string) => string) =>
	z.object({
		design_name: z.string().min(1, t('common.required')),
		category: z.enum(['GLOSSY', 'FLOOR', 'MATT', 'SATIN', 'WOODEN', 'ELEVATION', 'OTHER']),
		size_name: z.string().optional(),
		brand_name: z.string().optional(),
		pcs_per_box: z.string().optional(),
		sqft_per_box: z.string().optional(),
		box_count: z.string().min(1, t('common.required')),
		selling_price: z.string().min(1, t('common.required')),
		cost_price: z.string().optional(),
		low_stock_threshold: z.string().min(1, t('common.required')),
		gst_rate: z.string().min(1, t('common.required')),
		hsn_code: z.string().optional(),
	});

type FormData = z.infer<ReturnType<typeof getSchema>>;

const CATEGORIES: TileCategory[] = [
	'GLOSSY',
	'FLOOR',
	'MATT',
	'SATIN',
	'WOODEN',
	'ELEVATION',
	'OTHER',
];

export default function AddItemScreen() {
	const { c, s, r } = useThemeTokens();
	const { t } = useLocale();
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id?: UUID }>();
	const isEditing = !!id;

	const { createItem, updateItem } = useInventoryStore(
		useShallow((s) => ({ createItem: s.createItem, updateItem: s.updateItem })),
	);
	const [loading, setLoading] = useState(isEditing);
	const [submitting, setSubmitting] = useState(false);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(getSchema(t)),
		defaultValues: {
			category: 'GLOSSY',
			box_count: '0',
			selling_price: '0',
			cost_price: '0',
			low_stock_threshold: '10',
			gst_rate: '18',
			hsn_code: '6908',
		},
	});

	useEffect(() => {
		if (isEditing && id) {
			inventoryService
				.fetchItemById(id)
				.then((data) => {
					reset({
						design_name: data.design_name,
						category: data.category,
						size_name: data.size_name || '',
						brand_name: data.brand_name || '',
						pcs_per_box: data.pcs_per_box?.toString() || '',
						sqft_per_box: data.sqft_per_box?.toString() || '',
						box_count: data.box_count.toString(),
						selling_price: data.selling_price.toString(),
						cost_price: data.cost_price.toString(),
						low_stock_threshold: data.low_stock_threshold.toString(),
						gst_rate: data.gst_rate.toString(),
						hsn_code: data.hsn_code,
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
				design_name: data.design_name,
				category: data.category,
				size_name: data.size_name || undefined,
				brand_name: data.brand_name || undefined,
				pcs_per_box: data.pcs_per_box ? parseInt(data.pcs_per_box) : undefined,
				sqft_per_box: data.sqft_per_box ? parseFloat(data.sqft_per_box) : undefined,
				box_count: parseInt(data.box_count) || 0,
				selling_price: parseFloat(data.selling_price) || 0,
				cost_price: parseFloat(data.cost_price || '0') || 0,
				low_stock_threshold: parseInt(data.low_stock_threshold) || 10,
				gst_rate: parseInt(data.gst_rate) || 18,
				hsn_code: data.hsn_code || '6908',
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
				</View>
			</AtomicScreen>
		);
	}

	return (
		<AtomicScreen withKeyboard safeAreaEdges={['bottom']}>
			<ScreenHeader title={isEditing ? t('inventory.editItem') : t('inventory.addItem')} />

			<ScrollView
				keyboardDismissMode="on-drag"
				contentContainerStyle={{ padding: s.lg }}
				keyboardShouldPersistTaps="handled"
			>
				<ThemedText variant="h3" style={{ marginBottom: s.md }}>
					{t('auth.setupBusiness')}
				</ThemedText>

				<Controller
					control={control}
					name="design_name"
					render={({ field: { onChange, onBlur, value } }) => (
						<FormField
							label={t('inventory.designName')}
							required
							placeholder={t('inventory.placeholders.designName')}
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							error={errors.design_name?.message}
						/>
					)}
				/>

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

				<ThemedText variant="label" color={c.onSurfaceVariant} style={{ marginBottom: 6 }}>
					{t('inventory.category')} *
				</ThemedText>
				<View style={[layout.row, { flexWrap: 'wrap', gap: 8, marginBottom: 16 }]}>
					<Controller
						control={control}
						name="category"
						render={({ field: { onChange, value } }) => (
							<>
								{CATEGORIES.map((cat) => (
									<TouchableOpacity
										key={cat}
										onPress={() => onChange(cat)}
										style={{
											paddingVertical: 8,
											paddingHorizontal: 12,
											backgroundColor:
												value === cat ? c.primary : c.surfaceVariant,
											borderRadius: r.md,
										}}
									>
										<ThemedText
											variant="caption"
											weight="semibold"
											color={value === cat ? c.onPrimary : c.onSurfaceVariant}
										>
											{cat}
										</ThemedText>
									</TouchableOpacity>
								))}
							</>
						)}
					/>
				</View>

				<ThemedText variant="h3" style={{ marginTop: s.md, marginBottom: s.md }}>
					{t('finance.title')} & {t('inventory.currentStock')}
				</ThemedText>

				<View style={{ flexDirection: 'row', gap: s.md }}>
					<View style={{ flex: 1 }}>
						<Controller
							control={control}
							name="selling_price"
							render={({ field: { onChange, onBlur, value } }) => (
								<FormField
									label={t('inventory.sellingPrice')}
									required
									placeholder={t('inventory.placeholders.price')}
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
									label={t('inventory.costPrice')}
									placeholder={t('inventory.placeholders.price')}
									keyboardType="numeric"
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
									error={errors.cost_price?.message}
								/>
							)}
						/>
					</View>
				</View>

				<View style={{ flexDirection: 'row', gap: s.md }}>
					<View style={{ flex: 1 }}>
						<Controller
							control={control}
							name="box_count"
							render={({ field: { onChange, onBlur, value } }) => (
								<FormField
									label={
										isEditing
											? t('inventory.currentStock')
											: t('dashboard.addStock')
									}
									required
									placeholder={t('inventory.placeholders.stock')}
									keyboardType="numeric"
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
									error={errors.box_count?.message}
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
									label={t('inventory.lowStockThreshold')}
									required
									placeholder={t('inventory.placeholders.lowStock')}
									keyboardType="numeric"
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
									error={errors.low_stock_threshold?.message}
								/>
							)}
						/>
					</View>
				</View>

				<View style={{ flexDirection: 'row', gap: s.md }}>
					<View style={{ flex: 1 }}>
						<Controller
							control={control}
							name="gst_rate"
							render={({ field: { onChange, onBlur, value } }) => (
								<FormField
									label={t('inventory.gstRate')}
									required
									placeholder={t('inventory.placeholders.gst')}
									keyboardType="numeric"
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
									error={errors.gst_rate?.message}
								/>
							)}
						/>
					</View>
					<View style={{ flex: 1 }}>
						<Controller
							control={control}
							name="hsn_code"
							render={({ field: { onChange, onBlur, value } }) => (
								<FormField
									label={t('inventory.hsnCode')}
									placeholder={t('inventory.placeholders.hsn')}
									keyboardType="numeric"
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
									error={errors.hsn_code?.message}
								/>
							)}
						/>
					</View>
				</View>

				<ThemedText variant="h3" style={{ marginTop: s.sm, marginBottom: s.md }}>
					{t('inventory.tileSet')}
				</ThemedText>

				<View style={{ flexDirection: 'row', gap: s.md }}>
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
					title={t('common.save')}
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
});
