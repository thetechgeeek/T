import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Button } from '@/src/components/atoms/Button';
import { Card } from '@/src/components/atoms/Card';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { FormField } from '@/src/components/molecules/FormField';
import { layout } from '@/src/theme/layout';
import { useLocale } from '@/src/hooks/useLocale';
import logger from '@/src/utils/logger';

interface CustomerFormData {
	name: string;
	phone?: string;
	gstin?: string;
	address?: string;
	city?: string;
	state?: string;
	type: 'retail' | 'contractor' | 'builder' | 'dealer';
	credit_limit: number;
	notes?: string;
}

const getCustomerSchema = (t: (key: string) => string) =>
	z.object({
		name: z.string().min(2, t('common.required')),
		phone: z.string().optional(),
		gstin: z
			.string()
			.length(15, t('customer.gstin') + ' ' + t('order.detailsMissing'))
			.optional()
			.or(z.literal('')),
		address: z.string().optional(),
		city: z.string().optional(),
		state: z.string().optional(),
		type: z.enum(['retail', 'contractor', 'builder', 'dealer']),
		credit_limit: z.coerce.number().min(0),
		notes: z.string().optional(),
	});

export default function AddCustomerScreen() {
	const { theme } = useThemeTokens();
	const { t } = useLocale();
	const router = useRouter();
	const customerSchema = getCustomerSchema(t);
	const { createCustomer, loading } = useCustomerStore(
		useShallow((s) => ({ createCustomer: s.createCustomer, loading: s.loading })),
	);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<CustomerFormData>({
		resolver: zodResolver(customerSchema) as Resolver<CustomerFormData>,
		defaultValues: {
			type: 'retail',
			credit_limit: 0,
		},
	});

	const onSubmit = async (data: CustomerFormData) => {
		try {
			await createCustomer(data);
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
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard>
			<ScreenHeader title={t('customer.addCustomer')} />
			<ScrollView
				keyboardDismissMode="on-drag"
				style={[styles.container, { backgroundColor: theme.colors.background }]}
			>
				<View style={styles.content}>
					<Card padding="md">
						<Controller
							control={control}
							name="name"
							render={({ field: { onChange, value } }) => (
								<FormField
									label={t('customer.name')}
									accessibilityLabel="customer-name-input"
									required
									placeholder={t('customer.form.placeholders.fullName')}
									value={value}
									onChangeText={onChange}
									error={errors.name?.message}
								/>
							)}
						/>

						<Controller
							control={control}
							name="phone"
							render={({ field: { onChange, value } }) => (
								<FormField
									label={t('customer.phone')}
									accessibilityLabel="customer-phone-input"
									placeholder={t('customer.form.placeholders.phone')}
									keyboardType="phone-pad"
									value={value}
									onChangeText={onChange}
									error={errors.phone?.message}
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

						<View style={[layout.row, { gap: 16 }]}>
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

						<Controller
							control={control}
							name="credit_limit"
							render={({ field: { onChange, value } }) => (
								<FormField
									label={t('customer.creditLimit')}
									accessibilityLabel="customer-credit-limit-input"
									placeholder={t('customer.form.placeholders.creditLimit')}
									keyboardType="numeric"
									value={value.toString()}
									onChangeText={onChange}
								/>
							)}
						/>

						<Button
							title={loading ? t('common.loading') : t('customer.saveCustomer')}
							accessibilityLabel="save-customer-button"
							accessibilityState={{ busy: loading }}
							onPress={handleSubmit(onSubmit)}
							loading={loading}
							style={styles.saveButton}
						/>
					</Card>
				</View>
			</ScrollView>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		padding: 16,
	},
	saveButton: {
		marginTop: 16,
	},
});
