import React, { useEffect, useState } from 'react';
import {
	AMOUNT_SHORT_FORMAT_ONE_CRORE,
	AMOUNT_SHORT_FORMAT_ONE_LAKH,
	AMOUNT_SHORT_FORMAT_ONE_THOUSAND,
} from '@/constants/money';
import { SIZE_INPUT_HEIGHT, SIZE_LANGUAGE_FLAG } from '@/theme/uiMetrics';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

const RECEIPT_BOTTOM_PADDING = SIZE_LANGUAGE_FLAG;
const ID_TAIL_DIGITS = 6;
import { View, ScrollView, StyleSheet, Share, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MessageCircle, FileText, CheckCircle2 } from 'lucide-react-native';
import { paymentService } from '@/src/services/paymentService';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { Divider } from '@/src/components/atoms/Divider';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SkeletonBlock } from '@/src/components/molecules/SkeletonBlock';
import type { Payment } from '@/src/types/finance';

// ── Helpers ────────────────────────────────────────────────────────────────

const ONES = [
	'',
	'One',
	'Two',
	'Three',
	'Four',
	'Five',
	'Six',
	'Seven',
	'Eight',
	'Nine',
	'Ten',
	'Eleven',
	'Twelve',
	'Thirteen',
	'Fourteen',
	'Fifteen',
	'Sixteen',
	'Seventeen',
	'Eighteen',
	'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n: number): string {
	if (n < 20) return ONES[n] ?? '';
	return (TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')).trim();
}

function numberToWords(amount: number): string {
	const n = Math.round(amount);
	if (n === 0) return 'Zero';
	if (n < 0) return 'Minus ' + numberToWords(-n);

	const crore = Math.floor(n / AMOUNT_SHORT_FORMAT_ONE_CRORE);
	const lakh = Math.floor((n % AMOUNT_SHORT_FORMAT_ONE_CRORE) / AMOUNT_SHORT_FORMAT_ONE_LAKH);
	const thousand = Math.floor(
		(n % AMOUNT_SHORT_FORMAT_ONE_LAKH) / AMOUNT_SHORT_FORMAT_ONE_THOUSAND,
	);
	const hundred = Math.floor((n % 1000) / 100);
	const rest = n % 100;

	const parts: string[] = [];
	if (crore) parts.push(twoDigits(crore) + ' Crore');
	if (lakh) parts.push(twoDigits(lakh) + ' Lakh');
	if (thousand) parts.push(twoDigits(thousand) + ' Thousand');
	if (hundred) parts.push(ONES[hundred] + ' Hundred');
	if (rest) parts.push(twoDigits(rest));

	return 'Rupees ' + parts.join(' ') + ' Only';
}

function formatMode(mode: string): string {
	return mode.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function padId(id: string): string {
	// Use last 6 chars of UUID or numeric part
	const numeric = id.replace(/\D/g, '').slice(-ID_TAIL_DIGITS);
	return numeric.padStart(ID_TAIL_DIGITS, '0');
}

// ── Component ──────────────────────────────────────────────────────────────

export default function PaymentReceiptScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { c, s, r } = useThemeTokens();
	const { formatCurrency, formatDate } = useLocale();

	const [payment, setPayment] = useState<
		| (Payment & {
				customer?: { name: string };
				supplier?: { name: string };
		  })
		| null
	>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) return;
		paymentService
			.fetchPayments({})
			.then((all) => {
				const found = all?.find((p) => p.id === id);
				setPayment(found ?? null);
			})
			.catch(() => setPayment(null))
			.finally(() => setLoading(false));
	}, [id]);

	const isReceived = payment?.direction === 'received';
	const partyLabel = isReceived ? 'Received from' : 'Paid to';
	const partyName = isReceived
		? (payment?.customer?.name ?? 'Customer')
		: (payment?.supplier?.name ?? 'Supplier');

	const receiptNumber = id ? `REC-${padId(id)}` : 'REC-000000';
	const amountWords = payment ? numberToWords(payment.amount) : '';

	const receiptText = payment
		? `PAYMENT RECEIPT\n${receiptNumber}\nDate: ${formatDate(payment.payment_date)}\n${partyLabel}: ${partyName}\nAmount: ${formatCurrency(payment.amount)}\n${amountWords}\nPaid via ${formatMode(payment.payment_mode)}${payment.notes ? '\nRef: ' + payment.notes : ''}\n\nThank you for your payment!`
		: '';

	const handleShareWhatsApp = async () => {
		if (!payment) return;
		try {
			await Share.share({ message: receiptText });
		} catch {
			// ignore
		}
	};

	const handleSharePdf = async () => {
		if (!payment) return;
		try {
			await Share.share({ message: receiptText, title: receiptNumber });
		} catch {
			// ignore
		}
	};

	if (loading) {
		return (
			<Screen safeAreaEdges={['bottom']}>
				<ScreenHeader title="Payment Receipt" />
				<View style={{ padding: s.md, gap: s.sm }}>
					<SkeletonBlock height={200} borderRadius={12} />
					<SkeletonBlock height={80} borderRadius={8} />
					<SkeletonBlock height={56} borderRadius={8} />
					<SkeletonBlock height={56} borderRadius={8} />
				</View>
			</Screen>
		);
	}

	if (!payment) {
		return (
			<Screen safeAreaEdges={['bottom']}>
				<ScreenHeader title="Payment Receipt" />
				<View style={styles.emptyState}>
					<ThemedText color={c.error}>Payment not found.</ThemedText>
					<Button
						title="Go Back"
						variant="ghost"
						onPress={() => router.back()}
						style={{ marginTop: s.md }}
					/>
				</View>
			</Screen>
		);
	}

	return (
		<Screen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="Payment Receipt" />

			<ScrollView
				contentContainerStyle={[
					styles.scroll,
					{ padding: s.md, paddingBottom: RECEIPT_BOTTOM_PADDING },
				]}
			>
				<View
					style={[
						styles.receiptCard,
						{
							backgroundColor: c.card ?? c.surface,
							borderRadius: r.lg,
							borderColor: c.border,
						},
					]}
				>
					{/* Top dashed cut line */}
					<View style={[styles.cutLine, { borderColor: c.border }]} />

					{/* Business Name */}
					<View style={styles.header}>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.textCenter}
						>
							Your Business
						</ThemedText>
						<ThemedText
							variant="h2"
							style={[styles.centered, { marginTop: SPACING_PX.xs }]}
						>
							PAYMENT RECEIPT
						</ThemedText>
					</View>

					<Divider style={{ marginVertical: s.sm }} />

					{/* Receipt meta */}
					<View style={styles.metaGrid}>
						<View style={styles.metaRow}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Receipt No.
							</ThemedText>
							<ThemedText variant="captionBold">{receiptNumber}</ThemedText>
						</View>
						<View style={styles.metaRow}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Date
							</ThemedText>
							<ThemedText variant="captionBold">
								{formatDate(payment.payment_date)}
							</ThemedText>
						</View>
					</View>

					<Divider style={{ marginVertical: s.sm }} />

					{/* Party */}
					<View style={{ paddingHorizontal: s.md, paddingBottom: s.sm }}>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							{partyLabel}
						</ThemedText>
						<ThemedText variant="h3" style={{ marginTop: SPACING_PX.xxs }}>
							{partyName}
						</ThemedText>
					</View>

					<Divider style={{ marginVertical: s.sm }} />

					<View
						style={[
							styles.amountBlock,
							{
								backgroundColor: c.primaryContainer ?? c.surfaceVariant,
								borderRadius: r.md,
								margin: s.md,
							},
						]}
					>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.centered}
						>
							Amount {isReceived ? 'Received' : 'Paid'}
						</ThemedText>
						<ThemedText
							variant="display"
							color={c.primary}
							style={[styles.centered, { marginTop: SPACING_PX.xs }]}
						>
							{formatCurrency(payment.amount)}
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={[
								styles.centered,
								{ marginTop: SPACING_PX.xs + SPACING_PX.xxs, fontStyle: 'italic' },
							]}
						>
							{amountWords}
						</ThemedText>
					</View>

					{/* Payment mode */}
					<View
						style={{
							paddingHorizontal: s.md,
							paddingBottom: s.sm,
							gap: SPACING_PX.xs + SPACING_PX.xxs,
						}}
					>
						<View style={styles.metaRow}>
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								Payment Mode
							</ThemedText>
							<ThemedText variant="captionBold">
								{formatMode(payment.payment_mode)}
							</ThemedText>
						</View>

						{!!payment.notes && (
							<View style={styles.metaRow}>
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									Reference
								</ThemedText>
								<ThemedText variant="captionBold">{payment.notes}</ThemedText>
							</View>
						)}
					</View>

					<Divider style={{ marginVertical: s.sm }} />

					{/* Footer */}
					<View style={[styles.footer, { paddingBottom: s.lg }]}>
						<CheckCircle2 size={24} color={c.success} />
						<ThemedText
							variant="bodyBold"
							color={c.success}
							style={{ marginTop: s.xs }}
						>
							Thank You for your payment!
						</ThemedText>
					</View>

					{/* Bottom dashed cut line */}
					<View style={[styles.cutLine, { borderColor: c.border }]} />
				</View>

				{/* Action Buttons */}
				<View style={{ gap: s.sm, marginTop: s.lg }}>
					{/* WhatsApp - prominent green */}
					<Pressable
						style={[
							styles.whatsappBtn,
							{ backgroundColor: c.success, borderRadius: r.md },
						]}
						onPress={handleShareWhatsApp}
						accessibilityLabel="Share on WhatsApp"
					>
						<MessageCircle size={20} color={c.onPrimary} />
						<ThemedText
							variant="bodyBold"
							color={c.onPrimary}
							style={{ marginLeft: SPACING_PX.sm }}
						>
							Share on WhatsApp
						</ThemedText>
					</Pressable>

					<Button
						title="Share PDF"
						variant="outline"
						leftIcon={<FileText size={18} color={c.primary} />}
						onPress={handleSharePdf}
						accessibilityLabel="share-pdf"
					/>

					<Button
						title="Done"
						variant="ghost"
						onPress={() => router.back()}
						accessibilityLabel="done"
					/>
				</View>
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	scroll: {},
	emptyState: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: SPACING_PX.xl - SPACING_PX.xxs,
	},
	textCenter: { textAlign: 'center' },
	centered: { textAlign: 'center' as const },
	receiptCard: {
		borderWidth: 1,
		overflow: 'hidden',
	},
	cutLine: {
		borderWidth: 0,
		borderTopWidth: SPACING_PX.xxs,
		borderStyle: 'dashed',
	},
	header: {
		paddingTop: SPACING_PX.xl - SPACING_PX.xxs,
		paddingHorizontal: SPACING_PX.lg,
		paddingBottom: SPACING_PX.sm,
		alignItems: 'center',
	},
	metaGrid: {
		paddingHorizontal: SPACING_PX.lg,
		gap: SPACING_PX.xs + SPACING_PX.xxs,
	},
	metaRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	amountBlock: {
		padding: SPACING_PX.lg,
		alignItems: 'center',
	},
	footer: {
		alignItems: 'center',
		paddingTop: SPACING_PX.sm,
	},
	whatsappBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		height: SIZE_INPUT_HEIGHT,
	},
});
