import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MessageCircle, ShoppingCart, CreditCard } from 'lucide-react-native';
import { supplierRepository } from '@/src/repositories/supplierRepository';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { Card } from '@/src/design-system/components/atoms/Card';
import { Button } from '@/src/design-system/components/atoms/Button';
import { Screen as AtomicScreen } from '@/src/design-system/components/atoms/Screen';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { CustomerDetailSkeleton } from '@/app/components/molecules/skeletons/CustomerDetailSkeleton';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';
import { SIZE_THUMBNAIL_MD } from '@/theme/uiMetrics';
import type { Supplier } from '@/src/types/supplier';
import type { UUID } from '@/src/types/common';

function getInitials(name: string): string {
	return name
		.split(' ')
		.slice(0, 2)
		.map((w) => w.charAt(0).toUpperCase())
		.join('');
}

function getAvatarColor(name: string, colors: readonly string[]): string {
	return colors[name.charCodeAt(0) % colors.length] ?? colors[0];
}

type TabName = 'ledger' | 'purchases';

export default function SupplierDetailScreen() {
	const { id } = useLocalSearchParams<{ id: UUID }>();
	const { c, s, r, theme } = useThemeTokens();
	const { t } = useLocale();

	const [supplier, setSupplier] = useState<Supplier | null>(null);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<TabName>('ledger');
	const fetchedId = useRef<string | null>(null);

	useEffect(() => {
		if (!id || fetchedId.current === id) return;
		fetchedId.current = id;
		setLoading(true);
		supplierRepository
			.findById(id)
			.then(setSupplier)
			.catch((e: unknown) => {
				Alert.alert(
					t('common.errorTitle'),
					e instanceof Error ? e.message : 'Failed to load supplier',
					[{ text: t('common.ok') }],
				);
			})
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const handleCall = () => {
		if (!supplier?.phone) return;
		Linking.openURL(`tel:${supplier.phone}`).catch(() =>
			Alert.alert('Error', 'Unable to make call'),
		);
	};

	const handleWhatsApp = () => {
		if (!supplier?.phone) return;
		const phone = supplier.phone.replace(/[^0-9]/g, '');
		Linking.openURL(`https://wa.me/91${phone}`).catch(() =>
			Alert.alert('Error', 'WhatsApp not available'),
		);
	};

	const handleNewPurchase = () => {
		Alert.alert('Coming Soon', 'New Purchase feature is not yet implemented.');
	};

	const handleMakePayment = () => {
		Alert.alert('Coming Soon', 'Make Payment feature is not yet implemented.');
	};

	if (loading && !supplier) {
		return (
			<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
				<ScreenHeader title="" />
				<CustomerDetailSkeleton />
			</AtomicScreen>
		);
	}

	if (!supplier) {
		return null;
	}

	return (
		<AtomicScreen
			safeAreaEdges={['bottom']}
			withKeyboard={false}
			scrollable
			header={<ScreenHeader title={supplier.name} />}
			contentContainerStyle={styles.scrollContent}
		>
			{/* Header Card */}
			<Card style={styles.headerCard}>
				<View style={styles.avatarRow}>
					<View
						style={[
							styles.avatar,
							{
								backgroundColor: getAvatarColor(
									supplier.name,
									theme.collections.partyAvatarColors,
								),
							},
						]}
					>
						<ThemedText
							weight="bold"
							color={c.white}
							style={{ fontSize: FONT_SIZE.h2 }}
						>
							{getInitials(supplier.name)}
						</ThemedText>
					</View>
					<View style={styles.headerInfo}>
						<ThemedText variant="h2">{supplier.name}</ThemedText>
						{supplier.phone ? (
							<TouchableOpacity onPress={handleCall} accessibilityRole="button">
								<ThemedText variant="body" color={c.primary}>
									{supplier.phone}
								</ThemedText>
							</TouchableOpacity>
						) : null}
						{supplier.city ? (
							<ThemedText variant="caption" color={c.onSurfaceVariant}>
								{[supplier.city, supplier.state].filter(Boolean).join(', ')}
							</ThemedText>
						) : null}
					</View>
				</View>

				{supplier.payment_terms ? (
					<View style={[styles.infoRow, { marginTop: s.sm }]}>
						<ThemedText variant="caption" color={c.onSurfaceVariant}>
							Payment Terms:{' '}
						</ThemedText>
						<ThemedText variant="captionBold">{supplier.payment_terms}</ThemedText>
					</View>
				) : null}
			</Card>

			{/* Quick Actions */}
			<View style={styles.actionsRow}>
				<Button
					title="New Purchase"
					variant="primary"
					leftIcon={<ShoppingCart size={18} color={c.white} />}
					style={{ flex: 1, marginRight: SPACING_PX.xs }}
					onPress={handleNewPurchase}
				/>
				<Button
					title="Make Payment"
					variant="outline"
					leftIcon={<CreditCard size={18} color={c.primary} />}
					style={{ flex: 1, marginLeft: SPACING_PX.xs }}
					onPress={handleMakePayment}
				/>
			</View>

			{/* WhatsApp */}
			{supplier.phone ? (
				<TouchableOpacity
					style={[styles.whatsappBtn, { backgroundColor: c.success, borderRadius: r.md }]}
					onPress={handleWhatsApp}
					accessibilityRole="button"
					accessibilityLabel="whatsapp-supplier"
				>
					<MessageCircle size={18} color={c.onSuccess} />
					<ThemedText
						variant="body"
						color={c.onSuccess}
						style={{ marginLeft: SPACING_PX.sm }}
					>
						WhatsApp
					</ThemedText>
				</TouchableOpacity>
			) : null}

			{/* Tab Bar */}
			<View
				style={[
					styles.tabBar,
					{
						borderBottomColor: c.border,
						borderBottomWidth: StyleSheet.hairlineWidth,
					},
				]}
			>
				{(['ledger', 'purchases'] as TabName[]).map((tab) => {
					const isActive = activeTab === tab;
					return (
						<TouchableOpacity
							key={tab}
							style={[
								styles.tab,
								isActive
									? {
											borderBottomColor: c.primary,
											borderBottomWidth: 2,
										}
									: undefined,
							]}
							onPress={() => setActiveTab(tab)}
							accessibilityRole="tab"
							accessibilityState={{ selected: isActive }}
						>
							<ThemedText
								variant="body"
								color={isActive ? c.primary : c.onSurfaceVariant}
								style={isActive ? { fontWeight: '600' } : undefined}
							>
								{tab === 'ledger' ? 'Ledger' : 'Purchases'}
							</ThemedText>
						</TouchableOpacity>
					);
				})}
			</View>

			{/* Tab Content */}
			<View style={styles.tabContent}>
				{activeTab === 'ledger' ? (
					<View style={styles.emptyState}>
						<ThemedText variant="h3" color={c.onSurfaceVariant}>
							Ledger Coming Soon
						</ThemedText>
						<ThemedText
							variant="body"
							color={c.placeholder}
							style={{ marginTop: s.sm, textAlign: 'center' }}
						>
							Supplier ledger history will appear here.
						</ThemedText>
					</View>
				) : (
					<View style={styles.emptyState}>
						<ThemedText variant="h3" color={c.onSurfaceVariant}>
							No Purchases Yet
						</ThemedText>
						<ThemedText
							variant="body"
							color={c.placeholder}
							style={{ marginTop: s.sm, textAlign: 'center' }}
						>
							Purchase orders from this supplier will appear here.
						</ThemedText>
					</View>
				)}
			</View>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	scrollContent: {
		padding: SPACING_PX.lg,
		paddingBottom: SPACING_PX['3xl'] - SPACING_PX.sm,
	},
	headerCard: {
		marginBottom: SPACING_PX.lg,
	},
	avatarRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: SPACING_PX.lg,
	},
	avatar: {
		width: SIZE_THUMBNAIL_MD,
		height: SIZE_THUMBNAIL_MD,
		borderRadius: SIZE_THUMBNAIL_MD / 2,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerInfo: {
		flex: 1,
		gap: SPACING_PX.xxs,
	},
	infoRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	actionsRow: {
		flexDirection: 'row',
		marginBottom: SPACING_PX.md,
	},
	whatsappBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: SPACING_PX.md,
		marginBottom: SPACING_PX.lg,
	},
	tabBar: {
		flexDirection: 'row',
		marginBottom: 0,
	},
	tab: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: SPACING_PX.md,
	},
	tabContent: {
		paddingTop: SPACING_PX.lg,
	},
	emptyState: {
		alignItems: 'center',
		paddingVertical: SPACING_PX['3xl'],
		paddingHorizontal: SPACING_PX['2xl'],
	},
});
