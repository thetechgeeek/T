import { OPACITY_TINT_LIGHT, SIZE_ICON_CIRCLE_MD } from '@easydesign/design-system/foundation';
import React from 'react';
import { View, StyleSheet } from 'react-native';
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
import { Screen as AtomicScreen } from '@easydesign/design-system';
import { TouchableCard } from '@easydesign/design-system';
import { ThemedText } from '@easydesign/design-system';
import { ScreenHeader } from '@easydesign/ui-shell';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { withOpacity } from '@easydesign/design-system/foundation';
import { SPACING_PX } from '@easydesign/design-system/foundation';
import { Features } from '@/src/config/featureFlags';

interface ReportCard {
	title: string;
	description: string;
	icon: React.ElementType;
	color: string;
	route: Href;
	enabled: boolean;
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
			enabled: true,
		},
		{
			title: 'Purchase Report',
			description: 'Track purchases from suppliers',
			icon: ShoppingCart,
			color: c.info,
			route: './purchase' as Href,
			enabled: true,
		},
		{
			title: 'Party Outstanding',
			description: 'Customer & supplier balances at a glance',
			icon: Users,
			color: c.warning,
			route: './all-parties' as Href,
			enabled: true,
		},
		{
			title: 'Stock Report',
			description: 'Current stock levels by item',
			icon: Package,
			color: c.primary,
			route: './stock-summary' as Href,
			enabled: true,
		},
		{
			title: 'Expense Report',
			description: 'Category-wise expense breakdown',
			icon: Receipt,
			color: c.error,
			route: './expense-summary' as Href,
			enabled: Features.LIVE_EXPENSE_SUMMARY_REPORT,
		},
		{
			title: 'P&L Report',
			description: 'Beta: excludes other income and stock valuation',
			icon: BarChart,
			color: c.onSurfaceVariant,
			route: '/(app)/finance/profit-loss' as Href,
			enabled: true,
		},
	].filter((card) => card.enabled);

	const handlePress = (card: ReportCard) => {
		router.push(card.route);
	};

	return (
		<AtomicScreen
			safeAreaEdges={['bottom']}
			scrollable
			header={<ScreenHeader title="Reports" />}
		>
			<View
				style={{ padding: s.lg }}
				accessibilityRole="list"
				accessibilityLabel="Reports list"
			>
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
							<card.icon
								size={22}
								color={card.color}
								strokeWidth={2}
								importantForAccessibility="no"
							/>
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
						<ChevronRight
							size={18}
							color={c.placeholder}
							strokeWidth={2}
							importantForAccessibility="no"
						/>
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
