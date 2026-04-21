import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@easydesign/design-system/foundation';
import { ThemedText } from '@easydesign/design-system';
import { useLocale } from '@/src/hooks/useLocale';
import { withOpacity } from '@easydesign/design-system/foundation';
import { SPACING_PX } from '@easydesign/design-system/foundation';
import type { LucideIcon } from 'lucide-react-native';

const QUICK_ACTIONS_MIN_VIEWPORT_WIDTH = 320;
const QUICK_ACTIONS_LABEL_LETTER_SPACING = 0.6;
const QUICK_ACTION_ICON_TINT = 0.14;
const QUICK_ACTION_CARD_MIN_HEIGHT = 88;

export interface QuickAction {
	label: string;
	/** Stable English identifier for screen readers and Maestro. Required. */
	accessibilityLabel: string;
	icon: LucideIcon;
	route: string;
	color: string;
}

export interface QuickActionsGridProps {
	actions: QuickAction[];
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ actions }) => {
	const { theme } = useTheme();
	const { t } = useLocale();
	const router = useRouter();
	const { width } = useWindowDimensions();

	const c = theme.colors;
	const s = theme.spacing;
	const r = theme.borderRadius;
	const columns = 4;
	const actionWidth = Math.max(
		72,
		(Math.max(width, QUICK_ACTIONS_MIN_VIEWPORT_WIDTH) - s.lg * 2 - s.sm * (columns - 1)) /
			columns,
	);

	return (
		<View style={{ paddingHorizontal: s.lg, marginTop: s.lg }}>
			<ThemedText
				variant="caption"
				color={c.onSurfaceVariant}
				style={{
					marginBottom: s.sm,
					letterSpacing: QUICK_ACTIONS_LABEL_LETTER_SPACING,
					textTransform: 'uppercase',
				}}
			>
				{t('dashboard.quickActions')}
			</ThemedText>
			<View style={styles.actionsGrid}>
				{actions.map((action) => (
					<Pressable
						key={action.route}
						style={({ pressed }) => [
							styles.actionCard,
							{
								backgroundColor: pressed ? c.surfaceVariant : c.card,
								borderColor: c.border,
								borderRadius: r.lg,
								paddingHorizontal: s.sm,
								paddingVertical: s.sm,
								width: actionWidth,
							},
							theme.shadows.xs,
						]}
						onPress={() =>
							router.push(action.route as Parameters<typeof router.push>[0])
						}
						accessibilityRole="button"
						accessibilityLabel={action.accessibilityLabel}
					>
						<View
							style={{
								alignItems: 'center',
								alignSelf: 'flex-start',
								backgroundColor: withOpacity(action.color, QUICK_ACTION_ICON_TINT),
								borderRadius: r.md,
								height: 32,
								justifyContent: 'center',
								width: 32,
							}}
						>
							<action.icon size={18} color={action.color} strokeWidth={2} />
						</View>
						<ThemedText
							variant="caption"
							weight="semibold"
							style={{ marginTop: s.sm }}
							numberOfLines={2}
						>
							{action.label}
						</ThemedText>
					</Pressable>
				))}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING_PX.sm },
	actionCard: {
		borderWidth: StyleSheet.hairlineWidth,
		justifyContent: 'flex-start',
		minHeight: QUICK_ACTION_CARD_MIN_HEIGHT,
	},
});
