import { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@easydesign/design-system/foundation';
import { ThemedText } from '@easydesign/design-system';
import { useLocale } from '@/src/hooks/useLocale';
import { layout } from '@easydesign/design-system/foundation';
import { Cloud } from 'lucide-react-native';
import { withOpacity } from '@easydesign/design-system/foundation';
import { FINANCIAL_YEAR_SHORT_YEAR_DIGITS } from '@/utils/dateUtils';
import { SPACING_PX } from '@easydesign/design-system/foundation';

/** Hour boundaries for greeting copy (local day, 24h clock) */
const HOUR_NOON = 12;
const HOUR_AFTERNOON_END = 17;
const HEADER_ACTION_SIZE = 40;
const HEADER_ACTION_GAP = SPACING_PX.xs + SPACING_PX.xxs;
const HEADER_LETTER_SPACING = 0.6;
const HEADER_AVATAR_TINT = 0.14;
const HEADER_ACTION_PRESSED_OPACITY = 0.82;

export interface DashboardHeaderProps {
	businessName: string;
	onSyncPress?: () => void;
}

function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < HOUR_NOON) return 'Good Morning';
	if (hour < HOUR_AFTERNOON_END) return 'Good Afternoon';
	return 'Good Evening';
}

function getFinancialYearLabel(): string {
	const now = new Date();
	const month = now.getMonth() + 1; // 1-based
	const year = now.getFullYear();
	const fyStart = month >= 4 ? year : year - 1;
	const fyEnd = fyStart + 1;
	return `FY ${fyStart}-${String(fyEnd).slice(-FINANCIAL_YEAR_SHORT_YEAR_DIGITS)}`;
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
	const resolvedBusinessName = businessName.trim() || 'Business';

	return (
		<View
			accessibilityRole="header"
			accessibilityLabel={`${greeting}, ${resolvedBusinessName}`}
			style={[
				styles.headerWrap,
				{
					backgroundColor: c.background,
					borderBottomColor: c.separator,
					borderBottomWidth: StyleSheet.hairlineWidth,
					paddingHorizontal: s.lg,
					paddingTop: insets.top + s.sm,
					paddingBottom: s.lg,
				},
			]}
		>
			<View style={[layout.rowBetween, styles.row]}>
				<View style={styles.copyBlock} importantForAccessibility="no">
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={{
							letterSpacing: HEADER_LETTER_SPACING,
							textTransform: 'uppercase',
						}}
					>
						{`Quickstart · ${fyLabel}`}
					</ThemedText>
					<ThemedText variant="screenTitle" numberOfLines={2} style={{ marginTop: s.xs }}>
						{`${greeting}, ${resolvedBusinessName}`}
					</ThemedText>
					<ThemedText
						variant="caption"
						color={c.onSurfaceVariant}
						style={{ marginTop: s.xxs }}
					>
						{formattedDate}
					</ThemedText>
				</View>

				<View style={[layout.row, styles.actionCluster]}>
					<Pressable
						onPress={onSyncPress}
						accessibilityRole="button"
						accessibilityLabel={t('common.sync') ?? 'Sync'}
						style={({ pressed }) => [
							styles.actionButton,
							{
								backgroundColor: c.surface,
								borderColor: c.border,
								borderRadius: theme.borderRadius.md,
								height: HEADER_ACTION_SIZE,
								width: HEADER_ACTION_SIZE,
								opacity: pressed ? HEADER_ACTION_PRESSED_OPACITY : 1,
							},
						]}
						hitSlop={8}
					>
						<Cloud size={18} color={c.onSurface} strokeWidth={2.1} />
					</Pressable>
					<View
						style={[
							styles.avatar,
							{
								backgroundColor: withOpacity(c.primary, HEADER_AVATAR_TINT),
								borderColor: withOpacity(c.primary, HEADER_AVATAR_TINT),
								borderRadius: theme.borderRadius.full,
								height: HEADER_ACTION_SIZE,
								width: HEADER_ACTION_SIZE,
							},
						]}
						accessible
						accessibilityLabel={`Business initial: ${initial}`}
					>
						<ThemedText variant="label" color={c.primary} weight="semibold">
							{initial}
						</ThemedText>
					</View>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	headerWrap: {
		overflow: 'hidden',
	},
	row: {
		alignItems: 'flex-start',
	},
	copyBlock: {
		flex: 1,
		paddingRight: SPACING_PX.md,
	},
	actionCluster: {
		alignItems: 'center',
		gap: HEADER_ACTION_GAP,
	},
	actionButton: {
		alignItems: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		justifyContent: 'center',
	},
	avatar: {
		alignItems: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		justifyContent: 'center',
	},
});
