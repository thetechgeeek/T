import React from 'react';
import { View, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Button } from '@/src/components/atoms/Button';
import { Card } from '@/src/components/atoms/Card';
import { Screen } from '@/src/components/atoms/Screen';
import { FormField } from '@/src/components/molecules/FormField';

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

const customerSchema = z.object({
	name: z.string().min(2, 'Name is required'),
	phone: z.string().optional(),
	gstin: z.string().length(15, 'GSTIN must be 15 characters').optional().or(z.literal('')),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	type: z.enum(['retail', 'contractor', 'builder', 'dealer']),
	credit_limit: z.coerce.number().min(0),
	notes: z.string().optional(),
});

export default function AddCustomerScreen() {
	const { theme } = useTheme();
	const router = useRouter();
	const { createCustomer, loading } = useCustomerStore();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<CustomerFormData>({
		resolver: zodResolver(customerSchema) as any,
		defaultValues: {
			type: 'retail',
			credit_limit: 0,
		},
	});

	const onSubmit = async (data: CustomerFormData) => {
		try {
			await createCustomer(data);
			router.back();
		} catch (e: any) {
			console.error(e);
			Alert.alert(
				'Error Saving Customer',
				e.message ||
					'An unexpected error occurred. Please ensure your database is set up correctly.',
				[{ text: 'OK' }],
			);
		}
	};

	return (
		<Screen safeAreaEdges={['top', 'bottom']} withKeyboard>
			<Stack.Screen options={{ title: 'Add Customer' }} />
			<ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
				<View style={styles.content}>
					<Card padding="md">
						<Controller
							control={control}
							name="name"
							render={({ field: { onChange, value } }) => (
								<FormField
									label="Customer Name"
									required
									placeholder="Enter full name"
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
									label="Phone Number"
									placeholder="Enter 10-digit number"
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
									label="GSTIN"
									placeholder="22AAAAA0000A1Z5"
									autoCapitalize="characters"
									value={value}
									onChangeText={onChange}
									error={errors.gstin?.message}
								/>
							)}
						/>

						<View style={[theme.layout.row, { gap: 16 }]}>
							<View style={{ flex: 1 }}>
								<Controller
									control={control}
									name="city"
									render={({ field: { onChange, value } }) => (
										<FormField
											label="City"
											placeholder="e.g. Morbi"
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
											placeholder="e.g. Gujarat"
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
									placeholder="Detailed address"
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
									label="Credit Limit (₹)"
									placeholder="0"
									keyboardType="numeric"
									value={value.toString()}
									onChangeText={onChange}
								/>
							)}
						/>

						<Button
							title={loading ? 'Saving...' : 'Save Customer'}
							onPress={handleSubmit(onSubmit)}
							loading={loading}
							style={styles.saveButton}
						/>
					</Card>
				</View>
			</ScrollView>
		</Screen>
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
