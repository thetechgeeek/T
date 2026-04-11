import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ShieldCheck, Calculator, Calendar, FileCode, ChevronRight } from 'lucide-react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { withOpacity } from '@/src/utils/color';

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
					<TouchableOpacity
						key={card.title}
						style={[
							styles.card,
							{
								backgroundColor: c.card,
								borderRadius: r.md,
								marginBottom: s.sm,
								...(theme.shadows.sm as object),
							},
						]}
						onPress={() => handlePress(card)}
						activeOpacity={0.8}
						accessibilityRole="button"
						accessibilityLabel={card.title}
					>
						<View
							style={[
								styles.iconWrap,
								{
									backgroundColor: withOpacity(card.color, 0.12),
									borderRadius: 10,
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
								style={{ marginTop: 2 }}
							>
								{card.description}
							</ThemedText>
						</View>
						<ChevronRight size={18} color={c.placeholder} strokeWidth={2} />
					</TouchableOpacity>
				))}
			</View>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 14,
	},
	iconWrap: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
});
