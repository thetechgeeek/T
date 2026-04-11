import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';

interface NavRow {
	label: string;
	sub?: string;
	route: string;
}

interface Section {
	title: string;
	rows: NavRow[];
}

const SECTIONS: Section[] = [
	{
		title: 'Business',
		rows: [
			{
				label: 'Business Profile',
				sub: 'Name, address, logo',
				route: '/(app)/settings/business-profile',
			},
			{
				label: 'GST Settings',
				sub: 'GSTIN, filing period, composite scheme',
				route: '/(app)/settings/gst',
			},
			{
				label: 'Manage Businesses',
				sub: 'Switch or add firms',
				route: '/(app)/settings/firms',
			},
		],
	},
	{
		title: 'Transactions',
		rows: [
			{
				label: 'Transaction Settings',
				sub: 'Invoice number, defaults, fields',
				route: '/(app)/settings/transactions',
			},
			{
				label: 'Print Settings',
				sub: 'Paper type, theme, header, footer',
				route: '/(app)/settings/print',
			},
			{
				label: 'Payment Reminders',
				sub: 'Auto-reminders via WhatsApp/SMS',
				route: '/(app)/settings/reminders',
			},
		],
	},
	{
		title: 'Catalogue',
		rows: [
			{
				label: 'Party Settings',
				sub: 'GSTIN, grouping, additional fields',
				route: '/(app)/settings/party',
			},
			{
				label: 'Item Settings',
				sub: 'Stock, categories, tax, barcode',
				route: '/(app)/settings/items',
			},
		],
	},
	{
		title: 'App',
		rows: [
			{
				label: 'Preferences',
				sub: 'Language, theme, date format',
				route: '/(app)/settings/preferences',
			},
			{
				label: 'Security',
				sub: 'PIN, biometric, auto-lock',
				route: '/(app)/settings/security',
			},
			{
				label: 'Backup & Restore',
				sub: 'Google Drive, local backup',
				route: '/(app)/settings/backup',
			},
		],
	},
	{
		title: 'Team',
		rows: [
			{
				label: 'User Management',
				sub: 'Invite staff, track by user',
				route: '/(app)/settings/users',
			},
		],
	},
];

export default function SettingsScreen() {
	const { c } = useThemeTokens();
	const router = useRouter();

	return (
		<Screen safeAreaEdges={['bottom']}>
			<ScreenHeader title="Settings" showBackButton={false} />
			<ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
				{SECTIONS.map((section) => (
					<React.Fragment key={section.title}>
						<ThemedText
							variant="caption"
							style={[styles.sectionLabel, { color: c.primary }]}
						>
							{section.title.toUpperCase()}
						</ThemedText>
						<View style={[styles.card, { backgroundColor: c.surface }]}>
							{section.rows.map((row, idx) => (
								<Pressable
									key={row.route}
									onPress={() => router.push(row.route as any)}
									style={({ pressed }) => [
										styles.row,
										idx < section.rows.length - 1 && {
											borderBottomColor: c.border,
											borderBottomWidth: StyleSheet.hairlineWidth,
										},
										pressed && { backgroundColor: c.border },
									]}
								>
									<View style={{ flex: 1 }}>
										<ThemedText variant="body">{row.label}</ThemedText>
										{row.sub ? (
											<ThemedText
												variant="caption"
												style={{ color: c.onSurfaceVariant }}
											>
												{row.sub}
											</ThemedText>
										) : null}
									</View>
									<ThemedText style={{ color: c.onSurfaceVariant, fontSize: 20 }}>
										›
									</ThemedText>
								</Pressable>
							))}
						</View>
					</React.Fragment>
				))}
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	sectionLabel: {
		marginTop: 20,
		marginBottom: 4,
		marginHorizontal: 16,
		fontWeight: '600',
		letterSpacing: 0.8,
	},
	card: {
		marginHorizontal: 16,
		borderRadius: 10,
		overflow: 'hidden',
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 16,
	},
});
