import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Phone, MessageCircle, ShoppingCart, CreditCard } from 'lucide-react-native';
import { supplierRepository } from '@/src/repositories/supplierRepository';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { Card } from '@/src/components/atoms/Card';
import { Button } from '@/src/components/atoms/Button';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { CustomerDetailSkeleton } from '@/src/components/molecules/skeletons/CustomerDetailSkeleton';
import type { Supplier } from '@/src/types/supplier';
import type { UUID } from '@/src/types/common';

const AVATAR_COLORS = [
	'#E57373',
	'#F06292',
	'#BA68C8',
	'#7986CB',
	'#4FC3F7',
	'#4DB6AC',
	'#81C784',
	'#FFB74D',
];

function getInitials(name: string): string {
	return name
		.split(' ')
		.slice(0, 2)
		.map((w) => w.charAt(0).toUpperCase())
		.join('');
}

function getAvatarColor(name: string): string {
	return AVATAR_COLORS[name.charCodeAt(0) % 8] ?? AVATAR_COLORS[0];
}

type TabName = 'ledger' | 'purchases';

export default function SupplierDetailScreen() {
	const { id } = useLocalSearchParams<{ id: UUID }>();
	const { theme, c, s, r } = useThemeTokens();
	const { t } = useLocale();
	const router = useRouter();

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
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title={supplier.name} />

			<ScrollView contentContainerStyle={styles.scrollContent}>
				{/* Header Card */}
				<Card style={styles.headerCard}>
					<View style={styles.avatarRow}>
						<View
							style={[
								styles.avatar,
								{ backgroundColor: getAvatarColor(supplier.name) },
							]}
						>
							<ThemedText weight="bold" color="#FFFFFF" style={{ fontSize: 22 }}>
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
						leftIcon={<ShoppingCart size={18} color="white" />}
						style={{ flex: 1, marginRight: 4 }}
						onPress={handleNewPurchase}
					/>
					<Button
						title="Make Payment"
						variant="outline"
						leftIcon={<CreditCard size={18} color={c.primary} />}
						style={{ flex: 1, marginLeft: 4 }}
						onPress={handleMakePayment}
					/>
				</View>

				{/* WhatsApp */}
				{supplier.phone ? (
					<TouchableOpacity
						style={[
							styles.whatsappBtn,
							{ backgroundColor: '#25D366', borderRadius: r.md },
						]}
						onPress={handleWhatsApp}
						accessibilityRole="button"
						accessibilityLabel="whatsapp-supplier"
					>
						<MessageCircle size={18} color="white" />
						<ThemedText variant="body" color="#FFFFFF" style={{ marginLeft: 8 }}>
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
			</ScrollView>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	scrollContent: {
		padding: 16,
		paddingBottom: 40,
	},
	headerCard: {
		marginBottom: 16,
	},
	avatarRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
	},
	avatar: {
		width: 56,
		height: 56,
		borderRadius: 28,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerInfo: {
		flex: 1,
		gap: 2,
	},
	infoRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	actionsRow: {
		flexDirection: 'row',
		marginBottom: 12,
	},
	whatsappBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		marginBottom: 16,
	},
	tabBar: {
		flexDirection: 'row',
		marginBottom: 0,
	},
	tab: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 12,
	},
	tabContent: {
		paddingTop: 16,
	},
	emptyState: {
		alignItems: 'center',
		paddingVertical: 48,
		paddingHorizontal: 32,
	},
});
