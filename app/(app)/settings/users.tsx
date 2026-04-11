import React, { useState } from 'react';
import {
	View,
	Switch,
	ScrollView,
	StyleSheet,
	Pressable,
	TextInput,
	Modal,
	Alert,
} from 'react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';

type Role = 'salesperson' | 'admin';

const ROLE_INFO: Record<Role, string> = {
	salesperson:
		'Can create invoices and view sales data. Cannot access settings, expenses, or reports.',
	admin: 'Full access except billing and owner-level settings.',
};

export default function UsersScreen() {
	const { c } = useThemeTokens();

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
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="User Management" />
			<ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
				{/* Current user card */}
				<View
					style={[styles.userCard, { backgroundColor: c.surface, borderColor: c.border }]}
				>
					<View style={[styles.avatar, { backgroundColor: c.primary }]}>
						<ThemedText style={{ color: '#fff', fontWeight: '700', fontSize: 20 }}>
							B
						</ThemedText>
					</View>
					<View style={{ flex: 1, marginLeft: 14 }}>
						<ThemedText variant="body" style={{ fontWeight: '700' }}>
							Business Owner
						</ThemedText>
						<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
							Current account
						</ThemedText>
					</View>
					<View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
						<ThemedText
							variant="caption"
							style={{ color: '#065F46', fontWeight: '700' }}
						>
							Owner
						</ThemedText>
					</View>
				</View>

				{/* Users section */}
				<ThemedText
					variant="caption"
					style={{
						color: c.primary,
						marginTop: 24,
						marginBottom: 4,
						marginHorizontal: 16,
						fontWeight: '600',
						textTransform: 'uppercase',
						letterSpacing: 0.8,
					}}
				>
					Users
				</ThemedText>
				<View
					style={[
						styles.emptyState,
						{ backgroundColor: c.surface, borderColor: c.border },
					]}
				>
					<ThemedText
						variant="body"
						style={{ color: c.onSurfaceVariant, textAlign: 'center' }}
					>
						No additional users.{'\n'}Invite staff to help manage the business.
					</ThemedText>
				</View>

				<Pressable
					onPress={() => setModalVisible(true)}
					style={[styles.inviteBtn, { backgroundColor: c.primary }]}
				>
					<ThemedText style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
						+ Invite User
					</ThemedText>
				</Pressable>

				{/* Track sales switch */}
				<View
					style={[
						styles.switchCard,
						{ backgroundColor: c.surface, borderColor: c.border },
					]}
				>
					<ThemedText variant="body" style={{ flex: 1 }}>
						Track Sales by User
					</ThemedText>
					<Switch
						trackColor={{ true: c.primary, false: c.border }}
						value={trackByUser}
						onValueChange={setTrackByUser}
					/>
				</View>
			</ScrollView>

			{/* Invite Modal */}
			<Modal
				visible={modalVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={[styles.modalContent, { backgroundColor: c.surface }]}>
						<ThemedText variant="h2" style={{ marginBottom: 16 }}>
							Invite User
						</ThemedText>

						<ThemedText
							variant="caption"
							style={{ color: c.onSurfaceVariant, marginBottom: 6 }}
						>
							Role
						</ThemedText>
						<View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
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
										style={{
											color: inviteRole === r ? '#fff' : c.onSurface,
											fontWeight: '600',
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
								{ backgroundColor: `${c.primary}10`, borderColor: c.primary },
							]}
						>
							<ThemedText variant="caption" style={{ color: c.onSurface }}>
								{ROLE_INFO[inviteRole]}
							</ThemedText>
						</View>

						<ThemedText
							variant="caption"
							style={{ color: c.onSurfaceVariant, marginBottom: 6, marginTop: 16 }}
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

						<View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
							<Pressable
								onPress={() => setModalVisible(false)}
								style={[
									styles.btn,
									{
										backgroundColor: c.background,
										borderColor: c.border,
										borderWidth: 1,
									},
								]}
							>
								<ThemedText style={{ color: c.onSurface, fontWeight: '600' }}>
									Cancel
								</ThemedText>
							</Pressable>
							<Pressable
								onPress={handleSendInvite}
								style={[styles.btn, { backgroundColor: c.primary, flex: 1.5 }]}
							>
								<ThemedText style={{ color: '#fff', fontWeight: '700' }}>
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
		marginHorizontal: 16,
		marginTop: 20,
		borderRadius: 12,
		borderWidth: 1,
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
	emptyState: {
		marginHorizontal: 16,
		borderRadius: 10,
		borderWidth: 1,
		padding: 24,
		alignItems: 'center',
	},
	inviteBtn: {
		marginHorizontal: 16,
		marginTop: 14,
		borderRadius: 10,
		padding: 14,
		alignItems: 'center',
	},
	switchCard: {
		marginHorizontal: 16,
		marginTop: 20,
		borderRadius: 10,
		borderWidth: 1,
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
	},
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
	modalContent: {
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 24,
		paddingBottom: 40,
	},
	roleChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
	roleDesc: { borderRadius: 8, borderWidth: 1, padding: 12 },
	textInput: {
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 15,
	},
	btn: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
});
