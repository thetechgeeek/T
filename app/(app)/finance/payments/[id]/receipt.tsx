import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Share, Platform, Pressable } from 'react-native';
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

	const crore = Math.floor(n / 10000000);
	const lakh = Math.floor((n % 10000000) / 100000);
	const thousand = Math.floor((n % 100000) / 1000);
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
	const numeric = id.replace(/\D/g, '').slice(-6);
	return numeric.padStart(6, '0');
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
				const found = (all as any[]).find((p: any) => p.id === id);
				setPayment(found ?? null);
			})
			.catch(() => setPayment(null))
			.finally(() => setLoading(false));
	}, [id]);

	const isReceived = payment?.direction === 'received';
	const partyLabel = isReceived ? 'Received from' : 'Paid to';
	const partyName = isReceived
		? ((payment as any)?.customer?.name ?? 'Customer')
		: ((payment as any)?.supplier?.name ?? 'Supplier');

	const receiptNumber = id ? `REC-${padId(id)}` : 'REC-000000';
	const amountWords = payment ? numberToWords(payment.amount) : '';

	const receiptText = payment
		? `PAYMENT RECEIPT\n${receiptNumber}\nDate: ${formatDate(payment.payment_date)}\n${partyLabel}: ${partyName}\nAmount: ${formatCurrency(payment.amount)}\n${amountWords}\nPaid via ${formatMode(payment.payment_mode)}${payment.notes ? '\nRef: ' + payment.notes : ''}\n\nThank you for your payment!`
		: '';

	const handleShareWhatsApp = async () => {
		if (!payment) return;
		const msg = encodeURIComponent(receiptText);
		const url = `whatsapp://send?text=${msg}`;
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
				<View style={styles.center}>
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
				contentContainerStyle={[styles.scroll, { padding: s.md, paddingBottom: 120 }]}
			>
				{/* Receipt Card */}
				<View
					style={
						[
							styles.receiptCard,
							{
								backgroundColor: c.card ?? c.surface,
								borderRadius: r.lg,
								borderColor: c.border,
							},
						] as any
					}
				>
					{/* Top dashed cut line */}
					<View style={[styles.cutLine, { borderColor: c.border }] as any} />

					{/* Business Name */}
					<View style={styles.header}>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={styles.center}
						>
							Your Business
						</ThemedText>
						<ThemedText variant="h2" style={[styles.centered, { marginTop: 4 }] as any}>
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
						<ThemedText variant="h3" style={{ marginTop: 2 }}>
							{partyName}
						</ThemedText>
					</View>

					<Divider style={{ marginVertical: s.sm }} />

					{/* Amount hero */}
					<View
						style={
							[
								styles.amountBlock,
								{
									backgroundColor: c.primaryContainer ?? c.surfaceVariant,
									borderRadius: r.md,
									margin: s.md,
								},
							] as any
						}
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
							style={[styles.centered, { marginTop: 4 }] as any}
						>
							{formatCurrency(payment.amount)}
						</ThemedText>
						<ThemedText
							variant="caption"
							color={c.onSurfaceVariant}
							style={[styles.centered, { marginTop: 6, fontStyle: 'italic' }] as any}
						>
							{amountWords}
						</ThemedText>
					</View>

					{/* Payment mode */}
					<View style={{ paddingHorizontal: s.md, paddingBottom: s.sm, gap: 6 }}>
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
					<View style={[styles.footer, { paddingBottom: s.lg }] as any}>
						<CheckCircle2 size={24} color={c.success} />
						<ThemedText
							variant="bodyBold"
							color={c.success}
							style={{ marginTop: s.xs ?? 4 }}
						>
							Thank You for your payment!
						</ThemedText>
					</View>

					{/* Bottom dashed cut line */}
					<View style={[styles.cutLine, { borderColor: c.border }] as any} />
				</View>

				{/* Action Buttons */}
				<View style={{ gap: s.sm, marginTop: s.lg }}>
					{/* WhatsApp - prominent green */}
					<Pressable
						style={
							[
								styles.whatsappBtn,
								{ backgroundColor: '#25D366', borderRadius: r.md },
							] as any
						}
						onPress={handleShareWhatsApp}
						accessibilityLabel="Share on WhatsApp"
					>
						<MessageCircle size={20} color="#fff" />
						<ThemedText variant="bodyBold" color="#fff" style={{ marginLeft: 8 }}>
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
	center: { textAlign: 'center' as const } as any,
	centered: { textAlign: 'center' as const },
	receiptCard: {
		borderWidth: 1,
		overflow: 'hidden',
	},
	cutLine: {
		borderWidth: 0,
		borderTopWidth: 2,
		borderStyle: 'dashed',
		marginHorizontal: 0,
	},
	header: {
		paddingTop: 20,
		paddingHorizontal: 16,
		paddingBottom: 8,
		alignItems: 'center',
	},
	metaGrid: {
		paddingHorizontal: 16,
		gap: 6,
	},
	metaRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	amountBlock: {
		padding: 16,
		alignItems: 'center',
	},
	footer: {
		alignItems: 'center',
		paddingTop: 8,
	},
	whatsappBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		height: 52,
	},
});
