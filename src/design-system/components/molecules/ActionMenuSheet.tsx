import React, { forwardRef } from 'react';
import { Modal, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { resolveOverlayDensityStyles, type OverlayDensity } from '@/src/design-system/overlayUtils';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { Button } from '@/src/design-system/components/atoms/Button';

export interface ActionMenuSheetItem {
	label: string;
	value: string;
	description?: string;
	destructive?: boolean;
	disabled?: boolean;
}

export interface ActionMenuSheetProps {
	title: string;
	actions: ActionMenuSheetItem[];
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean, meta?: { source: 'selection' | 'dismiss' }) => void;
	onSelect: (value: string) => void;
	density?: OverlayDensity;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export const ActionMenuSheet = forwardRef<View, ActionMenuSheetProps>(
	(
		{
			title,
			actions,
			open,
			defaultOpen = false,
			onOpenChange,
			onSelect,
			density = 'default',
			testID,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const densityStyles = resolveOverlayDensityStyles(theme, density);
		const [isOpen, setIsOpen] = useControllableState({
			value: open,
			defaultValue: defaultOpen,
			onChange: (nextOpen, meta) =>
				onOpenChange?.(nextOpen, {
					source: meta?.source === 'selection' ? 'selection' : 'dismiss',
				}),
		});

		const close = () => setIsOpen(false, { source: 'dismiss' });

		if (!isOpen) {
			return null;
		}

		return (
			<Modal transparent visible={isOpen} animationType="slide" onRequestClose={close}>
				<Pressable
					style={{
						flex: 1,
						backgroundColor: c.scrim,
					}}
					onPress={close}
				/>
				<View
					ref={ref}
					testID={testID}
					style={[
						{
							position: 'absolute',
							bottom: 0,
							width: '100%',
							paddingHorizontal: densityStyles.paddingHorizontal,
							paddingVertical: densityStyles.paddingVertical,
							backgroundColor: c.surface,
							borderTopLeftRadius: theme.borderRadius.xl,
							borderTopRightRadius: theme.borderRadius.xl,
							gap: densityStyles.sectionGap,
						},
						style,
					]}
				>
					<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
						{title}
					</ThemedText>
					<View style={{ gap: densityStyles.actionGap }}>
						{actions.map((action) => (
							<Pressable
								key={action.value}
								testID={`${testID ?? 'action-menu'}-${action.value}`}
								onPress={() => {
									if (action.disabled) {
										return;
									}
									onSelect(action.value);
									setIsOpen(false, { source: 'selection' });
								}}
								disabled={action.disabled}
								accessibilityRole="button"
								accessibilityLabel={action.label}
								style={{
									paddingVertical: densityStyles.actionGap,
								}}
							>
								<ThemedText
									variant="bodyStrong"
									style={{
										color: action.destructive ? c.error : c.onSurface,
									}}
								>
									{action.label}
								</ThemedText>
								{action.description ? (
									<ThemedText
										variant="caption"
										style={{
											color: c.onSurfaceVariant,
											marginTop: densityStyles.headerGap,
										}}
									>
										{action.description}
									</ThemedText>
								) : null}
							</Pressable>
						))}
					</View>
					<Button
						title="Cancel"
						variant="ghost"
						onPress={close}
						style={{ marginTop: densityStyles.headerGap }}
					/>
				</View>
			</Modal>
		);
	},
);

ActionMenuSheet.displayName = 'ActionMenuSheet';
