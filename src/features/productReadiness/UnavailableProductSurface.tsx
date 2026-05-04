import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Screen, ThemedText, Button } from '@easydesign/design-system';
import { ScreenHeader } from '@easydesign/ui-shell';
import { useThemeTokens } from '@easydesign/design-system/foundation';

interface UnavailableProductSurfaceProps {
	title: string;
	area: 'Finance' | 'Reports' | 'Transactions' | 'Utilities';
}

const COPY: Record<UnavailableProductSurfaceProps['area'], string> = {
	Finance:
		'This finance workflow is disabled until it is connected to live banking, ledger, and audit data.',
	Reports:
		'This report is disabled until live ledgers, statutory calculations, exports, and regression tests are wired.',
	Transactions:
		'This transaction workflow is disabled until draft, approval, numbering, posting, and export paths are wired.',
	Utilities:
		'This utility is disabled until live validation, audit output, and regression coverage are wired.',
};

export function UnavailableProductSurface({ title, area }: UnavailableProductSurfaceProps) {
	const router = useRouter();
	const { c, s, r } = useThemeTokens();

	return (
		<Screen
			safeAreaEdges={['bottom']}
			withKeyboard={false}
			header={<ScreenHeader title={title} />}
			contentContainerStyle={[styles.content, { padding: s.xl }]}
		>
			<View
				style={[
					styles.iconWrap,
					{
						backgroundColor: c.surfaceVariant,
						borderColor: c.border,
						borderRadius: r.lg,
						marginBottom: s.lg,
					},
				]}
			>
				<Lock size={28} color={c.placeholder} strokeWidth={1.75} />
			</View>
			<ThemedText variant="h2" style={styles.title}>
				{title}
			</ThemedText>
			<ThemedText color={c.onSurfaceVariant} style={[styles.message, { marginTop: s.sm }]}>
				{COPY[area]}
			</ThemedText>
			<View style={{ marginTop: s.xl }}>
				<Button title="Go Back" variant="secondary" onPress={() => router.back()} />
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconWrap: {
		width: 64,
		height: 64,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: StyleSheet.hairlineWidth,
	},
	title: {
		textAlign: 'center',
	},
	message: {
		maxWidth: 360,
		textAlign: 'center',
		lineHeight: 22,
	},
});
