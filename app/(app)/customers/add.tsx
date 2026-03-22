import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCustomerStore } from '@/src/stores/customerStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { TextInput } from '@/src/components/ui/TextInput';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';

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

  const { control, handleSubmit, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema) as any,
    defaultValues: {
      type: 'retail',
      credit_limit: 0,
    }
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      await createCustomer(data);
      router.back();
    } catch (e: any) {
      console.error(e);
      Alert.alert(
        'Error Saving Customer',
        e.message || 'An unexpected error occurred. Please ensure your database is set up correctly.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen options={{ title: 'Add Customer' }} />
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <Card padding="md">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Customer Name *"
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
                <TextInput
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
                <TextInput
                  label="GSTIN"
                  placeholder="22AAAAA0000A1Z5"
                  autoCapitalize="characters"
                  value={value}
                  onChangeText={onChange}
                  error={errors.gstin?.message}
                />
              )}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      label="City"
                      placeholder="e.g. Morbi"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Controller
                  control={control}
                  name="state"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
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
                <TextInput
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
                <TextInput
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
  },
  saveButton: {
    marginTop: 16,
  },
});
