import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Home, Package, QrCode, FileText, MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/hooks/useLocale';

function ScanTabIcon({ focused }: { focused: boolean }) {
	const { theme } = useTheme();
	return (
		<View
			style={[
				styles.scanIconOuter,
				{
					backgroundColor: theme.colors.primary,
					...(theme.shadows.md as object),
				},
			]}
		>
			<QrCode size={26} color={theme.colors.onPrimary} strokeWidth={2} />
		</View>
	);
}

export default function TabLayout() {
	const { theme } = useTheme();
	const { t } = useLocale();
	const c = theme.colors;
	const typo = theme.typography;

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: c.tabBar,
					borderTopColor: c.border,
					borderTopWidth: StyleSheet.hairlineWidth,
					height: Platform.OS === 'ios' ? 88 : 64,
					paddingBottom: Platform.OS === 'ios' ? 28 : 8,
					paddingTop: 8,
				},
				tabBarActiveTintColor: c.tabActive,
				tabBarInactiveTintColor: c.tabInactive,
				tabBarLabelStyle: { fontSize: typo.sizes.xs, fontWeight: '500' },
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: t('dashboard.greeting'),
					tabBarIcon: ({ color, size }) => (
						<Home size={22} color={color} strokeWidth={2} />
					),
				}}
			/>
			<Tabs.Screen
				name="inventory"
				options={{
					title: t('inventory.title'),
					tabBarIcon: ({ color }) => <Package size={22} color={color} strokeWidth={2} />,
				}}
			/>
			<Tabs.Screen
				name="scan"
				options={{
					title: t('scanner.title'),
					tabBarIcon: ({ focused }) => <ScanTabIcon focused={focused} />,
					tabBarLabel: () => null,
				}}
			/>
			<Tabs.Screen
				name="invoices"
				options={{
					title: t('invoice.title'),
					tabBarIcon: ({ color }) => <FileText size={22} color={color} strokeWidth={2} />,
				}}
			/>
			<Tabs.Screen
				name="more"
				options={{
					title: t('tabs.more'),
					tabBarIcon: ({ color }) => (
						<MoreHorizontal size={22} color={color} strokeWidth={2} />
					),
				}}
			/>
		</Tabs>
	);
}

const styles = StyleSheet.create({
	scanIconOuter: {
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
});
