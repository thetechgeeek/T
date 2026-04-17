import {
	BORDER_WIDTH_BASE,
	RADIUS_MODAL_SHEET,
	FLEX_AMT_WIDE,
	OVERLAY_COLOR_STRONG,
	OPACITY_TINT_LIGHT,
	SIZE_AVATAR_MD,
} from '@/theme/uiMetrics';
import React, { useState } from 'react';
import { View, Switch, StyleSheet, Pressable, TextInput, Modal, Alert } from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/design-system/components/atoms/Screen';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { ScreenHeader } from '@/app/components/molecules/ScreenHeader';
import { SectionHeader } from '@/src/design-system/components/molecules/SectionHeader';
import { SettingsCard } from '@/src/design-system/components/molecules/SettingsCard';
import { withOpacity } from '@/src/utils/color';
import { BORDER_RADIUS_PX, SPACING_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

type Role = 'salesperson' | 'admin';

const ROLE_INFO: Record<Role, string> = {
	salesperson:
		'Can create invoices and view sales data. Cannot access settings, expenses, or reports.',
	admin: 'Full access except billing and owner-level settings.',
};

export default function UsersScreen() {
	const { c, typo } = useThemeTokens();

	const [trackByUser, setTrackByUser] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [invitePhone, setInvitePhone] = useState('');
	const [inviteRole, setInviteRole] = useState<Role>('salesperson');

	const handleSendInvite = () => {
		Alert.alert('Coming Soon', 'Invite feature coming soon');
		setModalVisible(false);
		setInvitePhone('');
	};

	return (
		<Screen
			safeAreaEdges={['bottom']}
			withKeyboard={false}
			scrollable
			header={<ScreenHeader title="User Management" />}
			contentContainerStyle={{ paddingBottom: SPACING_PX['2xl'] }}
		>
			{/* Current user card */}
			<SettingsCard
				style={[styles.userCard, { backgroundColor: c.surface, borderColor: c.border }]}
				padding="md"
			>
				<View style={[styles.avatar, { backgroundColor: c.primary }]}>
					<ThemedText
						style={{
							color: c.white,
							fontWeight: '700',
							fontSize: typo.variants.h2.fontSize,
						}}
					>
						B
					</ThemedText>
				</View>
				<View style={{ flex: 1, marginLeft: SPACING_PX.md }}>
					<ThemedText variant="body" weight="bold">
						Business Owner
					</ThemedText>
					<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
						Current account
					</ThemedText>
				</View>
				<View style={[styles.badge, { backgroundColor: c.successLight }]}>
					<ThemedText variant="caption" style={{ color: c.paid, fontWeight: '700' }}>
						Owner
					</ThemedText>
				</View>
			</SettingsCard>

			{/* Users section */}
			<SectionHeader title="Users" variant="uppercase" titleColor={c.primary} />
			<SettingsCard
				style={[styles.emptyState, { backgroundColor: c.surface, borderColor: c.border }]}
				padding="lg"
			>
				<ThemedText
					variant="body"
					style={{ color: c.onSurfaceVariant, textAlign: 'center' }}
				>
					No additional users.{'\n'}Invite staff to help manage the business.
				</ThemedText>
			</SettingsCard>

			<Pressable
				onPress={() => setModalVisible(true)}
				style={[styles.inviteBtn, { backgroundColor: c.primary }]}
			>
				<ThemedText variant="body" style={{ color: c.white, fontWeight: '700' }}>
					+ Invite User
				</ThemedText>
			</Pressable>

			{/* Track sales switch */}
			<SettingsCard
				style={[styles.switchCard, { backgroundColor: c.surface, borderColor: c.border }]}
				padding="md"
			>
				<ThemedText variant="body" style={{ flex: 1 }}>
					Track Sales by User
				</ThemedText>
				<Switch
					trackColor={{ true: c.primary, false: c.border }}
					value={trackByUser}
					onValueChange={setTrackByUser}
				/>
			</SettingsCard>

			{/* Invite Modal */}
			<Modal
				visible={modalVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={[styles.modalContent, { backgroundColor: c.surface }]}>
						<ThemedText variant="h2" style={{ marginBottom: SPACING_PX.lg }}>
							Invite User
						</ThemedText>

						<ThemedText
							variant="caption"
							style={{ color: c.onSurfaceVariant, marginBottom: SPACING_PX.xs }}
						>
							Role
						</ThemedText>
						<View
							style={{
								flexDirection: 'row',
								gap: SPACING_PX.md,
								marginBottom: SPACING_PX.lg,
							}}
						>
							{(['salesperson', 'admin'] as Role[]).map((r) => (
								<Pressable
									key={r}
									onPress={() => setInviteRole(r)}
									style={[
										styles.roleChip,
										inviteRole === r
											? { backgroundColor: c.primary, borderColor: c.primary }
											: {
													backgroundColor: c.background,
													borderColor: c.border,
												},
									]}
								>
									<ThemedText
										variant="body"
										weight="semibold"
										style={{
											color: inviteRole === r ? c.onPrimary : c.onSurface,
											textTransform: 'capitalize',
										}}
									>
										{r === 'salesperson' ? 'Salesperson' : 'Admin'}
									</ThemedText>
								</Pressable>
							))}
						</View>

						<View
							style={[
								styles.roleDesc,
								{
									backgroundColor: withOpacity(c.primary, OPACITY_TINT_LIGHT),
									borderColor: c.primary,
								},
							]}
						>
							<ThemedText variant="caption" style={{ color: c.onSurface }}>
								{ROLE_INFO[inviteRole]}
							</ThemedText>
						</View>

						<ThemedText
							variant="caption"
							style={{
								color: c.onSurfaceVariant,
								marginBottom: SPACING_PX.xs,
								marginTop: SPACING_PX.lg,
							}}
						>
							Phone Number
						</ThemedText>
						<TextInput
							value={invitePhone}
							onChangeText={setInvitePhone}
							placeholder="+91 98765 43210"
							placeholderTextColor={c.placeholder}
							keyboardType="phone-pad"
							style={[
								styles.textInput,
								{ borderColor: c.border, color: c.onSurface },
							]}
						/>

						<View
							style={{
								flexDirection: 'row',
								gap: SPACING_PX.md,
								marginTop: SPACING_PX.xl,
							}}
						>
							<Pressable
								onPress={() => setModalVisible(false)}
								style={[
									styles.btn,
									{
										backgroundColor: c.background,
										borderColor: c.border,
										borderWidth: BORDER_WIDTH_BASE,
									},
								]}
							>
								<ThemedText
									variant="body"
									style={{ color: c.onSurface, fontWeight: '600' }}
								>
									Cancel
								</ThemedText>
							</Pressable>
							<Pressable
								onPress={handleSendInvite}
								style={[
									styles.btn,
									{ backgroundColor: c.primary, flex: FLEX_AMT_WIDE },
								]}
							>
								<ThemedText
									variant="body"
									style={{ color: c.white, fontWeight: '700' }}
								>
									Send Invite
								</ThemedText>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</Screen>
	);
}

const styles = StyleSheet.create({
	userCard: {
		marginHorizontal: SPACING_PX.lg,
		marginTop: SPACING_PX.xl,
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatar: {
		width: SIZE_AVATAR_MD,
		height: SIZE_AVATAR_MD,
		borderRadius: SIZE_AVATAR_MD / 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	badge: {
		paddingHorizontal: SPACING_PX.sm,
		paddingVertical: SPACING_PX.xs,
		borderRadius: BORDER_RADIUS_PX.lg,
	},
	emptyState: {
		marginHorizontal: SPACING_PX.lg,
		alignItems: 'center',
	},
	inviteBtn: {
		marginHorizontal: SPACING_PX.lg,
		marginTop: SPACING_PX.md,
		borderRadius: BORDER_RADIUS_PX.lg,
		padding: SPACING_PX.md,
		alignItems: 'center',
	},
	switchCard: {
		marginHorizontal: SPACING_PX.lg,
		marginTop: SPACING_PX.xl,
		flexDirection: 'row',
		alignItems: 'center',
	},
	modalOverlay: { flex: 1, backgroundColor: OVERLAY_COLOR_STRONG, justifyContent: 'flex-end' },
	modalContent: {
		borderTopLeftRadius: RADIUS_MODAL_SHEET,
		borderTopRightRadius: RADIUS_MODAL_SHEET,
		padding: SPACING_PX.xl,
		paddingBottom: SPACING_PX['2xl'],
	},
	roleChip: {
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.sm,
		borderRadius: BORDER_RADIUS_PX.full,
		borderWidth: BORDER_WIDTH_BASE,
	},
	roleDesc: {
		borderRadius: BORDER_RADIUS_PX.md,
		borderWidth: BORDER_WIDTH_BASE,
		padding: SPACING_PX.md,
	},
	textInput: {
		borderWidth: BORDER_WIDTH_BASE,
		borderRadius: BORDER_RADIUS_PX.md,
		paddingHorizontal: SPACING_PX.md,
		paddingVertical: SPACING_PX.sm,
		fontSize: FONT_SIZE.body,
	},
	btn: {
		flex: 1,
		paddingVertical: SPACING_PX.md,
		borderRadius: BORDER_RADIUS_PX.lg,
		alignItems: 'center',
	},
});
