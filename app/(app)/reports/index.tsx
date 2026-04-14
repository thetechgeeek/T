import { OPACITY_TINT_LIGHT, SIZE_ICON_CIRCLE_MD } from '@/theme/uiMetrics';
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import {
	TrendingUp,
	ShoppingCart,
	Users,
	Package,
	Receipt,
	BarChart,
	ChevronRight,
} from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { TouchableCard } from '@/src/components/atoms/TouchableCard';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { withOpacity } from '@/src/utils/color';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

interface ReportCard {
	title: string;
	description: string;
	icon: React.ElementType;
	color: string;
	route?: Href;
}

export default function ReportsHubScreen() {
	const { theme, c, s, r } = useThemeTokens();
	const router = useRouter();

	const reportCards: ReportCard[] = [
		{
			title: 'Sale Report',
			description: 'View invoice totals, collections and outstanding',
			icon: TrendingUp,
			color: c.success,
			route: './sale' as Href,
		},
		{
			title: 'Purchase Report',
			description: 'Track purchases from suppliers',
			icon: ShoppingCart,
			color: c.info,
			route: './purchase' as Href,
		},
		{
			title: 'Party Outstanding',
			description: 'Customer & supplier balances at a glance',
			icon: Users,
			color: c.warning,
			route: './all-parties' as Href,
		},
		{
			title: 'Stock Report',
			description: 'Current stock levels by item',
			icon: Package,
			color: c.primary,
		},
		{
			title: 'Expense Report',
			description: 'Category-wise expense breakdown',
			icon: Receipt,
			color: c.error,
		},
		{
			title: 'P&L Report',
			description: 'Profit & Loss for the financial year',
			icon: BarChart,
			color: c.onSurfaceVariant,
			route: '/(app)/finance/profit-loss' as Href,
		},
	];

	const handlePress = (card: ReportCard) => {
		if (card.route) {
			router.push(card.route);
		} else {
			Alert.alert('Coming Soon', `${card.title} is coming soon.`);
		}
	};

	return (
		<AtomicScreen safeAreaEdges={['top', 'bottom']} scrollable>
			<ScreenHeader title="Reports" />
			<View style={{ padding: s.lg }}>
				{reportCards.map((card) => (
					<TouchableCard
						key={card.title}
						style={[
							{
								flexDirection: 'row',
								alignItems: 'center',
								padding: s.md - s.xxs,
								backgroundColor: c.card,
								borderRadius: r.md,
								marginBottom: s.sm,
								...theme.shadows.sm,
							},
						]}
						onPress={() => handlePress(card)}
						accessibilityRole="button"
						accessibilityLabel={card.title}
					>
						<View
							style={[
								styles.iconWrap,
								{
									backgroundColor: withOpacity(card.color, OPACITY_TINT_LIGHT),
									borderRadius: r.lg,
								},
							]}
						>
							<card.icon size={22} color={card.color} strokeWidth={2} />
						</View>
						<View style={{ flex: 1 }}>
							<ThemedText
								weight="medium"
								style={{ fontSize: theme.typography.sizes.md }}
							>
								{card.title}
							</ThemedText>
							<ThemedText
								variant="caption"
								color={c.onSurfaceVariant}
								style={{ marginTop: s.xxs }}
							>
								{card.description}
							</ThemedText>
						</View>
						<ChevronRight size={18} color={c.placeholder} strokeWidth={2} />
					</TouchableCard>
				))}
			</View>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	iconWrap: {
		width: SIZE_ICON_CIRCLE_MD,
		height: SIZE_ICON_CIRCLE_MD,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: SPACING_PX.md,
	},
});
