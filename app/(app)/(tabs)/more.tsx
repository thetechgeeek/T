import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import {
	Users,
	Truck,
	BarChart2,
	Settings,
	ChevronRight,
	Package,
	Languages,
	Moon,
	Sun,
} from 'lucide-react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useAuthStore } from '@/src/stores/authStore';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';

export default function MoreTab() {
	const { theme, c, s } = useThemeTokens();
	const { t, currentLanguage, toggleLanguage } = useLocale();
	const { isDark, toggleTheme } = useTheme();
	const { logout } = useAuthStore();
	const router = useRouter();

	const menuItems = [
		{
			label: t('customer.title'),
			accessibilityLabel: 'menu-customers',
			icon: Users,
			route: '/(app)/customers/',
			color: c.info,
		},
		{
			label: t('supplier.title'),
			accessibilityLabel: 'menu-suppliers',
			icon: Truck,
			route: '/(app)/suppliers/',
			color: c.success,
		},
		{
			label: t('order.title'),
			accessibilityLabel: 'menu-orders',
			icon: Package,
			route: '/(app)/orders/',
			color: c.warning,
		},
		{
			label: t('finance.title'),
			accessibilityLabel: 'menu-finance',
			icon: BarChart2,
			route: '/(app)/finance/',
			color: c.primary,
		},
		{
			label: t('settings.title'),
			accessibilityLabel: 'menu-settings',
			icon: Settings,
			route: '/(app)/settings/',
			color: c.onSurfaceVariant,
		},
	];

	return (
		<AtomicScreen safeAreaEdges={['top', 'bottom']} scrollable>
			<View
				style={[
					styles.header,
					{
						borderBottomColor: c.border,
						borderBottomWidth: StyleSheet.hairlineWidth,
						paddingHorizontal: s.lg,
						paddingBottom: s.md,
					},
				]}
			>
				<ThemedText variant="h1" accessibilityLabel="more-screen">
					More
				</ThemedText>
			</View>
			<View style={{ padding: s.lg }}>
				{menuItems.map((item, i) => (
					<TouchableOpacity
						key={i}
						style={[
							styles.menuItem,
							{
								backgroundColor: c.card,
								borderRadius: theme.borderRadius.md,
								marginBottom: s.sm,
								...(theme.shadows.sm as object),
							},
						]}
						onPress={() => router.push(item.route as Href)}
						activeOpacity={0.8}
						accessibilityRole="button"
						accessibilityLabel={item.accessibilityLabel}
						accessibilityHint={`Open ${item.label}`}
					>
						<View
							style={[
								styles.iconWrap,
								{ backgroundColor: item.color + '20', borderRadius: 10 },
							]}
						>
							<item.icon size={22} color={item.color} strokeWidth={2} />
						</View>
						<ThemedText
							weight="medium"
							style={[styles.menuLabel, { fontSize: theme.typography.sizes.md }]}
						>
							{item.label}
						</ThemedText>
						<ChevronRight size={18} color={c.placeholder} strokeWidth={2} />
					</TouchableOpacity>
				))}

				<TouchableOpacity
					style={[
						styles.menuItem,
						{
							backgroundColor: c.card,
							borderRadius: theme.borderRadius.md,
							marginBottom: s.sm,
							marginTop: s.sm,
							...(theme.shadows.sm as object),
						},
					]}
					onPress={toggleLanguage}
					activeOpacity={0.8}
					accessibilityRole="button"
					accessibilityLabel="language-toggle"
					accessibilityHint={
						currentLanguage === 'en'
							? 'Switch app language to Hindi'
							: 'Switch app language to English'
					}
				>
					<View
						style={[
							styles.iconWrap,
							{ backgroundColor: c.primary + '20', borderRadius: 10 },
						]}
					>
						<Languages size={22} color={c.primary} strokeWidth={2} />
					</View>
					<ThemedText
						weight="medium"
						style={[styles.menuLabel, { fontSize: theme.typography.sizes.md }]}
					>
						{currentLanguage === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}
					</ThemedText>
					<ChevronRight size={18} color={c.placeholder} strokeWidth={2} />
				</TouchableOpacity>

				<TouchableOpacity
					style={[
						styles.menuItem,
						{
							backgroundColor: c.card,
							borderRadius: theme.borderRadius.md,
							marginBottom: s.sm,
							...(theme.shadows.sm as object),
						},
					]}
					onPress={toggleTheme}
					activeOpacity={0.8}
					accessibilityRole="switch"
					accessibilityLabel="dark-mode-toggle"
					accessibilityState={{ checked: isDark }}
					accessibilityHint={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
				>
					<View
						style={[
							styles.iconWrap,
							{ backgroundColor: c.onSurfaceVariant + '20', borderRadius: 10 },
						]}
					>
						{isDark ? (
							<Sun size={22} color={c.onSurfaceVariant} strokeWidth={2} />
						) : (
							<Moon size={22} color={c.onSurfaceVariant} strokeWidth={2} />
						)}
					</View>
					<ThemedText
						weight="medium"
						style={[styles.menuLabel, { fontSize: theme.typography.sizes.md }]}
					>
						{isDark ? 'Light Mode' : 'Dark Mode'}
					</ThemedText>
					<ChevronRight size={18} color={c.placeholder} strokeWidth={2} />
				</TouchableOpacity>

				<TouchableOpacity
					style={[
						styles.menuItem,
						{
							backgroundColor: c.errorLight,
							borderRadius: theme.borderRadius.md,
							marginTop: s.lg,
						},
					]}
					onPress={logout}
					accessibilityRole="button"
					accessibilityLabel="sign-out-button"
					accessibilityHint="Logs you out of TileMaster"
				>
					<ThemedText
						color={c.error}
						weight="medium"
						align="center"
						style={{ flex: 1, fontSize: theme.typography.sizes.md }}
					>
						{t('auth.signOut')}
					</ThemedText>
				</TouchableOpacity>
			</View>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	header: { paddingVertical: 12 },
	menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14 },
	iconWrap: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	menuLabel: { flex: 1 },
});
