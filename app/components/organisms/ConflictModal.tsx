import React from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { AlertTriangle, ChevronRight } from 'lucide-react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { Button } from '@/src/design-system/components/atoms/Button';
import { useLocale } from '@/src/hooks/useLocale';
import { layout } from '@/src/theme/layout';
import {
	FLEX_AMT_WIDE,
	OVERLAY_COLOR_STRONG,
	SIZE_CONFLICT_MODAL_MAX_HEIGHT,
	SIZE_ICON_LG,
	SIZE_ICON_MD,
	SIZE_ICON_SM,
} from '@/theme/uiMetrics';
import { SPACING_PX, BORDER_RADIUS_PX } from '@/src/theme/layoutMetrics';

const CONFLICT_ICON_SIZE = SIZE_ICON_MD;

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
	const { c, s, r, shadows } = useThemeTokens();
	const { t } = useLocale();

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
			<View style={[styles.overlay, { backgroundColor: OVERLAY_COLOR_STRONG }]}>
				<View
					style={[
						styles.content,
						shadows.lg,
						{ backgroundColor: c.surface, borderRadius: r.lg },
					]}
				>
					<View style={[layout.row, { marginBottom: s.md }]}>
						<AlertTriangle size={SIZE_ICON_LG} color={c.warning} />
						<ThemedText variant="h3" style={{ marginLeft: s.md, flex: 1 }}>
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

					<ScrollView
						style={{ maxHeight: SIZE_CONFLICT_MODAL_MAX_HEIGHT, marginBottom: s.lg }}
					>
						<View
							style={[
								layout.row,
								{ marginBottom: s.sm, paddingHorizontal: SPACING_PX.xs },
							]}
						>
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
							<View style={{ width: CONFLICT_ICON_SIZE }} />
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
										paddingVertical: SPACING_PX.sm,
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
								<View style={{ width: CONFLICT_ICON_SIZE, alignItems: 'center' }}>
									<ChevronRight size={SIZE_ICON_SM} color={c.onSurfaceVariant} />
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
						<TouchableOpacity onPress={onCancel} style={{ padding: SPACING_PX.sm }}>
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
		padding: SPACING_PX.xl,
	},
	content: {
		padding: SPACING_PX.xl,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	valueBox: {
		padding: SPACING_PX.xs,
		borderRadius: BORDER_RADIUS_PX.sm,
		minHeight: CONFLICT_ICON_SIZE,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
