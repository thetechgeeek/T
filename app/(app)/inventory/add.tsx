import React, { useEffect, useState } from 'react';
import {
	View,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Alert,
	ActivityIndicator,
	Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { Screen } from '@/src/components/atoms/Screen';
import { FormField } from '@/src/components/molecules/FormField';
import type { TileCategory } from '@/src/types/inventory';
import type { UUID } from '@/src/types/common';
import { inventoryService } from '@/src/services/inventoryService';
import { layout } from '@/src/theme/layout';

const schema = z.object({
	design_name: z.string().min(1, 'Design Name is required'),
	category: z.enum(['GLOSSY', 'FLOOR', 'MATT', 'SATIN', 'WOODEN', 'ELEVATION', 'OTHER']),
	size_name: z.string().optional(),
	brand_name: z.string().optional(),
	pcs_per_box: z.string().optional(),
	sqft_per_box: z.string().optional(),
	box_count: z.string().min(1, 'Required'),
	selling_price: z.string().min(1, 'Required'),
	cost_price: z.string().optional(),
	low_stock_threshold: z.string().min(1, 'Required'),
	gst_rate: z.string().min(1, 'Required'),
	hsn_code: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

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
	const { theme } = useTheme();
	const { t } = useLocale();
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id?: UUID }>();
	const isEditing = !!id;

	const c = theme.colors;
	const s = theme.spacing;
	const r = theme.borderRadius;

	const { createItem, updateItem } = useInventoryStore();
	const [submitting, setSubmitting] = useState(false);
	const [loading, setLoading] = useState(isEditing);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
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
				.catch((err) => {
					Alert.alert('Error', 'Could not load item details.', [{ text: 'OK' }]);
					router.back();
				});
		}
	}, [id, isEditing]);

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
				Alert.alert('Success', 'Item updated successfully!');
				router.back();
			} else {
				await createItem(payload);
				Alert.alert('Success', 'Item added successfully!');
				router.back();
			}
		} catch (err: any) {
			Alert.alert('Error', err.message || 'Failed to save item', [{ text: 'OK' }]);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<View
				style={[
					styles.container,
					{ backgroundColor: c.background, justifyContent: 'center' },
				]}
			>
				<ActivityIndicator size="large" color={c.primary} />
			</View>
		);
	}

	return (
		<Screen withKeyboard safeAreaEdges={['top', 'bottom']}>
			<View
				style={[
					styles.header,
					layout.rowBetween,
					{ borderBottomColor: c.border, borderBottomWidth: 1, paddingHorizontal: s.lg },
				]}
			>
				<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
					<ArrowLeft size={24} color={c.onBackground} strokeWidth={2.5} />
				</TouchableOpacity>
				<ThemedText variant="h2">{isEditing ? 'Edit Item' : 'Add Item'}</ThemedText>
				<View style={{ width: 40 }} />
			</View>

			<ScrollView
				contentContainerStyle={{ padding: s.lg }}
				keyboardShouldPersistTaps="handled"
			>
				<ThemedText variant="h3" style={{ marginBottom: s.md }}>
					Basic Details
				</ThemedText>

				<Controller
					control={control}
					name="design_name"
					render={({ field: { onChange, onBlur, value } }) => (
						<FormField
							label="Design Name / Item Number"
							required
							placeholder="e.g. 10526-HL-1-A"
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
									label="Size"
									placeholder="e.g. 600x600"
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
									label="Brand"
									placeholder="e.g. Somany"
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
								/>
							)}
						/>
					</View>
				</View>

				<ThemedText variant="label" color={c.onSurfaceVariant} style={{ marginBottom: 6 }}>
					Category *
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
					Pricing & Stock
				</ThemedText>

				<View style={{ flexDirection: 'row', gap: s.md }}>
					<View style={{ flex: 1 }}>
						<Controller
							control={control}
							name="selling_price"
							render={({ field: { onChange, onBlur, value } }) => (
								<FormField
									label="Selling Price"
									required
									placeholder="Enter selling price"
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
									label="Cost Price"
									placeholder="Enter cost price"
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
									label={isEditing ? 'Stock (Boxes)' : 'Initial Stock'}
									required
									placeholder="Enter initial stock"
									keyboardType="numeric"
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
									error={errors.box_count?.message}
									editable={!isEditing}
									helperText={
										isEditing ? 'Use Stock In/Out to update' : undefined
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
									label="Low Alert At"
									required
									placeholder="Enter low stock alert"
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
									label="GST Rate"
									required
									placeholder="Enter GST rate"
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
									label="HSN Code"
									placeholder="Enter HSN code"
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
					Packaging Details
				</ThemedText>

				<View style={{ flexDirection: 'row', gap: s.md }}>
					<View style={{ flex: 1 }}>
						<Controller
							control={control}
							name="pcs_per_box"
							render={({ field: { onChange, value } }) => (
								<FormField
									label="Pieces/Box"
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
									label="SqFt/Box"
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
					title="Save Item"
					onPress={handleSubmit(onSubmit)}
					leftIcon={<Save size={20} color="white" />}
				/>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 16,
	},
	backBtn: { width: 40, alignItems: 'flex-start' },
	footer: { borderTopWidth: 1 },
});
