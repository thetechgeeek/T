import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
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
	const { c, s, r } = useThemeTokens();

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
				accessibilityLabel="customer-name-input"
				required
				placeholder="e.g. Rahul Sharma"
				value={customer?.name || ''}
				onChangeText={update('name')}
			/>

			<FormField
				label="Phone"
				accessibilityLabel="customer-phone-input"
				placeholder="10-digit mobile number"
				keyboardType="phone-pad"
				value={customer?.phone || ''}
				onChangeText={update('phone')}
			/>

			<FormField
				label="GSTIN (Optional)"
				accessibilityLabel="customer-gstin-input"
				placeholder="22AAAAA0000A1Z5"
				autoCapitalize="characters"
				value={customer?.gstin || ''}
				onChangeText={update('gstin')}
			/>

			<TouchableOpacity
				onPress={() => setIsInterState(!isInterState)}
				accessibilityRole="togglebutton"
				accessibilityLabel="inter-state-igst-toggle"
				accessibilityState={{ checked: isInterState }}
				accessibilityHint="Enable if customer is in a different state — applies IGST instead of CGST and SGST"
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
				<ThemedText
					variant="caption"
					color={c.onSurfaceVariant}
					importantForAccessibility="no"
					style={{ marginTop: 4 }}
				>
					Toggle this if the customer is located in a different state.
				</ThemedText>
			</TouchableOpacity>
		</View>
	);
}
