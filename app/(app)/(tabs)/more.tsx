import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import {
	Truck,
	BarChart2,
	Settings,
	Package,
	Users,
	Languages,
	Moon,
	Sun,
	LogOut,
	ChevronRight,
} from 'lucide-react-native';
import { withOpacity } from '@/src/utils/color';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useAuthStore } from '@/src/stores/authStore';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Divider } from '@/src/components/atoms/Divider';

export default function MoreTab() {
	const { theme, c, s } = useThemeTokens();
	const { t, currentLanguage, toggleLanguage } = useLocale();
	const { isDark, toggleTheme } = useTheme();
	const { logout } = useAuthStore();

	const handleLogout = () => {
		Alert.alert(t('auth.signOut'), t('auth.signOutConfirm'), [
			{ text: t('common.cancel'), style: 'cancel' },
			{ text: t('auth.signOut'), style: 'destructive', onPress: logout },
		]);
	};
	const router = useRouter();

	const reportsItems = [
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
	];

	const settingsItems = [
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
				<ThemedText variant="h1" accessibilityLabel="more-screen-title">
					{t('common.more')}
				</ThemedText>
			</View>
			<View style={{ padding: s.lg }}>
				{/* REPORTS section */}
				<ThemedText variant="sectionLabel" style={{ marginBottom: s.sm, marginLeft: s.xs }}>
					{t('settings.sections.reports')}
				</ThemedText>
				{reportsItems.map((item) => (
					<TouchableOpacity
						key={item.route}
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
						accessibilityHint={t('settings.openHint', { label: item.label })}
					>
						<View
							style={[
								styles.iconWrap,
								{
									backgroundColor: withOpacity(item.color, 0.12),
									borderRadius: 10,
								},
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

				<Divider style={{ marginVertical: s.md }} />

				{/* SETTINGS section */}
				<ThemedText variant="sectionLabel" style={{ marginBottom: s.sm, marginLeft: s.xs }}>
					{t('settings.sections.settings')}
				</ThemedText>
				{settingsItems.map((item) => (
					<TouchableOpacity
						key={item.route}
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
						accessibilityHint={t('settings.openHint', { label: item.label })}
					>
						<View
							style={[
								styles.iconWrap,
								{
									backgroundColor: withOpacity(item.color, 0.12),
									borderRadius: 10,
								},
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

				<Divider style={{ marginVertical: s.md }} />

				{/* PREFERENCES section */}
				<ThemedText variant="sectionLabel" style={{ marginBottom: s.sm, marginLeft: s.xs }}>
					{t('settings.sections.preferences')}
				</ThemedText>

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
					onPress={toggleLanguage}
					activeOpacity={0.8}
					accessibilityRole="button"
					accessibilityLabel="language-toggle"
					accessibilityHint={t('settings.switchLanguageHint', {
						lang: currentLanguage === 'en' ? 'Hindi' : 'English',
					})}
				>
					<View
						style={[
							styles.iconWrap,
							{ backgroundColor: withOpacity(c.primary, 0.12), borderRadius: 10 },
						]}
					>
						<Languages size={22} color={c.primary} strokeWidth={2} />
					</View>
					<ThemedText
						weight="medium"
						style={[styles.menuLabel, { fontSize: theme.typography.sizes.md }]}
					>
						{t('settings.switchLanguage', {
							lang: currentLanguage === 'en' ? 'Hindi (हिंदी)' : 'English',
						})}
					</ThemedText>
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
					accessibilityHint={t('settings.switchThemeHint', {
						theme: isDark ? t('settings.light') : t('settings.dark'),
					})}
				>
					<View
						style={[
							styles.iconWrap,
							{
								backgroundColor: withOpacity(c.onSurfaceVariant, 0.12),
								borderRadius: 10,
							},
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
						{isDark ? t('settings.lightMode') : t('settings.darkMode')}
					</ThemedText>
				</TouchableOpacity>

				<Divider style={{ marginVertical: s.md }} />

				{/* ACCOUNT section */}
				<ThemedText variant="sectionLabel" style={{ marginBottom: s.sm, marginLeft: s.xs }}>
					{t('settings.sections.account')}
				</ThemedText>

				<TouchableOpacity
					style={[
						styles.menuItem,
						{
							backgroundColor: c.errorLight,
							borderRadius: theme.borderRadius.md,
						},
					]}
					onPress={handleLogout}
					accessibilityRole="button"
					accessibilityLabel={t('auth.signOut')}
					accessibilityHint={t('settings.signOutHint')}
				>
					<LogOut
						size={20}
						color={c.error}
						strokeWidth={2}
						style={{ marginRight: s.sm }}
					/>
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
