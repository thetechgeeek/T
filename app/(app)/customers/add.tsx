import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, StyleSheet, Alert, Pressable, TextInput as NativeTextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenHeader } from '@easydesign/ui-shell';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { Button } from '@easydesign/design-system';
import { Card } from '@easydesign/design-system';
import { Screen as AtomicScreen } from '@easydesign/design-system';
import { FormField } from '@easydesign/design-system';
import { FormSection } from '@easydesign/design-system';
import { AmountInput } from '@easydesign/design-system';
import { ThemedText } from '@easydesign/design-system';
import { layout } from '@easydesign/design-system/foundation';
import { useLocale } from '@/src/hooks/useLocale';
import logger from '@/src/utils/logger';
import { SPACING_PX } from '@easydesign/design-system/foundation';

interface CustomerFormData {
	name: string;
	phone: string;
	email?: string;
	gstin?: string;
	address?: string;
	city?: string;
	state?: string;
	type: 'retail' | 'contractor' | 'builder' | 'dealer';
	customer_type: 'individual' | 'business';
	company_name?: string;
	credit_limit: number;
	opening_balance: number;
	balance_type: 'dr' | 'cr';
	notes?: string;
}

const getCustomerSchema = (t: (key: string, options?: Record<string, unknown>) => string) =>
	z.object({
		name: z.string().min(2, t('common.required')),
		phone: z
			.string()
			.min(1, t('common.required'))
			.regex(/^[6-9]\d{9}$/, t('customer.invalidPhone')),
		email: z.string().email(t('customer.invalidEmail')).optional().or(z.literal('')),
		gstin: z
			.string()
			.length(15, t('customer.gstinInvalidLength', { field: t('customer.gstin') }))
			.optional()
			.or(z.literal('')),
		address: z.string().optional(),
		city: z.string().optional(),
		state: z.string().optional(),
		type: z.enum(['retail', 'contractor', 'builder', 'dealer']),
		customer_type: z.enum(['individual', 'business']),
		company_name: z.string().optional(),
		credit_limit: z.coerce.number().min(0),
		opening_balance: z.coerce.number().min(0),
		balance_type: z.enum(['dr', 'cr']),
		notes: z.string().optional(),
	});

export default function AddCustomerScreen() {
	const { c, s, r } = useThemeTokens();
	const { t } = useLocale();
	const router = useRouter();
	const customerSchema = getCustomerSchema(t);
	const { createCustomer, loading } = useCustomerStore(
		useShallow((s) => ({ createCustomer: s.createCustomer, loading: s.loading })),
	);

	const [creditLimit, setCreditLimit] = useState(0);
	const [openingBalance, setOpeningBalance] = useState(0);
	const phoneInputRef = React.useRef<NativeTextInput>(null);

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<CustomerFormData>({
		resolver: zodResolver(customerSchema) as Resolver<CustomerFormData>,
		defaultValues: {
			name: '',
			phone: '',
			type: 'retail',
			customer_type: 'individual',
			credit_limit: 0,
			opening_balance: 0,
			balance_type: 'dr',
		},
	});

	const customerType = watch('customer_type');
	const balanceType = watch('balance_type');

	const onSubmit = async (data: CustomerFormData) => {
		try {
			await createCustomer({
				name: data.name,
				phone: data.phone,
				gstin: data.gstin,
				address: data.address,
				city: data.city,
				state: data.state,
				type: data.type,
				notes: data.notes,
				credit_limit: creditLimit,
			} as Parameters<typeof createCustomer>[0]);
			router.back();
		} catch (e: unknown) {
			logger.error('Failed to save customer', e instanceof Error ? e : new Error(String(e)));
			Alert.alert(
				t('customer.addErrorTitle'),
				e instanceof Error ? e.message : t('common.unexpectedError'),
				[{ text: t('common.ok') }],
			);
		}
	};

	return (
		<AtomicScreen
			safeAreaEdges={['bottom']}
			withKeyboard
			scrollable
			header={<ScreenHeader title={t('customer.addCustomer')} />}
			footer={
				<View
					style={[
						styles.saveFooter,
						{
							backgroundColor: c.surface,
							borderTopColor: c.border,
							paddingHorizontal: s.lg,
							paddingTop: s.md,
							paddingBottom: s.md,
						},
					]}
				>
					<Button
						title={loading ? t('common.loading') : t('customer.saveCustomer')}
						accessibilityLabel="save-customer-button"
						testID="save-customer-button"
						accessibilityState={{ busy: loading }}
						onPress={handleSubmit(onSubmit)}
						loading={loading}
					/>
				</View>
			}
			scrollViewProps={{ keyboardDismissMode: 'on-drag' }}
			contentContainerStyle={{
				paddingTop: s.lg,
				paddingBottom: s.xl + SPACING_PX['4xl'],
				gap: s.lg,
			}}
		>
			<FormSection title="Basic Info">
				<Card padding="md">
					<Controller
						control={control}
						name="name"
						render={({ field: { onChange, value } }) => (
							<FormField
								label={t('customer.name')}
								accessibilityLabel="customer-name-input"
								testID="customer-name-input"
								required
								placeholder={t('customer.form.placeholders.fullName')}
								value={value}
								onChangeText={onChange}
								returnKeyType="next"
								blurOnSubmit={false}
								onSubmitEditing={() => phoneInputRef.current?.focus()}
								error={errors.name?.message}
							/>
						)}
					/>

					{/* Customer Type Toggle */}
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={{ marginBottom: SPACING_PX.sm - SPACING_PX.xxs }}
					>
						{t('customer.customerType')}
					</ThemedText>
					<View style={[layout.row, styles.toggleRow]}>
						<Pressable
							style={[
								styles.toggleBtn,
								{
									borderRadius: r.md,
									borderColor: c.primary,
									backgroundColor:
										customerType === 'individual' ? c.primary : c.surface,
								},
							]}
							onPress={() => setValue('customer_type', 'individual')}
							accessibilityRole="button"
							accessibilityState={{ selected: customerType === 'individual' }}
						>
							<ThemedText
								variant="caption"
								color={customerType === 'individual' ? c.onPrimary : c.primary}
							>
								{t('customer.individual')}
							</ThemedText>
						</Pressable>
						<Pressable
							style={[
								styles.toggleBtn,
								{
									borderRadius: r.md,
									borderColor: c.primary,
									backgroundColor:
										customerType === 'business' ? c.primary : c.surface,
								},
							]}
							onPress={() => setValue('customer_type', 'business')}
							accessibilityRole="button"
							accessibilityState={{ selected: customerType === 'business' }}
						>
							<ThemedText
								variant="caption"
								color={customerType === 'business' ? c.onPrimary : c.primary}
							>
								{t('customer.business')}
							</ThemedText>
						</Pressable>
					</View>

					{customerType === 'business' && (
						<Controller
							control={control}
							name="company_name"
							render={({ field: { onChange, value } }) => (
								<FormField
									label={t('customer.companyName')}
									accessibilityLabel="customer-company-name-input"
									placeholder="Enter company name"
									value={value}
									onChangeText={onChange}
								/>
							)}
						/>
					)}

					<Controller
						control={control}
						name="phone"
						render={({ field: { onChange, value } }) => (
							<FormField
								ref={phoneInputRef}
								label={t('customer.phone')}
								accessibilityLabel="customer-phone-input"
								testID="customer-phone-input"
								required
								placeholder={t('customer.form.placeholders.phone')}
								keyboardType="phone-pad"
								returnKeyType="done"
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
								accessibilityLabel="customer-email-input"
								placeholder="customer@example.com"
								keyboardType="email-address"
								autoCapitalize="none"
								value={value}
								onChangeText={onChange}
								error={errors.email?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="gstin"
						render={({ field: { onChange, value } }) => (
							<FormField
								label={t('customer.gstin')}
								accessibilityLabel="customer-gstin-input"
								placeholder={t('customer.form.placeholders.gstin')}
								autoCapitalize="characters"
								value={value}
								onChangeText={onChange}
								error={errors.gstin?.message}
							/>
						)}
					/>

					<View style={[layout.row, { gap: s.lg }]}>
						<View style={{ flex: 1 }}>
							<Controller
								control={control}
								name="city"
								render={({ field: { onChange, value } }) => (
									<FormField
										label={t('customer.city')}
										accessibilityLabel="customer-city-input"
										placeholder={t('customer.form.placeholders.city')}
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
										label={t('customer.state')}
										accessibilityLabel="customer-state-input"
										placeholder={t('customer.form.placeholders.state')}
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
								label={t('customer.address')}
								accessibilityLabel="customer-address-input"
								placeholder={t('customer.form.placeholders.address')}
								multiline
								numberOfLines={2}
								value={value}
								onChangeText={onChange}
							/>
						)}
					/>
				</Card>
			</FormSection>

			<FormSection title="Credit & Balance">
				<Card padding="md">
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={{ marginBottom: s.xs }}
					>
						{t('customer.creditLimit')}
					</ThemedText>
					<AmountInput
						label={t('customer.creditLimit')}
						value={creditLimit}
						onChange={(val) => {
							setCreditLimit(val);
							setValue('credit_limit', val);
						}}
						testID="customer-credit-limit-input"
					/>

					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={{ marginTop: s.md, marginBottom: s.xs }}
					>
						Opening Balance
					</ThemedText>
					<AmountInput
						label="Opening Balance"
						value={openingBalance}
						onChange={(val) => {
							setOpeningBalance(val);
							setValue('opening_balance', val);
						}}
						testID="customer-opening-balance-input"
					/>

					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={{ marginTop: s.md, marginBottom: SPACING_PX.sm - SPACING_PX.xxs }}
					>
						Balance Type
					</ThemedText>
					<View style={[layout.row, styles.toggleRow]}>
						<Pressable
							style={[
								styles.toggleBtn,
								{
									flex: 1,
									borderRadius: r.md,
									borderColor: c.primary,
									backgroundColor: balanceType === 'dr' ? c.primary : c.surface,
								},
							]}
							onPress={() => setValue('balance_type', 'dr')}
							accessibilityRole="button"
							accessibilityState={{ selected: balanceType === 'dr' }}
						>
							<ThemedText
								variant="caption"
								color={balanceType === 'dr' ? c.onPrimary : c.primary}
							>
								To Receive (Dr)
							</ThemedText>
						</Pressable>
						<Pressable
							style={[
								styles.toggleBtn,
								{
									flex: 1,
									borderRadius: r.md,
									borderColor: c.primary,
									backgroundColor: balanceType === 'cr' ? c.primary : c.surface,
								},
							]}
							onPress={() => setValue('balance_type', 'cr')}
							accessibilityRole="button"
							accessibilityState={{ selected: balanceType === 'cr' }}
						>
							<ThemedText
								variant="caption"
								color={balanceType === 'cr' ? c.onPrimary : c.primary}
							>
								Advance (Cr)
							</ThemedText>
						</Pressable>
					</View>
				</Card>
			</FormSection>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	toggleRow: {
		gap: SPACING_PX.sm,
		marginBottom: SPACING_PX.md,
	},
	toggleBtn: {
		paddingVertical: SPACING_PX.sm + SPACING_PX.xxs,
		paddingHorizontal: SPACING_PX.lg,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: SPACING_PX['2xl'] + SPACING_PX.sm,
	},
	saveFooter: {
		borderTopWidth: StyleSheet.hairlineWidth,
	},
});
