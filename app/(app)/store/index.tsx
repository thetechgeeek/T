import React, { useState } from 'react';
import {
	View,
	ScrollView,
	StyleSheet,
	Switch,
	TouchableOpacity,
	Alert,
	Pressable,
} from 'react-native';
import {
	ChevronRight,
	Copy,
	Globe,
	Package,
	ShoppingCart,
	Clock,
	Settings,
	Palette,
	Share2,
	Zap,
} from 'lucide-react-native';

import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { Badge } from '@/src/components/atoms/Badge';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';

const STORE_URL = 'yourbiz.billapp.in';

interface StatCardProps {
	label: string;
	value: number | string;
	icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
	const { c, s, r } = useThemeTokens();
	return (
		<View style={[styles.statCard, { backgroundColor: c.surface, borderRadius: r.md }]}>
			<View style={styles.statIcon}>{icon}</View>
			<ThemedText variant="h2" style={{ color: c.onSurface }}>
				{value}
			</ThemedText>
			<ThemedText
				variant="caption"
				style={{ color: c.onSurfaceVariant, textAlign: 'center' }}
			>
				{label}
			</ThemedText>
		</View>
	);
}

interface RowItemProps {
	label: string;
	sub?: string;
	icon: React.ReactNode;
	onPress: () => void;
	isLast?: boolean;
}

function RowItem({ label, sub, icon, onPress, isLast }: RowItemProps) {
	const { c, s } = useThemeTokens();
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.rowItem,
				!isLast && {
					borderBottomWidth: StyleSheet.hairlineWidth,
					borderBottomColor: c.border,
				},
				pressed && { backgroundColor: c.surfaceVariant },
			]}
			accessibilityRole="button"
		>
			<View style={[styles.rowIconWrap, { backgroundColor: c.surfaceVariant }]}>{icon}</View>
			<View style={styles.rowText}>
				<ThemedText variant="body" style={{ color: c.onSurface }}>
					{label}
				</ThemedText>
				{sub ? (
					<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
						{sub}
					</ThemedText>
				) : null}
			</View>
			<ChevronRight size={18} color={c.onSurfaceVariant} />
		</Pressable>
	);
}

export default function OnlineStoreScreen() {
	const { c, s, r } = useThemeTokens();
	const [storeEnabled, setStoreEnabled] = useState(true);

	function handleCopyUrl() {
		Alert.alert('Copied', `${STORE_URL} copied to clipboard`);
	}

	function handleComingSoon() {
		Alert.alert('Coming Soon', 'This feature will be available soon.');
	}

	function handleShareStore() {
		Alert.alert('Share Store Link', 'How would you like to share?', [
			{
				text: 'Share via WhatsApp',
				onPress: () => Alert.alert('WhatsApp', `Sharing ${STORE_URL} via WhatsApp`),
			},
			{
				text: 'Copy Link',
				onPress: handleCopyUrl,
			},
			{ text: 'Cancel', style: 'cancel' },
		]);
	}

	return (
		<AtomicScreen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Online Store" showBackButton />

			<ScrollView
				contentContainerStyle={[styles.scroll, { paddingBottom: s.xl * 2 }]}
				showsVerticalScrollIndicator={false}
			>
				{/* Hero card */}
				<View
					style={[
						styles.heroCard,
						{
							backgroundColor: storeEnabled ? c.primary : c.surface,
							borderRadius: r.lg,
						},
					]}
				>
					<View style={styles.heroTop}>
						<View style={styles.heroTitleRow}>
							<Globe
								size={20}
								color={storeEnabled ? '#fff' : c.onSurfaceVariant}
								strokeWidth={2}
							/>
							<ThemedText
								variant="h2"
								style={[
									styles.heroTitle,
									{ color: storeEnabled ? '#fff' : c.onSurface },
								]}
							>
								{storeEnabled ? 'Your Store is Live' : 'Store is Offline'}
							</ThemedText>
							<Badge
								label={storeEnabled ? 'LIVE' : 'OFF'}
								variant={storeEnabled ? 'success' : 'neutral'}
								size="sm"
							/>
						</View>
						<Switch
							value={storeEnabled}
							onValueChange={setStoreEnabled}
							thumbColor={storeEnabled ? '#fff' : c.onSurfaceVariant}
							trackColor={{ false: c.border, true: 'rgba(255,255,255,0.4)' }}
							accessibilityLabel="Toggle store online status"
						/>
					</View>

					<View
						style={[
							styles.urlRow,
							{
								backgroundColor: storeEnabled
									? 'rgba(255,255,255,0.18)'
									: c.surfaceVariant,
								borderRadius: r.sm,
							},
						]}
					>
						<ThemedText
							variant="caption"
							style={[
								styles.urlText,
								{ color: storeEnabled ? '#fff' : c.onSurfaceVariant },
							]}
							numberOfLines={1}
						>
							{STORE_URL}
						</ThemedText>
						<TouchableOpacity
							onPress={handleCopyUrl}
							accessibilityLabel="Copy store URL"
							hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
						>
							<Copy size={16} color={storeEnabled ? '#fff' : c.onSurfaceVariant} />
						</TouchableOpacity>
					</View>
				</View>

				{/* Stats row */}
				<View style={styles.statsRow}>
					<StatCard
						label="Total Products"
						value={0}
						icon={<Package size={20} color={c.primary} />}
					/>
					<StatCard
						label="Orders Today"
						value={0}
						icon={<ShoppingCart size={20} color={c.primary} />}
					/>
					<StatCard
						label="Pending Orders"
						value={0}
						icon={<Clock size={20} color={c.warning} />}
					/>
				</View>

				{/* Management actions */}
				<ThemedText variant="caption" style={[styles.sectionLabel, { color: c.primary }]}>
					MANAGE
				</ThemedText>
				<View style={[styles.card, { backgroundColor: c.surface, borderRadius: r.md }]}>
					<RowItem
						label="Manage Products"
						sub="Add, edit or remove store products"
						icon={<Package size={18} color={c.primary} />}
						onPress={handleComingSoon}
					/>
					<RowItem
						label="View Orders"
						sub="Track and fulfil customer orders"
						icon={<ShoppingCart size={18} color={c.primary} />}
						onPress={handleComingSoon}
						isLast
					/>
				</View>

				{/* Customisation actions */}
				<ThemedText variant="caption" style={[styles.sectionLabel, { color: c.primary }]}>
					CUSTOMISE
				</ThemedText>
				<View style={[styles.card, { backgroundColor: c.surface, borderRadius: r.md }]}>
					<RowItem
						label="Store Settings"
						sub="Business name, logo, payment modes"
						icon={<Settings size={18} color={c.primary} />}
						onPress={handleComingSoon}
					/>
					<RowItem
						label="Customize Theme"
						sub="Colours, fonts, banner image"
						icon={<Palette size={18} color={c.primary} />}
						onPress={handleComingSoon}
						isLast
					/>
				</View>

				{/* Share button */}
				<Button
					title="Share Store Link"
					onPress={handleShareStore}
					leftIcon={<Share2 size={16} color="#fff" />}
					style={styles.shareBtn}
				/>

				{/* Promo banner */}
				<View
					style={[
						styles.banner,
						{
							backgroundColor: c.infoLight ?? 'rgba(59,130,246,0.12)',
							borderRadius: r.md,
							borderLeftColor: c.info ?? c.primary,
						},
					]}
				>
					<Zap size={16} color={c.info ?? c.primary} style={{ marginRight: s.sm }} />
					<ThemedText
						variant="caption"
						style={[styles.bannerText, { color: c.onSurface }]}
					>
						Accept orders 24/7 from your own online store — no commission!
					</ThemedText>
				</View>
			</ScrollView>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	scroll: {
		paddingHorizontal: 16,
		paddingTop: 16,
		gap: 12,
	},
	/* Hero */
	heroCard: {
		padding: 16,
		gap: 12,
	},
	heroTop: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	heroTitleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		flex: 1,
	},
	heroTitle: {
		flexShrink: 1,
	},
	urlRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
		paddingVertical: 8,
		gap: 8,
	},
	urlText: {
		flex: 1,
		fontFamily: 'monospace',
	},
	/* Stats */
	statsRow: {
		flexDirection: 'row',
		gap: 8,
	},
	statCard: {
		flex: 1,
		alignItems: 'center',
		padding: 12,
		gap: 4,
	},
	statIcon: {
		marginBottom: 2,
	},
	/* Section label */
	sectionLabel: {
		marginTop: 4,
		marginBottom: 2,
		marginLeft: 4,
		letterSpacing: 0.8,
	},
	/* Card + rows */
	card: {
		overflow: 'hidden',
	},
	rowItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingVertical: 13,
		gap: 12,
	},
	rowIconWrap: {
		width: 34,
		height: 34,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	rowText: {
		flex: 1,
		gap: 1,
	},
	/* Share button */
	shareBtn: {
		marginTop: 4,
	},
	/* Banner */
	banner: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderLeftWidth: 3,
		marginTop: 4,
	},
	bannerText: {
		flex: 1,
		lineHeight: 18,
	},
});
