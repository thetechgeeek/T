import { OPACITY_TINT_LIGHT, SIZE_ICON_CIRCLE_MD } from '@/theme/uiMetrics';
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ShieldCheck, Calculator, Calendar, FileCode, ChevronRight } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { TouchableCard } from '@/src/components/atoms/TouchableCard';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { withOpacity } from '@/src/utils/color';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

interface UtilityCard {
	title: string;
	description: string;
	icon: React.ElementType;
	color: string;
	route?: Href;
}

export default function UtilitiesHubScreen() {
	const { theme, c, s, r } = useThemeTokens();
	const router = useRouter();

	const utilityCards: UtilityCard[] = [
		{
			title: 'Data Verification',
			description: 'Check ledger balances, stock counts and GST data',
			icon: ShieldCheck,
			color: c.success,
			route: './verify' as Href,
		},
		{
			title: 'Calculator',
			description: 'GST-aware calculator with EMI tool',
			icon: Calculator,
			color: c.primary,
			route: './calculator' as Href,
		},
		{
			title: 'Close Financial Year',
			description: 'Archive FY and reset invoice sequence',
			icon: Calendar,
			color: c.warning,
			route: './close-fy' as Href,
		},
		{
			title: 'Export to Tally',
			description: 'Generate XML vouchers for TallyPrime / ERP 9',
			icon: FileCode,
			color: c.info,
			route: './tally-export' as Href,
		},
	];

	const handlePress = (card: UtilityCard) => {
		if (card.route) {
			router.push(card.route);
		} else {
			Alert.alert('Coming Soon', `${card.title} is coming soon.`);
		}
	};

	return (
		<AtomicScreen safeAreaEdges={['top', 'bottom']} scrollable>
			<ScreenHeader title="Utilities" />
			<View style={{ padding: s.lg }}>
				{utilityCards.map((card) => (
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
