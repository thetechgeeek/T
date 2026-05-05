import React, { useState } from 'react';
import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenHeader } from '@easydesign/ui-shell';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supplierService } from '@/src/services/supplierService';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { Button } from '@easydesign/design-system';
import { Card } from '@easydesign/design-system';
import { Screen as AtomicScreen } from '@easydesign/design-system';
import { FormField } from '@easydesign/design-system';
import { FormSection } from '@easydesign/design-system';
import { ThemedText } from '@easydesign/design-system';
import { layout } from '@easydesign/design-system/foundation';
import { useLocale } from '@/src/hooks/useLocale';
import logger from '@/src/utils/logger';
import { SPACING_PX } from '@easydesign/design-system/foundation';

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

const getSupplierSchema = (t: (key: string) => string) =>
	z.object({
		name: z.string().min(2, t('supplier.nameRequired')),
		contact_person: z.string().optional(),
		phone: z.string().optional(),
		email: z.string().email(t('supplier.invalidEmail')).optional().or(z.literal('')),
		gstin: z.string().length(15, t('supplier.gstinLength')).optional().or(z.literal('')),
		address: z.string().optional(),
		city: z.string().optional(),
		state: z.string().optional(),
		payment_terms: z.string().optional(),
		notes: z.string().optional(),
		gst_type: z.enum(['regular', 'composition', 'unregistered']),
	});

const GST_TYPE_OPTIONS: { labelKey: string; value: GstType }[] = [
	{ labelKey: 'supplier.gstTypes.regular', value: 'regular' },
	{ labelKey: 'supplier.gstTypes.composition', value: 'composition' },
	{ labelKey: 'supplier.gstTypes.unregistered', value: 'unregistered' },
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
		resolver: zodResolver(getSupplierSchema(t)) as Resolver<SupplierFormData>,
		defaultValues: {
			gst_type: 'regular',
		},
	});

	const gstType = watch('gst_type');

	const onSubmit = async (data: SupplierFormData) => {
		setSubmitting(true);
		try {
			const { gst_type: _gstType, ...rest } = data;
			await supplierService.createSupplier(rest);
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
			header={<ScreenHeader title={t('supplier.add')} />}
			scrollViewProps={{ keyboardDismissMode: 'on-drag' }}
			contentContainerStyle={{ paddingTop: s.lg, paddingBottom: s.xl, gap: s.lg }}
		>
			<FormSection title={t('inventory.sections.basicInfo')}>
				<Card padding="md">
					<Controller
						control={control}
						name="name"
						render={({ field: { onChange, value } }) => (
							<FormField
								label={t('supplier.supplierName')}
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
								label={t('supplier.contactPerson')}
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
								label={t('supplier.phone')}
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
								label={t('supplier.email')}
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

			<FormSection title={t('supplier.gstDetails')}>
				<Card padding="md">
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={{ marginBottom: SPACING_PX.sm - SPACING_PX.xxs }}
					>
						{t('supplier.gstType')}
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
									{t(opt.labelKey)}
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

			<FormSection title={t('supplier.address')}>
				<Card padding="md">
					<View style={[layout.row, { gap: s.lg }]}>
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
								label={t('supplier.address')}
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

			<FormSection title={t('supplier.termsNotes')}>
				<Card padding="md">
					<Controller
						control={control}
						name="payment_terms"
						render={({ field: { onChange, value } }) => (
							<FormField
								label={t('supplier.paymentTerms')}
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
								label={t('supplier.notes')}
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
					title={submitting ? t('common.loading') : t('supplier.saveSupplier')}
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
		gap: SPACING_PX.sm,
		marginBottom: SPACING_PX.md,
	},
	gstToggleBtn: {
		flex: 1,
		paddingVertical: SPACING_PX.sm + SPACING_PX.xxs,
		paddingHorizontal: SPACING_PX.sm,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: SPACING_PX['2xl'] + SPACING_PX.sm,
	},
});
