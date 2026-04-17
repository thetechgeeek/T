import React, { forwardRef } from 'react';
import { Modal, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
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
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export const ActionMenuSheet = forwardRef<View, ActionMenuSheetProps>(
	({ title, actions, open, defaultOpen = false, onOpenChange, onSelect, testID, style }, ref) => {
		const { theme } = useTheme();
		const c = theme.colors;
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
							padding: theme.spacing.lg,
							backgroundColor: c.surface,
							borderTopLeftRadius: theme.borderRadius.xl,
							borderTopRightRadius: theme.borderRadius.xl,
						},
						style,
					]}
				>
					<ThemedText
						variant="sectionTitle"
						style={{ color: c.onSurface, marginBottom: theme.spacing.sm }}
					>
						{title}
					</ThemedText>
					<View style={{ gap: theme.spacing.sm }}>
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
									paddingVertical: theme.spacing.sm,
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
											marginTop: theme.spacing.xxs,
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
						style={{ marginTop: theme.spacing.md }}
					/>
				</View>
			</Modal>
		);
	},
);

ActionMenuSheet.displayName = 'ActionMenuSheet';
