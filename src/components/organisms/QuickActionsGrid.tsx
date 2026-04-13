import { View, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { useLocale } from '@/src/hooks/useLocale';
import { withOpacity } from '@/src/utils/color';
import { OPACITY_TINT_LIGHT } from '@/theme/uiMetrics';
import type { LucideIcon } from 'lucide-react-native';

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

	return (
		<View style={{ paddingHorizontal: s.lg, marginTop: s.lg }}>
			<ThemedText variant="h3" style={{ marginBottom: s.md }}>
				{t('dashboard.quickActions')}
			</ThemedText>
			<View style={styles.actionsGrid}>
				{actions.map((action) => (
					<TouchableOpacity
						key={action.route}
						style={[
							{
								backgroundColor: c.card,
								borderRadius: r.lg,
								width: (width - s.lg * 2 - s.sm * 3) / 2,
								padding: s.md,
								...theme.shadows.sm,
							},
						]}
						onPress={() =>
							router.push(action.route as Parameters<typeof router.push>[0])
						}
						activeOpacity={0.8}
						accessibilityRole="button"
						accessibilityLabel={action.accessibilityLabel}
					>
						<View
							style={{
								backgroundColor: withOpacity(action.color, OPACITY_TINT_LIGHT),
								borderRadius: r.md,
								padding: s.sm,
								alignSelf: 'flex-start',
							}}
						>
							<action.icon size={24} color={action.color} strokeWidth={2} />
						</View>
						<ThemedText variant="body" weight="medium" style={{ marginTop: s.sm }}>
							{action.label}
						</ThemedText>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
