import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
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
	const { t } = useLocale();

	const update = (field: keyof CustomerDraft) => (text: string) => {
		setCustomer((prev) => ({ name: '', ...prev, [field]: text }));
	};

	return (
		<View>
			<ThemedText variant="h3" style={{ marginBottom: s.md }}>
				{t('invoice.customerDetails')}
			</ThemedText>

			<FormField
				label={t('customer.name')}
				accessibilityLabel="customer-name-input"
				required
				placeholder={t('customer.form.placeholders.fullName')}
				value={customer?.name || ''}
				onChangeText={update('name')}
			/>

			<FormField
				label={t('common.phone')}
				accessibilityLabel="customer-phone-input"
				placeholder={t('customer.form.placeholders.phone')}
				keyboardType="phone-pad"
				value={customer?.phone || ''}
				onChangeText={update('phone')}
			/>

			<FormField
				label={t('customer.gstin') + ` (${t('common.optional')})`}
				accessibilityLabel="customer-gstin-input"
				placeholder={t('customer.form.placeholders.gstin')}
				autoCapitalize="characters"
				value={customer?.gstin || ''}
				onChangeText={update('gstin')}
			/>

			<TouchableOpacity
				onPress={() => setIsInterState(!isInterState)}
				accessibilityRole="togglebutton"
				accessibilityLabel="inter-state-igst-toggle"
				accessibilityState={{ checked: isInterState }}
				accessibilityHint={t('invoice.interStateAccessibilityHint')}
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
					{t('invoice.interState')}: {isInterState ? t('common.yes') : t('common.no')}
				</ThemedText>
				<ThemedText
					variant="caption"
					color={c.onSurfaceVariant}
					importantForAccessibility="no"
					style={{ marginTop: 4 }}
				>
					{t('invoice.interStateHint')}
				</ThemedText>
			</TouchableOpacity>
		</View>
	);
}
