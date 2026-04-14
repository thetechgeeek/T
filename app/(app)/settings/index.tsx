import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SectionHeader } from '@/src/components/molecules/SectionHeader';
import { SettingsCard } from '@/src/components/molecules/SettingsCard';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

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
				label: 'Item Categories',
				sub: 'Manage product categories, colors',
				route: '/(app)/settings/item-categories',
			},
			{
				label: 'Item Units',
				sub: 'Manage measurement units (Box, Kg, etc.)',
				route: '/(app)/settings/item-units',
			},
			{
				label: 'Item Settings',
				sub: 'Tax, barcode, general defaults',
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
		<Screen
			safeAreaEdges={['bottom']}
			withKeyboard={false}
			scrollable
			header={<ScreenHeader title="Settings" showBackButton={false} />}
			contentContainerStyle={{ paddingBottom: SPACING_PX['2xl'] }}
		>
			{SECTIONS.map((section) => (
				<React.Fragment key={section.title}>
					<SectionHeader
						title={section.title}
						variant="uppercase"
						titleColor={c.primary}
					/>
					<SettingsCard
						padding="none"
						style={{
							marginHorizontal: SPACING_PX.lg,
							overflow: 'hidden',
							backgroundColor: c.surface,
							borderWidth: 0,
						}}
					>
						{section.rows.map((row, idx) => (
							<Pressable
								key={row.route}
								onPress={() => router.push(row.route as Href)}
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
								<ThemedText variant="h2" color={c.onSurfaceVariant}>
									›
								</ThemedText>
							</Pressable>
						))}
					</SettingsCard>
				</React.Fragment>
			))}
		</Screen>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: SPACING_PX.md,
		paddingHorizontal: SPACING_PX.lg,
	},
});
