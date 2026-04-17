import React, { forwardRef, useState } from 'react';
import { ChevronDown } from 'lucide-react-native';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { LucideIconGlyph } from '@/src/design-system/iconography';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Button } from '@/src/design-system/components/atoms/Button';
import {
	ActionMenuSheet,
	type ActionMenuSheetItem,
} from '@/src/design-system/components/molecules/ActionMenuSheet';

export interface SplitButtonProps {
	label: string;
	onPress: () => void;
	secondaryActions: ActionMenuSheetItem[];
	onSecondaryAction: (value: string) => void;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export const SplitButton = forwardRef<View, SplitButtonProps>(
	({ label, onPress, secondaryActions, onSecondaryAction, testID, style }, ref) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [menuOpen, setMenuOpen] = useState(false);

		return (
			<View ref={ref} testID={testID} style={style}>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'stretch',
					}}
				>
					<View style={{ flex: 1 }}>
						<Button title={label} onPress={onPress} fullWidth />
					</View>
					<Pressable
						testID={`${testID ?? 'split-button'}-toggle`}
						onPress={() => setMenuOpen(true)}
						accessibilityRole="button"
						accessibilityLabel={`${label} secondary actions`}
						style={{
							minWidth: theme.touchTarget,
							minHeight: theme.components.button.heights.md,
							marginStart: theme.spacing.xs,
							borderWidth: theme.borderWidth.sm,
							borderColor: c.border,
							borderRadius: theme.borderRadius.md,
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: theme.visual.surfaces.raised,
						}}
					>
						<LucideIconGlyph
							icon={ChevronDown}
							size={theme.typography.sizes.md}
							color={c.onSurface}
						/>
					</Pressable>
				</View>
				<ActionMenuSheet
					title={`${label} actions`}
					actions={secondaryActions}
					open={menuOpen}
					onOpenChange={setMenuOpen}
					onSelect={onSecondaryAction}
					testID={`${testID ?? 'split-button'}-menu`}
				/>
			</View>
		);
	},
);

SplitButton.displayName = 'SplitButton';
