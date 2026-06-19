import React from 'react';
import { View, TouchableOpacity, Pressable, TextInput as NativeTextInput } from 'react-native';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { useLocale } from '@/src/hooks/useLocale';
import { ThemedText } from '@easydesign/design-system';
import { FormField } from '@easydesign/design-system';
import { DatePickerField } from '@easydesign/design-system';
import { Card } from '@easydesign/design-system';
import { Avatar } from '@easydesign/design-system';
import { Badge } from '@easydesign/design-system';
import { withOpacity } from '@easydesign/design-system/foundation';
import { OPACITY_TINT_LIGHT } from '@easydesign/design-system/foundation';
import type { CustomerDraft } from './invoiceCreateTypes';
import { SPACING_PX } from '@easydesign/design-system/foundation';
import { layout } from '@easydesign/design-system/foundation';

const TOGGLE_BORDER_WIDTH = 1.5;
const FIELD_MIN_WIDTH_PX = 160;
const TOGGLE_SWITCH_WIDTH_PX = 42;

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
	const phoneInputRef = React.useRef<NativeTextInput>(null);
	const customerTitle = isCashSale
		? t('invoice.cashWalkInCustomer')
		: customer?.name?.trim() || t('invoice.regularCustomer');
	const customerMeta = isCashSale
		? t('invoice.cashSale')
		: customer?.phone?.trim() ||
			customer?.gstin?.trim() ||
			t('customer.form.placeholders.fullName');

	const update = (field: keyof CustomerDraft) => (text: string) => {
		setCustomer((prev) => ({ name: '', ...prev, [field]: text }));
	};

	return (
		<View testID="invoice-step-1-content">
			<ThemedText variant="h3" style={{ marginBottom: s.md }}>
				{t('invoice.customerDetails')}
			</ThemedText>

			<Card
				variant="outlined"
				padding="md"
				style={{ marginBottom: s.md, backgroundColor: c.surface }}
			>
				<View style={[layout.rowBetween, { alignItems: 'center', gap: s.md }]}>
					<View
						style={{ flexDirection: 'row', alignItems: 'center', gap: s.md, flex: 1 }}
					>
						<Avatar name={customerTitle} size="md" />
						<View style={{ flex: 1 }}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{t('customer.name')}
							</ThemedText>
							<ThemedText weight="semibold" style={{ marginTop: SPACING_PX.xxs }}>
								{customerTitle}
							</ThemedText>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ marginTop: SPACING_PX.xxs }}
							>
								{customerMeta}
							</ThemedText>
						</View>
					</View>
					<Badge
						label={isCashSale ? t('invoice.cashSale') : t('invoice.regularCustomer')}
						variant={isCashSale ? 'warning' : 'neutral'}
						size="sm"
					/>
				</View>

				<View
					style={{
						flexDirection: 'row',
						marginTop: s.md,
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
							backgroundColor: isCashSale ? c.primary : c.surfaceVariant,
							borderWidth: isCashSale ? 0 : TOGGLE_BORDER_WIDTH,
							borderColor: isCashSale ? c.primary : c.borderStrong,
							borderRadius: r.sm,
							alignItems: 'center',
						}}
					>
						<ThemedText
							variant="body"
							weight={isCashSale ? 'semibold' : 'regular'}
							color={isCashSale ? c.onPrimary : c.onSurface}
						>
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
							backgroundColor: !isCashSale ? c.primary : c.surfaceVariant,
							borderWidth: !isCashSale ? 0 : TOGGLE_BORDER_WIDTH,
							borderColor: !isCashSale ? c.primary : c.borderStrong,
							borderRadius: r.sm,
							alignItems: 'center',
						}}
					>
						<ThemedText
							variant="body"
							weight={!isCashSale ? 'semibold' : 'regular'}
							color={!isCashSale ? c.onPrimary : c.onSurface}
						>
							{t('invoice.regularCustomer')}
						</ThemedText>
					</Pressable>
				</View>
			</Card>

			<Card
				variant="outlined"
				padding="md"
				style={{ marginBottom: s.md, backgroundColor: c.surface }}
			>
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s.sm }}>
					<View style={{ flex: 1, minWidth: FIELD_MIN_WIDTH_PX }}>
						<DatePickerField
							label={t('invoice.invoiceDate')}
							value={invoiceDate}
							onChange={setInvoiceDate}
						/>
					</View>
					<View style={{ flex: 1, minWidth: FIELD_MIN_WIDTH_PX }}>
						<FormField
							label={t('invoice.invoiceNumber')}
							accessibilityLabel="invoice-number-input"
							value={invoiceNumber}
							onChangeText={setInvoiceNumber}
							containerStyle={{ marginBottom: 0 }}
						/>
					</View>
				</View>
			</Card>

			{/* Customer fields — shown only when not cash sale */}
			{!isCashSale ? (
				<Card variant="outlined" padding="md" style={{ backgroundColor: c.surface }}>
					<FormField
						label={t('customer.name')}
						accessibilityLabel="customer-name-input"
						testID="customer-name-input"
						required
						placeholder={t('customer.form.placeholders.fullName')}
						value={customer?.name || ''}
						onChangeText={update('name')}
						returnKeyType="next"
						blurOnSubmit={false}
						onSubmitEditing={() => phoneInputRef.current?.focus()}
					/>

					<FormField
						ref={phoneInputRef}
						label={t('common.phone')}
						accessibilityLabel="customer-phone-input"
						testID="customer-phone-input"
						required
						placeholder={t('customer.form.placeholders.phone')}
						keyboardType="phone-pad"
						returnKeyType="done"
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
							marginTop: s.sm,
							padding: s.md,
							backgroundColor: isInterState
								? withOpacity(c.primary, OPACITY_TINT_LIGHT)
								: c.surfaceVariant,
							borderWidth: 1,
							borderColor: isInterState ? c.primary : c.border,
							borderRadius: r.md,
						}}
					>
						<View style={[layout.rowBetween, { alignItems: 'center', gap: s.md }]}>
							<View style={{ flex: 1 }}>
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
							</View>
							<View
								importantForAccessibility="no"
								style={{
									width: TOGGLE_SWITCH_WIDTH_PX,
									height: 24,
									borderRadius: r.full,
									padding: SPACING_PX.xxs,
									backgroundColor: isInterState ? c.primary : c.surface,
									borderWidth: 1,
									borderColor: isInterState ? c.primary : c.borderStrong,
									justifyContent: 'center',
								}}
							>
								<View
									style={{
										width: 16,
										height: 16,
										borderRadius: r.full,
										backgroundColor: isInterState
											? c.onPrimary
											: c.onSurfaceVariant,
										alignSelf: isInterState ? 'flex-end' : 'flex-start',
									}}
								/>
							</View>
						</View>
					</TouchableOpacity>
				</Card>
			) : (
				<Card
					variant="outlined"
					style={{
						padding: s.xl,
						alignItems: 'center',
						backgroundColor: withOpacity(c.primary, OPACITY_TINT_LIGHT),
					}}
				>
					<Avatar
						name={t('invoice.cashWalkInCustomer')}
						size="md"
						style={{ marginBottom: s.sm }}
					/>
					<ThemedText variant="body" color={c.onSurfaceVariant} align="center">
						{t('invoice.cashWalkInCustomer')}
					</ThemedText>
				</Card>
			)}
		</View>
	);
}
