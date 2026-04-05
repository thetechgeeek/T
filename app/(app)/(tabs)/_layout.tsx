import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Home, Package, QrCode, FileText, MoreHorizontal } from 'lucide-react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import type { ErrorBoundaryProps } from 'expo-router';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
	return (
		<View style={styles.errorContainer}>
			<Text style={styles.errorTitle}>Something went wrong</Text>
			<Text style={styles.errorMessage}>{error.message}</Text>
			<TouchableOpacity onPress={retry} style={styles.retryButton}>
				<Text style={styles.retryText}>Try Again</Text>
			</TouchableOpacity>
		</View>
	);
}

function ScanTabIcon({ _focused }: { _focused: boolean }) {
	const { theme, c } = useThemeTokens();
	return (
		<View style={styles.scanIconWrap}>
			{_focused && (
				<View
					style={[
						styles.scanIconGlow,
						{
							backgroundColor: c.primary,
							shadowColor: c.primary,
							shadowOpacity: 0.4,
							shadowRadius: 8,
							shadowOffset: { width: 0, height: 0 },
						},
					]}
				/>
			)}
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
		</View>
	);
}

export default function TabLayout() {
	const { theme, c } = useThemeTokens();
	const { t } = useLocale();
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
					tabBarAccessibilityLabel: 'tab-dashboard',
					tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={2} />,
				}}
			/>
			<Tabs.Screen
				name="inventory"
				options={{
					title: t('inventory.title'),
					tabBarAccessibilityLabel: 'tab-inventory',
					tabBarIcon: ({ color }) => <Package size={22} color={color} strokeWidth={2} />,
				}}
			/>
			<Tabs.Screen
				name="scan"
				options={{
					title: t('scanner.title'),
					tabBarAccessibilityLabel: 'tab-scan',
					tabBarIcon: ({ focused }) => <ScanTabIcon _focused={focused} />,
					tabBarLabel: () => null,
				}}
			/>
			<Tabs.Screen
				name="invoices"
				options={{
					title: t('invoice.title'),
					tabBarAccessibilityLabel: 'tab-invoices',
					tabBarIcon: ({ color }) => <FileText size={22} color={color} strokeWidth={2} />,
				}}
			/>
			<Tabs.Screen
				name="customers"
				options={{
					href: null,
				}}
			/>
			<Tabs.Screen
				name="more"
				options={{
					title: t('tabs.more'),
					tabBarAccessibilityLabel: 'tab-more',
					tabBarIcon: ({ color }) => (
						<MoreHorizontal size={22} color={color} strokeWidth={2} />
					),
				}}
			/>
		</Tabs>
	);
}

const styles = StyleSheet.create({
	scanIconWrap: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 56,
		height: 56,
		marginBottom: 20,
	},
	scanIconGlow: {
		position: 'absolute',
		width: 64,
		height: 64,
		borderRadius: 32,
		opacity: 0.25,
	},
	scanIconOuter: {
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
	},
	errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
	errorTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
	errorMessage: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
	retryButton: {
		backgroundColor: '#2563EB',
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	retryText: { color: '#fff', fontWeight: '600' },
});
