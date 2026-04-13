import React from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { AlertTriangle, ChevronRight } from 'lucide-react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { useLocale } from '@/src/hooks/useLocale';
import { layout } from '@/src/theme/layout';
import { palette } from '@/src/theme/palette';
import { FLEX_AMT_WIDE, OVERLAY_COLOR_STRONG } from '@/theme/uiMetrics';
import { FAB_SHADOW } from '@/theme/shadowMetrics';

export interface ConflictField {
	label: string;
	localValue: string;
	serverValue: string;
}

export interface ConflictModalProps {
	visible: boolean;
	onKeepMine: () => void;
	onUseServer: () => void;
	onCancel: () => void;
	fields: ConflictField[];
	title?: string;
}

/**
 * P22.1 — ConflictModal
 * Handles data collisions by showing side-by-side comparison.
 */
export function ConflictModal({
	visible,
	onKeepMine,
	onUseServer,
	onCancel,
	fields,
	title,
}: ConflictModalProps) {
	const { c, s, r } = useThemeTokens();
	const { t } = useLocale();

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
			<View style={[styles.overlay, { backgroundColor: OVERLAY_COLOR_STRONG }]}>
				<View style={[styles.content, { backgroundColor: c.surface, borderRadius: r.lg }]}>
					<View style={[layout.row, { marginBottom: s.md }]}>
						<AlertTriangle size={24} color={c.warning} />
						<ThemedText variant="h3" style={{ marginLeft: 12, flex: 1 }}>
							{title || t('sync.conflictTitle') || 'Data Conflict Detected'}
						</ThemedText>
					</View>

					<ThemedText
						variant="body"
						color={c.onSurfaceVariant}
						style={{ marginBottom: s.lg }}
					>
						{t('sync.conflictDesc') ||
							'Someone else updated this record while you were offline. Which version should we keep?'}
					</ThemedText>

					<ScrollView style={{ maxHeight: 300, marginBottom: s.lg }}>
						<View style={[layout.row, { marginBottom: s.sm, paddingHorizontal: 4 }]}>
							<ThemedText variant="caption" weight="bold" style={{ flex: 1 }}>
								{t('sync.field') || 'Field'}
							</ThemedText>
							<ThemedText
								variant="caption"
								weight="bold"
								style={{ flex: FLEX_AMT_WIDE, textAlign: 'center' }}
							>
								{t('sync.yourVersion') || 'Your Version'}
							</ThemedText>
							<View style={{ width: 20 }} />
							<ThemedText
								variant="caption"
								weight="bold"
								style={{ flex: FLEX_AMT_WIDE, textAlign: 'center' }}
							>
								{t('sync.serverVersion') || 'Server Version'}
							</ThemedText>
						</View>

						{fields.map((field, idx) => (
							<View
								key={idx}
								style={[
									styles.row,
									{
										borderTopWidth: 1,
										borderTopColor: c.border,
										paddingVertical: 8,
									},
								]}
							>
								<ThemedText variant="caption" weight="medium" style={{ flex: 1 }}>
									{field.label}
								</ThemedText>
								<View
									style={[
										styles.valueBox,
										{ backgroundColor: c.warningLight, flex: FLEX_AMT_WIDE },
									]}
								>
									<ThemedText variant="caption" style={{ color: c.onWarning }}>
										{field.localValue}
									</ThemedText>
								</View>
								<View style={{ width: 20, alignItems: 'center' }}>
									<ChevronRight size={12} color={c.onSurfaceVariant} />
								</View>
								<View
									style={[
										styles.valueBox,
										{ backgroundColor: c.surfaceVariant, flex: FLEX_AMT_WIDE },
									]}
								>
									<ThemedText
										variant="caption"
										style={{ color: c.onSurfaceVariant }}
									>
										{field.serverValue}
									</ThemedText>
								</View>
							</View>
						))}
					</ScrollView>

					<View style={{ gap: s.sm }}>
						<Button
							title={t('sync.keepMine') || 'Keep My Version'}
							onPress={onKeepMine}
							variant="primary"
						/>
						<Button
							title={t('sync.useServer') || 'Use Server Version'}
							onPress={onUseServer}
							variant="outline"
						/>
						<TouchableOpacity onPress={onCancel} style={{ padding: 8 }}>
							<ThemedText variant="body" align="center" color={c.onSurfaceVariant}>
								{t('common.cancel')}
							</ThemedText>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: 'center',
		padding: 20,
	},
	content: {
		padding: 24,
		elevation: 5,
		shadowColor: palette.shadow,
		shadowOffset: { width: 0, height: 2 },
		...FAB_SHADOW,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	valueBox: {
		padding: 4,
		borderRadius: 4,
		minHeight: 24,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
