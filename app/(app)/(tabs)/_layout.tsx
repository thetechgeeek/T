import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Home, Package, QrCode, FileText, MoreHorizontal } from 'lucide-react-native';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { useLocale } from '@/src/hooks/useLocale';
import type { ErrorBoundaryProps } from 'expo-router';
import { ThemedText } from '@easydesign/design-system';
import { Button } from '@easydesign/design-system';
import { SIZE_TAB_BAR_IOS } from '@easydesign/design-system/foundation';
import { SPACING_PX } from '@easydesign/design-system/foundation';

const TAB_LABEL_LETTER_SPACING = 0.2;

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

export default function TabLayout() {
	const { theme, c } = useThemeTokens();
	const { t } = useLocale();
	const typo = theme.typography;

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarHideOnKeyboard: true,
				tabBarStyle: {
					backgroundColor: c.surface,
					borderTopColor: c.separator,
					borderTopWidth: StyleSheet.hairlineWidth,
					height: Platform.OS === 'ios' ? SIZE_TAB_BAR_IOS : 72,
					paddingBottom:
						Platform.OS === 'ios' ? SPACING_PX.lg + SPACING_PX.xs : SPACING_PX.sm,
					paddingTop: SPACING_PX.sm,
					paddingHorizontal: SPACING_PX.xs,
				},
				tabBarItemStyle: {
					paddingTop: SPACING_PX.xxs,
				},
				tabBarActiveTintColor: c.tabActive,
				tabBarInactiveTintColor: c.tabInactive,
				tabBarLabelStyle: {
					fontSize: typo.sizes.xs,
					fontWeight: '500',
					letterSpacing: TAB_LABEL_LETTER_SPACING,
				},
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
					tabBarIcon: ({ color }) => <QrCode size={22} color={color} strokeWidth={2} />,
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
	errorContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: SPACING_PX.xl,
	},
});
