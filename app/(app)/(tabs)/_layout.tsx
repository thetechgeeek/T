import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Home, Package, QrCode, FileText, MoreHorizontal } from 'lucide-react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import type { ErrorBoundaryProps } from 'expo-router';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import {
	FAB_OFFSET_BOTTOM,
	OPACITY_GLOW,
	OPACITY_TINT_SOFT,
	RADIUS_FAB,
	SIZE_FAB,
	SIZE_TAB_BAR_IOS,
} from '@/theme/uiMetrics';
import { BORDER_RADIUS_PX, SPACING_PX } from '@/src/theme/layoutMetrics';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
	const { t } = useLocale();
	return (
		<View style={styles.errorContainer}>
			<ThemedText variant="h2" style={{ marginBottom: SPACING_PX.sm }}>
				{t('common.error')}
			</ThemedText>
			<ThemedText
				align="center"
				style={{ marginBottom: SPACING_PX.xl, paddingHorizontal: SPACING_PX.xl }}
			>
				{error.message}
			</ThemedText>
			<Button title={t('common.retry')} onPress={retry} />
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
							shadowOpacity: OPACITY_GLOW,
							shadowRadius: SPACING_PX.sm,
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
					height: Platform.OS === 'ios' ? SIZE_TAB_BAR_IOS : SPACING_PX['4xl'],
					paddingBottom:
						Platform.OS === 'ios' ? SPACING_PX.lg + SPACING_PX.md : SPACING_PX.sm,
					paddingTop: SPACING_PX.sm,
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
		width: SIZE_FAB,
		height: SIZE_FAB,
		marginBottom: FAB_OFFSET_BOTTOM,
	},
	scanIconGlow: {
		position: 'absolute',
		width: SPACING_PX['4xl'],
		height: SPACING_PX['4xl'],
		borderRadius: BORDER_RADIUS_PX.full,
		opacity: OPACITY_TINT_SOFT,
	},
	scanIconOuter: {
		width: SIZE_FAB,
		height: SIZE_FAB,
		borderRadius: RADIUS_FAB,
		alignItems: 'center',
		justifyContent: 'center',
	},
	errorContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: SPACING_PX.xl,
	},
});
