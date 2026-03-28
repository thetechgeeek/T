import React from 'react';
import {
	TouchableOpacity,
	Text,
	StyleSheet,
	ActivityIndicator,
	type TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

export interface ButtonProps extends TouchableOpacityProps {
	title?: string;
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
	size?: 'sm' | 'md' | 'lg';
	loading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

export function Button({
	title,
	variant = 'primary',
	size = 'md',
	loading = false,
	leftIcon,
	rightIcon,
	style,
	disabled,
	...props
}: ButtonProps) {
	const { theme } = useTheme();
	const c = theme.colors;
	const r = theme.borderRadius;

	const getVariantStyles = () => {
		switch (variant) {
			case 'secondary':
				return { bg: c.surfaceVariant, text: c.onSurfaceVariant, border: 'transparent' };
			case 'outline':
				return { bg: 'transparent', text: c.primary, border: c.primary };
			case 'ghost':
				return { bg: 'transparent', text: c.primary, border: 'transparent' };
			case 'danger':
				return { bg: c.error, text: c.onError, border: 'transparent' };
			case 'primary':
			default:
				return { bg: c.primary, text: c.onPrimary, border: 'transparent' };
		}
	};

	const getSizeStyles = () => {
		switch (size) {
			case 'sm':
				return { height: 36, px: 16, fontSize: theme.typography.sizes.sm };
			case 'lg':
				return { height: 56, px: 32, fontSize: theme.typography.sizes.lg };
			case 'md':
			default:
				return { height: 48, px: 24, fontSize: theme.typography.sizes.md };
		}
	};

	const v = getVariantStyles();
	const s = getSizeStyles();

	const isOutline = variant === 'outline';
	const isDisabled = disabled || loading;

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			disabled={isDisabled}
			accessibilityRole="button"
			accessibilityLabel={title}
			accessibilityState={{ disabled: isDisabled, busy: loading }}
			style={[
				styles.button,
				{
					backgroundColor:
						isDisabled && !isOutline && variant !== 'ghost' ? c.surfaceVariant : v.bg,
					borderColor: isDisabled && isOutline ? c.border : v.border,
					borderWidth: isOutline ? 1 : 0,
					borderRadius: r.md,
					height: s.height,
					paddingHorizontal: s.px,
				},
				style,
			]}
			{...props}
		>
			{loading ? (
				<ActivityIndicator
					testID="loading-indicator"
					color={isOutline || variant === 'ghost' ? c.primary : v.text}
				/>
			) : (
				<>
					{leftIcon && <React.Fragment>{leftIcon}</React.Fragment>}
					<Text
						style={[
							styles.label,
							{
								color: isDisabled ? c.placeholder : v.text,
								fontSize: s.fontSize,
								fontWeight: theme.typography.weights.semibold,
								marginLeft: leftIcon ? 8 : 0,
								marginRight: rightIcon ? 8 : 0,
							},
						]}
					>
						{title}
					</Text>
					{rightIcon && <React.Fragment>{rightIcon}</React.Fragment>}
				</>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	label: {},
});
