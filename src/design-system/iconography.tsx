import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import type { LucideIcon } from 'lucide-react-native';
import { DEFAULT_RUNTIME_QUALITY_SIGNALS } from '@/src/design-system/runtimeSignals';
import { useTheme } from '@/src/theme/ThemeProvider';

const MAX_ICON_FONT_SCALE = 1.35;

export function resolveAccessibleIconSize(
	baseSize: number,
	fontScale: number,
	allowFontScaling = true,
) {
	if (!allowFontScaling) {
		return baseSize;
	}

	return Number((baseSize * Math.min(Math.max(fontScale, 1), MAX_ICON_FONT_SCALE)).toFixed(2));
}

export function useAccessibleIconSize(baseSize: number, allowFontScaling = true) {
	const { runtime } = useTheme();
	const resolvedRuntime = runtime ?? DEFAULT_RUNTIME_QUALITY_SIGNALS;

	return resolveAccessibleIconSize(baseSize, resolvedRuntime.fontScale, allowFontScaling);
}

export interface LucideIconGlyphProps {
	icon: LucideIcon;
	size: number;
	color: string;
	strokeWidth?: number;
	allowFontScaling?: boolean;
	decorative?: boolean;
	accessibilityLabel?: string;
	testID?: string;
	style?: React.ComponentProps<LucideIcon>['style'];
}

export function LucideIconGlyph({
	icon: Icon,
	size,
	color,
	strokeWidth = 2,
	allowFontScaling = true,
	decorative = true,
	accessibilityLabel,
	testID,
	style,
}: LucideIconGlyphProps) {
	const scaledSize = useAccessibleIconSize(size, allowFontScaling);

	return (
		<Icon
			testID={testID}
			size={scaledSize}
			color={color}
			strokeWidth={strokeWidth}
			style={style}
			accessible={!decorative}
			accessibilityRole={decorative ? undefined : 'image'}
			accessibilityLabel={decorative ? undefined : accessibilityLabel}
			importantForAccessibility={decorative ? 'no' : 'yes'}
		/>
	);
}

export interface MaterialIconGlyphProps {
	name: React.ComponentProps<typeof MaterialIcons>['name'];
	size: number;
	color: string;
	allowFontScaling?: boolean;
	decorative?: boolean;
	accessibilityLabel?: string;
	testID?: string;
}

export function MaterialIconGlyph({
	name,
	size,
	color,
	allowFontScaling = true,
	decorative = true,
	accessibilityLabel,
	testID,
}: MaterialIconGlyphProps) {
	const scaledSize = useAccessibleIconSize(size, allowFontScaling);

	return (
		<MaterialIcons
			testID={testID}
			name={name}
			size={scaledSize}
			color={color}
			allowFontScaling={allowFontScaling}
			accessible={!decorative}
			accessibilityRole={decorative ? undefined : 'image'}
			accessibilityLabel={decorative ? undefined : accessibilityLabel}
			importantForAccessibility={decorative ? 'no' : 'yes'}
		/>
	);
}
