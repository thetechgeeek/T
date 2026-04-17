import React, { forwardRef, useMemo, useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useTheme } from '@/src/theme/ThemeProvider';
import { primitiveColorPalettes } from '@/src/theme/palette';
import { SegmentedControl } from '@/src/design-system/components/molecules/SegmentedControl';
import { TextInput } from '@/src/design-system/components/atoms/TextInput';

const HUE_SEGMENT_DEGREES = 60;
const FULL_HUE_DEGREES = 360;

function componentToHex(value: number) {
	return value.toString(16).padStart(2, '0').toUpperCase();
}

function normalizeHex(value: string) {
	const trimmed = value.replace('#', '').trim();
	if (trimmed.length === 3) {
		return `#${trimmed
			.split('')
			.map((char) => char.repeat(2))
			.join('')
			.toUpperCase()}`;
	}

	if (trimmed.length !== 6) {
		return DEFAULT_COLOR;
	}

	return `#${trimmed.toUpperCase()}`;
}

function hexToRgb(value: string) {
	const hex = normalizeHex(value).slice(1);
	return {
		r: Number.parseInt(hex.slice(0, 2), 16),
		g: Number.parseInt(hex.slice(2, 4), 16),
		b: Number.parseInt(hex.slice(4, 6), 16),
	};
}

function rgbToHex(r: number, g: number, b: number) {
	return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

function rgbToHsl(r: number, g: number, b: number) {
	const red = r / 255;
	const green = g / 255;
	const blue = b / 255;
	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);
	const delta = max - min;
	let hue = 0;
	const lightness = (max + min) / 2;
	const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

	if (delta !== 0) {
		if (max === red) {
			hue = ((green - blue) / delta) % 6;
		} else if (max === green) {
			hue = (blue - red) / delta + 2;
		} else {
			hue = (red - green) / delta + 4;
		}
	}

	return {
		h: Math.round(
			hue * HUE_SEGMENT_DEGREES < 0
				? hue * HUE_SEGMENT_DEGREES + FULL_HUE_DEGREES
				: hue * HUE_SEGMENT_DEGREES,
		),
		s: Math.round(saturation * 100),
		l: Math.round(lightness * 100),
	};
}

function hslToHex(h: number, s: number, l: number) {
	const saturation = s / 100;
	const lightness = l / 100;
	const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
	const huePrime = h / HUE_SEGMENT_DEGREES;
	const secondary = chroma * (1 - Math.abs((huePrime % 2) - 1));
	const match = lightness - chroma / 2;

	let red = 0;
	let green = 0;
	let blue = 0;

	if (huePrime >= 0 && huePrime < 1) {
		red = chroma;
		green = secondary;
	} else if (huePrime < 2) {
		red = secondary;
		green = chroma;
	} else if (huePrime < 3) {
		green = chroma;
		blue = secondary;
	} else if (huePrime < 4) {
		green = secondary;
		blue = chroma;
	} else if (huePrime < 5) {
		red = secondary;
		blue = chroma;
	} else {
		red = chroma;
		blue = secondary;
	}

	return rgbToHex(
		Math.round((red + match) * 255),
		Math.round((green + match) * 255),
		Math.round((blue + match) * 255),
	);
}

export interface ColorPickerProps {
	label: string;
	value?: string;
	defaultValue?: string;
	onChange: (value: string) => void;
	onValueChange?: (value: string, meta?: { source: 'selection' }) => void;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

const DEFAULT_COLOR = primitiveColorPalettes.primary[600];
const COLOR_SWATCHES = [
	primitiveColorPalettes.primary[600],
	primitiveColorPalettes.success[700],
	primitiveColorPalettes.warning[600],
	primitiveColorPalettes.error[600],
	primitiveColorPalettes.neutral[900],
];

export const ColorPicker = forwardRef<View, ColorPickerProps>(
	(
		{ label, value, defaultValue = DEFAULT_COLOR, onChange, onValueChange, testID, style },
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [mode, setMode] = useState('hex');
		const [currentValue, setCurrentValue] = useControllableState({
			value,
			defaultValue,
			onChange: (nextValue) => {
				onChange(nextValue);
				onValueChange?.(nextValue, { source: 'selection' });
			},
		});
		const rgb = useMemo(() => hexToRgb(currentValue), [currentValue]);
		const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb.b, rgb.g, rgb.r]);

		return (
			<View ref={ref} testID={testID} style={style}>
				<SegmentedControl
					label={label}
					options={[
						{ label: 'Hex', value: 'hex' },
						{ label: 'RGB', value: 'rgb' },
						{ label: 'HSL', value: 'hsl' },
					]}
					value={mode}
					onChange={setMode}
				/>
				<View
					style={{
						width: theme.spacing['4xl'],
						height: theme.spacing['4xl'],
						borderRadius: theme.borderRadius.md,
						backgroundColor: currentValue,
						marginTop: theme.spacing.md,
						marginBottom: theme.spacing.md,
					}}
				/>
				{mode === 'hex' ? (
					<TextInput
						label="Hex value"
						value={currentValue}
						onChangeText={(nextValue) =>
							setCurrentValue(normalizeHex(nextValue), { source: 'selection' })
						}
					/>
				) : null}
				{mode === 'rgb' ? (
					<View style={{ gap: theme.spacing.sm }}>
						<TextInput
							label="Red"
							value={String(rgb.r)}
							onChangeText={(nextValue) =>
								setCurrentValue(
									rgbToHex(Number.parseInt(nextValue || '0', 10), rgb.g, rgb.b),
									{ source: 'selection' },
								)
							}
						/>
						<TextInput
							label="Green"
							value={String(rgb.g)}
							onChangeText={(nextValue) =>
								setCurrentValue(
									rgbToHex(rgb.r, Number.parseInt(nextValue || '0', 10), rgb.b),
									{ source: 'selection' },
								)
							}
						/>
						<TextInput
							label="Blue"
							value={String(rgb.b)}
							onChangeText={(nextValue) =>
								setCurrentValue(
									rgbToHex(rgb.r, rgb.g, Number.parseInt(nextValue || '0', 10)),
									{ source: 'selection' },
								)
							}
						/>
					</View>
				) : null}
				{mode === 'hsl' ? (
					<View style={{ gap: theme.spacing.sm }}>
						<TextInput
							label="Hue"
							value={String(hsl.h)}
							onChangeText={(nextValue) =>
								setCurrentValue(
									hslToHex(Number.parseInt(nextValue || '0', 10), hsl.s, hsl.l),
									{ source: 'selection' },
								)
							}
						/>
						<TextInput
							label="Saturation"
							value={String(hsl.s)}
							onChangeText={(nextValue) =>
								setCurrentValue(
									hslToHex(hsl.h, Number.parseInt(nextValue || '0', 10), hsl.l),
									{ source: 'selection' },
								)
							}
						/>
						<TextInput
							label="Lightness"
							value={String(hsl.l)}
							onChangeText={(nextValue) =>
								setCurrentValue(
									hslToHex(hsl.h, hsl.s, Number.parseInt(nextValue || '0', 10)),
									{ source: 'selection' },
								)
							}
						/>
					</View>
				) : null}
				<View
					style={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						gap: theme.spacing.sm,
						marginTop: theme.spacing.md,
					}}
				>
					{COLOR_SWATCHES.map((swatch) => (
						<Pressable
							key={swatch}
							testID={`${testID ?? 'color-picker'}-${swatch}`}
							onPress={() => setCurrentValue(swatch, { source: 'selection' })}
							accessibilityRole="button"
							accessibilityLabel={`Select ${swatch}`}
							style={{
								width: theme.spacing.xl,
								height: theme.spacing.xl,
								borderRadius: theme.borderRadius.md,
								backgroundColor: swatch,
								borderWidth:
									currentValue === swatch
										? theme.borderWidth.md
										: theme.borderWidth.sm,
								borderColor: currentValue === swatch ? c.onSurface : c.border,
							}}
						/>
					))}
				</View>
			</View>
		);
	},
);

ColorPicker.displayName = 'ColorPicker';
