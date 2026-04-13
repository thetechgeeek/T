import { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { useLocale } from '@/src/hooks/useLocale';
import { layout } from '@/src/theme/layout';
import { Cloud } from 'lucide-react-native';
import { OPACITY_PRESSED, OPACITY_HOVER } from '@/theme/uiMetrics';
import { FINANCIAL_YEAR_SHORT_YEAR_DIGITS } from '@/utils/dateUtils';

/** Hour boundaries for greeting copy (local day, 24h clock) */
const HOUR_NOON = 12;
const HOUR_AFTERNOON_END = 17;

/** Opacity for secondary text (greeting translation) */
const DASHBOARD_HEADER_FY_BAR_OPACITY = 0.18;
const DASHBOARD_HEADER_DATE_OPACITY = 0.75;
const DASHBOARD_HEADER_LETTER_SPACING = 0.3;

export interface DashboardHeaderProps {
	businessName: string;
	onSyncPress?: () => void;
}

function getGreeting(): { en: string; hi: string } {
	const hour = new Date().getHours();
	if (hour < HOUR_NOON) return { en: 'Good Morning', hi: 'नमस्ते' };
	if (hour < HOUR_AFTERNOON_END) return { en: 'Good Afternoon', hi: 'नमस्ते' };
	return { en: 'Good Evening', hi: 'नमस्ते' };
}

function getFinancialYearLabel(): string {
	const now = new Date();
	const month = now.getMonth() + 1; // 1-based
	const year = now.getFullYear();
	const fyStart = month >= 4 ? year : year - 1;
	const fyEnd = fyStart + 1;
	// e.g. "FY 2024-25 · Apr – Mar"
	return `FY ${fyStart}-${String(fyEnd).slice(-FINANCIAL_YEAR_SHORT_YEAR_DIGITS)} · Apr – Mar`;
}

function getFormattedDate(): string {
	const now = new Date();
	return now.toLocaleDateString('en-IN', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

function getBusinessInitial(name: string): string {
	return (name || '?').trim().charAt(0).toUpperCase();
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ businessName, onSyncPress }) => {
	const { theme } = useTheme();
	const { t } = useLocale();
	const insets = useSafeAreaInsets();

	const c = theme.colors;
	const s = theme.spacing;

	const greeting = useMemo(() => getGreeting(), []);
	const fyLabel = useMemo(() => getFinancialYearLabel(), []);
	const formattedDate = useMemo(() => getFormattedDate(), []);
	const initial = useMemo(() => getBusinessInitial(businessName), [businessName]);

	return (
		<View
			accessibilityRole="header"
			accessibilityLabel={`${greeting.en}, ${businessName}`}
			style={[
				styles.headerWrap,
				{
					backgroundColor: c.primary,
					paddingTop: insets.top + s.sm,
				},
			]}
		>
			{/* Main header row */}
			<View
				style={[
					layout.rowBetween,
					{
						paddingHorizontal: s.lg,
						paddingBottom: s.lg,
						alignItems: 'center',
					},
				]}
			>
				{/* Left: avatar */}
				<View
					style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.95)' }]}
					accessible
					accessibilityLabel={`Business initial: ${initial}`}
				>
					<ThemedText variant="h3" color={c.primary} style={styles.avatarText}>
						{initial}
					</ThemedText>
				</View>

				{/* Centre: greeting + date */}
				<View style={styles.centreBlock} importantForAccessibility="no">
					<View style={[layout.row, { alignItems: 'center', gap: 6 }]}>
						<ThemedText
							variant="bodyBold"
							color={c.onPrimary}
							importantForAccessibility="no"
						>
							{greeting.en}
						</ThemedText>
						<ThemedText
							variant="body"
							color={c.onPrimary}
							style={{ opacity: OPACITY_PRESSED }}
							importantForAccessibility="no"
						>
							{greeting.hi}
						</ThemedText>
					</View>
					<ThemedText
						variant="caption"
						color={c.onPrimary}
						style={{ opacity: DASHBOARD_HEADER_DATE_OPACITY, marginTop: 2 }}
						importantForAccessibility="no"
					>
						{formattedDate}
					</ThemedText>
				</View>

				{/* Right: sync icon */}
				<Pressable
					onPress={onSyncPress}
					accessibilityRole="button"
					accessibilityLabel={t('common.sync') ?? 'Sync'}
					style={styles.syncBtn}
					hitSlop={8}
				>
					<Cloud size={22} color={c.onPrimary} opacity={OPACITY_HOVER} />
				</Pressable>
			</View>

			{/* Financial year bar */}
			<View
				style={[
					styles.fyBar,
					{ backgroundColor: `rgba(0,0,0,${DASHBOARD_HEADER_FY_BAR_OPACITY})` },
				]}
				accessible
				accessibilityLabel={`Financial year: ${fyLabel}`}
			>
				<ThemedText
					variant="caption"
					color={c.onPrimary}
					style={{
						opacity: OPACITY_PRESSED,
						letterSpacing: DASHBOARD_HEADER_LETTER_SPACING,
					}}
				>
					{fyLabel}
				</ThemedText>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	headerWrap: {
		borderBottomLeftRadius: 24,
		borderBottomRightRadius: 24,
		overflow: 'hidden',
	},
	avatar: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarText: {
		lineHeight: 44,
		textAlign: 'center',
	},
	centreBlock: {
		flex: 1,
		alignItems: 'center',
		paddingHorizontal: 8,
	},
	syncBtn: {
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},
	fyBar: {
		alignItems: 'center',
		paddingVertical: 5,
	},
});
