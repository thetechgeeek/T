import React, { useState } from 'react';
import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supplierRepository } from '@/src/repositories/supplierRepository';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Button } from '@/src/components/atoms/Button';
import { Card } from '@/src/components/atoms/Card';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { FormField } from '@/src/components/molecules/FormField';
import { FormSection } from '@/src/components/molecules/FormSection';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { layout } from '@/src/theme/layout';
import { useLocale } from '@/src/hooks/useLocale';
import logger from '@/src/utils/logger';

type GstType = 'regular' | 'composition' | 'unregistered';

interface SupplierFormData {
	name: string;
	contact_person?: string;
	phone?: string;
	email?: string;
	gstin?: string;
	address?: string;
	city?: string;
	state?: string;
	payment_terms?: string;
	notes?: string;
	gst_type: GstType;
}

const getSupplierSchema = () =>
	z.object({
		name: z.string().min(2, 'Name is required'),
		contact_person: z.string().optional(),
		phone: z.string().optional(),
		email: z.string().email('Invalid email').optional().or(z.literal('')),
		gstin: z.string().length(15, 'GSTIN must be 15 characters').optional().or(z.literal('')),
		address: z.string().optional(),
		city: z.string().optional(),
		state: z.string().optional(),
		payment_terms: z.string().optional(),
		notes: z.string().optional(),
		gst_type: z.enum(['regular', 'composition', 'unregistered']),
	});

const GST_TYPE_OPTIONS: { label: string; value: GstType }[] = [
	{ label: 'Regular', value: 'regular' },
	{ label: 'Composition', value: 'composition' },
	{ label: 'Unregistered', value: 'unregistered' },
];

export default function AddSupplierScreen() {
	const { c, s, r } = useThemeTokens();
	const { t } = useLocale();
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<SupplierFormData>({
		resolver: zodResolver(getSupplierSchema()) as Resolver<SupplierFormData>,
		defaultValues: {
			gst_type: 'regular',
		},
	});

	const gstType = watch('gst_type');

	const onSubmit = async (data: SupplierFormData) => {
		setSubmitting(true);
		try {
			const { gst_type: _gstType, ...rest } = data;
			await supplierRepository.create(rest);
			router.back();
		} catch (e: unknown) {
			logger.error('Failed to save supplier', e instanceof Error ? e : new Error(String(e)));
			Alert.alert(
				t('common.errorTitle'),
				e instanceof Error ? e.message : t('common.unexpectedError'),
				[{ text: t('common.ok') }],
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<AtomicScreen
			safeAreaEdges={['bottom']}
			withKeyboard
			scrollable
			header={<ScreenHeader title="Add Supplier" />}
			scrollViewProps={{ keyboardDismissMode: 'on-drag' }}
			contentContainerStyle={{ paddingTop: s.lg, paddingBottom: s.xl, gap: s.lg }}
		>
			<FormSection title="Basic Info">
				<Card padding="md">
					<Controller
						control={control}
						name="name"
						render={({ field: { onChange, value } }) => (
							<FormField
								label="Supplier Name"
								accessibilityLabel="supplier-name-input"
								required
								placeholder="Enter supplier name"
								value={value}
								onChangeText={onChange}
								error={errors.name?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="contact_person"
						render={({ field: { onChange, value } }) => (
							<FormField
								label="Contact Person"
								accessibilityLabel="supplier-contact-person-input"
								placeholder="Primary contact name"
								value={value}
								onChangeText={onChange}
							/>
						)}
					/>

					<Controller
						control={control}
						name="phone"
						render={({ field: { onChange, value } }) => (
							<FormField
								label="Phone"
								accessibilityLabel="supplier-phone-input"
								placeholder="+91 XXXXX XXXXX"
								keyboardType="phone-pad"
								value={value}
								onChangeText={onChange}
								error={errors.phone?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="email"
						render={({ field: { onChange, value } }) => (
							<FormField
								label="Email"
								accessibilityLabel="supplier-email-input"
								placeholder="supplier@example.com"
								keyboardType="email-address"
								autoCapitalize="none"
								value={value}
								onChangeText={onChange}
								error={errors.email?.message}
							/>
						)}
					/>
				</Card>
			</FormSection>

			<FormSection title="GST Details">
				<Card padding="md">
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={{ marginBottom: 6 }}
					>
						GST Type
					</ThemedText>
					<View style={[layout.row, styles.gstToggleRow]}>
						{GST_TYPE_OPTIONS.map((opt) => (
							<Pressable
								key={opt.value}
								style={[
									styles.gstToggleBtn,
									{
										borderRadius: r.md,
										borderColor: c.primary,
										backgroundColor:
											gstType === opt.value ? c.primary : c.surface,
									},
								]}
								onPress={() => setValue('gst_type', opt.value)}
								accessibilityRole="button"
								accessibilityState={{ selected: gstType === opt.value }}
							>
								<ThemedText
									variant="caption"
									color={gstType === opt.value ? c.onPrimary : c.primary}
								>
									{opt.label}
								</ThemedText>
							</Pressable>
						))}
					</View>

					{gstType !== 'unregistered' && (
						<Controller
							control={control}
							name="gstin"
							render={({ field: { onChange, value } }) => (
								<FormField
									label="GSTIN"
									accessibilityLabel="supplier-gstin-input"
									placeholder="15-character GSTIN"
									autoCapitalize="characters"
									value={value}
									onChangeText={onChange}
									error={errors.gstin?.message}
								/>
							)}
						/>
					)}
				</Card>
			</FormSection>

			<FormSection title="Address">
				<Card padding="md">
					<View style={[layout.row, { gap: 16 }]}>
						<View style={{ flex: 1 }}>
							<Controller
								control={control}
								name="city"
								render={({ field: { onChange, value } }) => (
									<FormField
										label="City"
										accessibilityLabel="supplier-city-input"
										placeholder="City"
										value={value}
										onChangeText={onChange}
									/>
								)}
							/>
						</View>
						<View style={{ flex: 1 }}>
							<Controller
								control={control}
								name="state"
								render={({ field: { onChange, value } }) => (
									<FormField
										label="State"
										accessibilityLabel="supplier-state-input"
										placeholder="State"
										value={value}
										onChangeText={onChange}
									/>
								)}
							/>
						</View>
					</View>

					<Controller
						control={control}
						name="address"
						render={({ field: { onChange, value } }) => (
							<FormField
								label="Address"
								accessibilityLabel="supplier-address-input"
								placeholder="Full address"
								multiline
								numberOfLines={2}
								value={value}
								onChangeText={onChange}
							/>
						)}
					/>
				</Card>
			</FormSection>

			<FormSection title="Terms & Notes">
				<Card padding="md">
					<Controller
						control={control}
						name="payment_terms"
						render={({ field: { onChange, value } }) => (
							<FormField
								label="Payment Terms"
								accessibilityLabel="supplier-payment-terms-input"
								placeholder="e.g. Net 30, COD"
								value={value}
								onChangeText={onChange}
							/>
						)}
					/>

					<Controller
						control={control}
						name="notes"
						render={({ field: { onChange, value } }) => (
							<FormField
								label="Notes"
								accessibilityLabel="supplier-notes-input"
								placeholder="Internal notes about this supplier"
								multiline
								numberOfLines={3}
								value={value}
								onChangeText={onChange}
							/>
						)}
					/>
				</Card>
			</FormSection>

			<View style={{ paddingHorizontal: s.lg }}>
				<Button
					title={submitting ? t('common.loading') : 'Save Supplier'}
					accessibilityLabel="save-supplier-button"
					accessibilityState={{ busy: submitting }}
					onPress={handleSubmit(onSubmit)}
					loading={submitting}
				/>
			</View>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	gstToggleRow: {
		gap: 8,
		marginBottom: 12,
	},
	gstToggleBtn: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 8,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 40,
	},
});
