import React, { forwardRef, useMemo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'busy' | 'offline' | 'warning';

export interface AvatarProps {
	name: string;
	source?: string;
	size?: AvatarSize;
	status?: AvatarStatus;
	style?: StyleProp<ViewStyle>;
	testID?: string;
	/** Stable English label used by screen readers and automation. */
	accessibilityLabel?: string;
}

const AVATAR_SIZE_MAP: Record<AvatarSize, number> = {
	sm: 32,
	md: 44,
	lg: 56,
	xl: 72,
};
// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- status badges scale proportionally with avatar size.
const STATUS_DOT_SIZE_RATIO = 0.26;

function getInitials(name: string) {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((segment) => segment.charAt(0).toUpperCase())
		.join('');
}

function pickAvatarColor(name: string, colors: readonly string[], fallbackColor: string) {
	if (colors.length === 0) {
		return fallbackColor;
	}

	const hash = Array.from(name).reduce((total, character) => total + character.charCodeAt(0), 0);
	return colors[hash % colors.length] ?? colors[0];
}

export const Avatar = forwardRef<React.ElementRef<typeof View>, AvatarProps>(
	({ name, source, size = 'md', status, style, testID, accessibilityLabel }, ref) => {
		const { theme } = useTheme();
		const [imageFailed, setImageFailed] = useState(false);
		const sizePx = AVATAR_SIZE_MAP[size];
		const initials = useMemo(() => getInitials(name), [name]);
		const backgroundColor = useMemo(
			() =>
				pickAvatarColor(
					name,
					theme.collections.partyAvatarColors,
					theme.colors.placeholder,
				),
			[name, theme.collections.partyAvatarColors, theme.colors.placeholder],
		);

		const statusColor =
			status === 'online'
				? theme.colors.success
				: status === 'busy'
					? theme.colors.warning
					: status === 'warning'
						? theme.colors.error
						: theme.colors.onSurfaceVariant;

		return (
			<View
				ref={ref}
				testID={testID}
				accessible={true}
				accessibilityRole="image"
				accessibilityLabel={accessibilityLabel ?? `${name} avatar`}
				style={[
					styles.container,
					{
						width: sizePx,
						height: sizePx,
						borderRadius: sizePx / 2,
						backgroundColor,
					},
					style,
				]}
			>
				{source && !imageFailed ? (
					<ExpoImage
						source={{ uri: source }}
						style={{ width: sizePx, height: sizePx, borderRadius: sizePx / 2 }}
						contentFit="cover"
						cachePolicy="memory-disk"
						priority="high"
						recyclingKey={source}
						onError={() => setImageFailed(true)}
						accessible={false}
					/>
				) : (
					<ThemedText
						variant={size === 'xl' ? 'bodyStrong' : 'captionBold'}
						style={{ color: theme.colors.white }}
					>
						{initials}
					</ThemedText>
				)}

				{status ? (
					<View
						accessible={false}
						style={[
							styles.statusDot,
							{
								width: Math.max(10, Math.round(sizePx * STATUS_DOT_SIZE_RATIO)),
								height: Math.max(10, Math.round(sizePx * STATUS_DOT_SIZE_RATIO)),
								borderRadius:
									Math.max(10, Math.round(sizePx * STATUS_DOT_SIZE_RATIO)) / 2,
								backgroundColor: statusColor,
								borderColor: theme.colors.card,
							},
						]}
					/>
				) : null}
			</View>
		);
	},
);

Avatar.displayName = 'Avatar';

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
	},
	statusDot: {
		position: 'absolute',
		bottom: 0,
		end: 0,
		borderWidth: 2,
	},
});
