import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { FormField } from '@/src/components/molecules/FormField';
import { withOpacity } from '@/src/utils/color';
import type { CustomerDraft } from './useInvoiceCreateFlow';

interface Props {
	customer: CustomerDraft | null;
	setCustomer: React.Dispatch<React.SetStateAction<CustomerDraft | null>>;
	isInterState: boolean;
	setIsInterState: (v: boolean) => void;
}

export function CustomerStep({ customer, setCustomer, isInterState, setIsInterState }: Props) {
	const { theme } = useTheme();
	const c = theme.colors;
	const s = theme.spacing;
	const r = theme.borderRadius;

	const update = (field: keyof CustomerDraft) => (text: string) => {
		setCustomer((prev) => ({ name: '', ...prev, [field]: text }));
	};

	return (
		<View>
			<ThemedText variant="h3" style={{ marginBottom: s.md }}>
				Customer Details
			</ThemedText>

			<FormField
				label="Name"
				required
				placeholder="e.g. Rahul Sharma"
				value={customer?.name || ''}
				onChangeText={update('name')}
			/>

			<FormField
				label="Phone"
				placeholder="10-digit mobile number"
				keyboardType="phone-pad"
				value={customer?.phone || ''}
				onChangeText={update('phone')}
			/>

			<FormField
				label="GSTIN (Optional)"
				placeholder="22AAAAA0000A1Z5"
				autoCapitalize="characters"
				value={customer?.gstin || ''}
				onChangeText={update('gstin')}
			/>

			<TouchableOpacity
				onPress={() => setIsInterState(!isInterState)}
				accessibilityRole="togglebutton"
				accessibilityState={{ selected: isInterState }}
				style={{
					marginTop: s.lg,
					padding: s.md,
					backgroundColor: isInterState ? withOpacity(c.primary, 0.12) : c.surface,
					borderWidth: 1,
					borderColor: isInterState ? c.primary : c.border,
					borderRadius: r.md,
				}}
			>
				<ThemedText weight={isInterState ? 'bold' : 'regular'}>
					Inter-State (IGST): {isInterState ? 'Yes' : 'No'}
				</ThemedText>
				<ThemedText variant="caption" color={c.onSurfaceVariant} style={{ marginTop: 4 }}>
					Toggle this if the customer is located in a different state.
				</ThemedText>
			</TouchableOpacity>
		</View>
	);
}
