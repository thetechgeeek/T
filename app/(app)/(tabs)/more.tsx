import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import {
	Truck,
	BarChart2,
	TrendingUp,
	Settings,
	Package,
	Palette,
	Users,
	Languages,
	Moon,
	Sun,
	LogOut,
	ChevronRight,
} from 'lucide-react-native';
import { withOpacity } from '@/src/utils/color';
import { OPACITY_TINT_LIGHT } from '@/theme/uiMetrics';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useAuthStore } from '@/src/stores/authStore';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Divider } from '@/src/components/atoms/Divider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

export default function MoreTab() {
	const { theme, c, s, r } = useThemeTokens();
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
		{
			label: 'Reports',
			accessibilityLabel: 'menu-reports',
			icon: TrendingUp,
			route: '/(app)/reports',
			color: c.success,
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
		{
			label: 'Design Library',
			accessibilityLabel: 'menu-design-library',
			icon: Palette,
			route: '/(app)/design-system',
			color: c.primary,
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
				<ThemedText variant="label" style={{ marginBottom: s.sm, marginLeft: s.xs }}>
					{t('settings.sections.reports')}
				</ThemedText>
				{reportsItems.map((item) => (
					<TouchableOpacity
						key={item.route}
						style={[
							styles.menuItem,
							{
								backgroundColor: c.card,
								borderRadius: r.md,
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
									backgroundColor: withOpacity(item.color, OPACITY_TINT_LIGHT),
									borderRadius: r.lg,
									width: s['2xl'] + s.sm,
									height: s['2xl'] + s.sm,
								},
							]}
						>
							<item.icon size={22} color={item.color} strokeWidth={2} />
						</View>
						<ThemedText variant="caption" weight="medium" style={styles.menuLabel}>
							{item.label}
						</ThemedText>
						<ChevronRight size={18} color={c.placeholder} strokeWidth={2} />
					</TouchableOpacity>
				))}

				<Divider style={{ marginVertical: s.md }} />

				{/* SETTINGS section */}
				<ThemedText variant="label" style={{ marginBottom: s.sm, marginLeft: s.xs }}>
					{t('settings.sections.settings')}
				</ThemedText>
				{settingsItems.map((item) => (
					<TouchableOpacity
						key={item.route}
						style={[
							styles.menuItem,
							{
								backgroundColor: c.card,
								borderRadius: r.md,
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
									backgroundColor: withOpacity(item.color, OPACITY_TINT_LIGHT),
									borderRadius: r.lg,
									width: s['2xl'] + s.sm,
									height: s['2xl'] + s.sm,
								},
							]}
						>
							<item.icon size={22} color={item.color} strokeWidth={2} />
						</View>
						<ThemedText variant="caption" weight="medium" style={styles.menuLabel}>
							{item.label}
						</ThemedText>
						<ChevronRight size={18} color={c.placeholder} strokeWidth={2} />
					</TouchableOpacity>
				))}

				<Divider style={{ marginVertical: s.md }} />

				{/* PREFERENCES section */}
				<ThemedText variant="label" style={{ marginBottom: s.sm, marginLeft: s.xs }}>
					{t('settings.sections.preferences')}
				</ThemedText>

				<TouchableOpacity
					style={[
						styles.menuItem,
						{
							backgroundColor: c.card,
							borderRadius: r.md,
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
							{
								backgroundColor: withOpacity(c.primary, OPACITY_TINT_LIGHT),
								borderRadius: r.lg,
								width: s['2xl'] + s.sm,
								height: s['2xl'] + s.sm,
							},
						]}
					>
						<Languages size={22} color={c.primary} strokeWidth={2} />
					</View>
					<ThemedText variant="caption" weight="medium" style={styles.menuLabel}>
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
							borderRadius: r.md,
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
								backgroundColor: withOpacity(
									c.onSurfaceVariant,
									OPACITY_TINT_LIGHT,
								),
								borderRadius: r.lg,
								width: s['2xl'] + s.sm,
								height: s['2xl'] + s.sm,
							},
						]}
					>
						{isDark ? (
							<Sun size={22} color={c.onSurfaceVariant} strokeWidth={2} />
						) : (
							<Moon size={22} color={c.onSurfaceVariant} strokeWidth={2} />
						)}
					</View>
					<ThemedText variant="caption" weight="medium" style={styles.menuLabel}>
						{isDark ? t('settings.lightMode') : t('settings.darkMode')}
					</ThemedText>
				</TouchableOpacity>

				<Divider style={{ marginVertical: s.md }} />

				{/* ACCOUNT section */}
				<ThemedText variant="label" style={{ marginBottom: s.sm, marginLeft: s.xs }}>
					{t('settings.sections.account')}
				</ThemedText>

				<TouchableOpacity
					style={[
						styles.menuItem,
						{
							backgroundColor: c.errorLight,
							borderRadius: r.md,
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
						variant="caption"
						color={c.error}
						weight="medium"
						align="center"
						style={styles.menuLabel}
					>
						{t('auth.signOut')}
					</ThemedText>
				</TouchableOpacity>
			</View>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	header: { paddingVertical: SPACING_PX.md },
	menuItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING_PX.md },
	iconWrap: {
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: SPACING_PX.md,
	},
	menuLabel: { flex: 1 },
});
