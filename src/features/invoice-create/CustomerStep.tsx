import React from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { FormField } from '@/src/design-system/components/molecules/FormField';
import { DatePickerField } from '@/src/design-system/components/molecules/DatePickerField';
import { Card } from '@/src/design-system/components/atoms/Card';
import { withOpacity } from '@/src/utils/color';
import { OPACITY_TINT_LIGHT } from '@/theme/uiMetrics';
import type { CustomerDraft } from './invoiceCreateTypes';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

const TOGGLE_BORDER_WIDTH = 1.5;

interface Props {
	customer: CustomerDraft | null;
	setCustomer: React.Dispatch<React.SetStateAction<CustomerDraft | null>>;
	isInterState: boolean;
	setIsInterState: (v: boolean) => void;
	invoiceDate: string;
	setInvoiceDate: (v: string) => void;
	invoiceNumber: string;
	setInvoiceNumber: (v: string) => void;
	isCashSale: boolean;
	setIsCashSale: (v: boolean) => void;
}

export function CustomerStep({
	customer,
	setCustomer,
	isInterState,
	setIsInterState,
	invoiceDate,
	setInvoiceDate,
	invoiceNumber,
	setInvoiceNumber,
	isCashSale,
	setIsCashSale,
}: Props) {
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

			{/* Invoice Date */}
			<View style={{ marginBottom: s.md }}>
				<DatePickerField
					label={t('invoice.invoiceDate')}
					value={invoiceDate}
					onChange={setInvoiceDate}
				/>
			</View>

			{/* Invoice Number */}
			<FormField
				label={t('invoice.invoiceNumber')}
				accessibilityLabel="invoice-number-input"
				value={invoiceNumber}
				onChangeText={setInvoiceNumber}
			/>

			{/* Cash Sale / Regular Customer toggle */}
			<View
				style={{
					flexDirection: 'row',
					marginBottom: s.md,
					gap: s.sm,
				}}
			>
				<Pressable
					onPress={() => setIsCashSale(true)}
					accessibilityRole="button"
					accessibilityLabel="cash-sale-toggle"
					accessibilityState={{ selected: isCashSale }}
					style={{
						flex: 1,
						paddingVertical: s.sm,
						paddingHorizontal: s.md,
						backgroundColor: isCashSale ? c.primary : c.surface,
						borderWidth: isCashSale ? 0 : TOGGLE_BORDER_WIDTH,
						borderColor: c.primary,
						borderRadius: r.sm,
						alignItems: 'center',
					}}
				>
					<ThemedText variant="body" color={isCashSale ? c.onPrimary : c.primary}>
						{t('invoice.cashSale')}
					</ThemedText>
				</Pressable>

				<Pressable
					onPress={() => setIsCashSale(false)}
					accessibilityRole="button"
					accessibilityLabel="regular-customer-toggle"
					accessibilityState={{ selected: !isCashSale }}
					style={{
						flex: 1,
						paddingVertical: s.sm,
						paddingHorizontal: s.md,
						backgroundColor: !isCashSale ? c.primary : c.surface,
						borderWidth: !isCashSale ? 0 : TOGGLE_BORDER_WIDTH,
						borderColor: c.primary,
						borderRadius: r.sm,
						alignItems: 'center',
					}}
				>
					<ThemedText variant="body" color={!isCashSale ? c.onPrimary : c.primary}>
						{t('invoice.regularCustomer')}
					</ThemedText>
				</Pressable>
			</View>

			{/* Customer fields — shown only when not cash sale */}
			{!isCashSale ? (
				<View>
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
						required
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
							backgroundColor: isInterState
								? withOpacity(c.primary, OPACITY_TINT_LIGHT)
								: c.surface,
							borderWidth: 1,
							borderColor: isInterState ? c.primary : c.border,
							borderRadius: r.md,
						}}
					>
						<ThemedText weight={isInterState ? 'bold' : 'regular'}>
							{t('invoice.interState')}:{' '}
							{isInterState ? t('common.yes') : t('common.no')}
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							importantForAccessibility="no"
							style={{ marginTop: SPACING_PX.xs }}
						>
							{t('invoice.interStateHint')}
						</ThemedText>
					</TouchableOpacity>
				</View>
			) : (
				<Card
					style={{
						padding: s.xl,
						alignItems: 'center',
						backgroundColor: c.surfaceVariant,
					}}
				>
					<ThemedText variant="body" color={c.onSurfaceVariant} align="center">
						{t('invoice.cashWalkInCustomer')}
					</ThemedText>
				</Card>
			)}
		</View>
	);
}
