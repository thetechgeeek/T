import React, { forwardRef, useMemo, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

const TRACK_WIDTH = 240;
const DEFAULT_SINGLE_VALUE = 25;
const DEFAULT_RANGE_START = 25;
const DEFAULT_RANGE_END = 75;

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function snap(value: number, step: number) {
	return Math.round(value / step) * step;
}

type SliderValue = number | [number, number];

export interface RangeSliderProps {
	label: string;
	value?: SliderValue;
	defaultValue?: SliderValue;
	range?: boolean;
	min?: number;
	max?: number;
	step?: number;
	showTooltip?: boolean;
	onChange: (value: SliderValue) => void;
	onValueChange?: (value: SliderValue, meta?: { source: 'selection' }) => void;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export const RangeSlider = forwardRef<View, RangeSliderProps>(
	(
		{
			label,
			value,
			defaultValue,
			range = false,
			min = 0,
			max = 100,
			step = 5,
			showTooltip = true,
			onChange,
			onValueChange,
			testID,
			style,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const [activeHandle, setActiveHandle] = useState<number | null>(null);
		const [currentValue, setCurrentValue] = useControllableState({
			value,
			defaultValue:
				defaultValue ??
				(range ? [DEFAULT_RANGE_START, DEFAULT_RANGE_END] : DEFAULT_SINGLE_VALUE),
			onChange: (nextValue) => {
				onChange(nextValue);
				onValueChange?.(nextValue, { source: 'selection' });
			},
		});

		const normalizedValue = Array.isArray(currentValue)
			? currentValue
			: [currentValue, currentValue];
		const [startValue, endValue] = normalizedValue;
		const startPercent = ((startValue - min) / (max - min)) * 100;
		const endPercent = ((endValue - min) / (max - min)) * 100;
		const startOffset = (startPercent / 100) * TRACK_WIDTH;
		const endOffset = (endPercent / 100) * TRACK_WIDTH;

		const updateHandle = (handleIndex: number, deltaX: number) => {
			const deltaValue = (deltaX / TRACK_WIDTH) * (max - min);
			if (!range) {
				const nextValue = clamp(snap(startValue + deltaValue, step), min, max);
				setCurrentValue(nextValue, { source: 'selection' });
				return;
			}

			if (handleIndex === 0) {
				const nextStart = clamp(snap(startValue + deltaValue, step), min, endValue);
				setCurrentValue([nextStart, endValue], { source: 'selection' });
				return;
			}

			const nextEnd = clamp(snap(endValue + deltaValue, step), startValue, max);
			setCurrentValue([startValue, nextEnd], { source: 'selection' });
		};

		const buildHandleGesture = (handleIndex: number) =>
			Gesture.Pan()
				.runOnJS(true)
				.onBegin(() => setActiveHandle(handleIndex))
				.onChange((event) => updateHandle(handleIndex, event.changeX))
				.onFinalize(() => setActiveHandle(null));

		const selectedTrackStyle = useMemo(
			() => ({
				position: 'absolute' as const,
				left: startOffset,
				width: range ? endOffset - startOffset : startOffset,
				height: '100%' as const,
				backgroundColor: c.primary,
				borderRadius: theme.borderRadius.full,
			}),
			[c.primary, endOffset, range, startOffset, theme.borderRadius.full],
		);

		return (
			<View ref={ref} testID={testID} style={style}>
				<ThemedText
					variant="label"
					style={{ color: c.onSurfaceVariant, marginBottom: theme.spacing.xs }}
				>
					{label}
				</ThemedText>
				<View
					style={{
						width: TRACK_WIDTH,
						justifyContent: 'center',
					}}
				>
					<View
						style={{
							height: theme.borderWidth.lg * 2,
							backgroundColor: c.surfaceVariant,
							borderRadius: theme.borderRadius.full,
						}}
					>
						<View style={selectedTrackStyle} />
					</View>

					{[
						{
							index: 0,
							left: startOffset,
							valueLabel: startValue,
						},
						...(range
							? [
									{
										index: 1,
										left: endOffset,
										valueLabel: endValue,
									},
								]
							: []),
					].map((handle) => (
						<GestureDetector
							key={handle.index}
							gesture={buildHandleGesture(handle.index)}
						>
							<View
								style={{
									position: 'absolute',
									top: -theme.spacing.xs,
									left: handle.left,
									marginStart: -theme.spacing.xs,
									alignItems: 'center',
								}}
							>
								{showTooltip && activeHandle === handle.index ? (
									<View
										style={{
											paddingHorizontal: theme.spacing.xs,
											paddingVertical: theme.spacing.xxs,
											borderRadius: theme.borderRadius.sm,
											backgroundColor: c.onSurface,
											marginBottom: theme.spacing.xs,
										}}
									>
										<ThemedText
											variant="captionBold"
											style={{ color: c.surface }}
										>
											{handle.valueLabel}
										</ThemedText>
									</View>
								) : null}
								<Pressable
									testID={`${testID ?? 'range-slider'}-handle-${handle.index}`}
									accessibilityRole="adjustable"
									accessibilityLabel={`${label} handle ${handle.index + 1}`}
									accessibilityValue={{
										min,
										max,
										now: handle.valueLabel,
										text: String(handle.valueLabel),
									}}
									style={{
										width: theme.spacing.lg,
										height: theme.spacing.lg,
										borderRadius: theme.borderRadius.full,
										backgroundColor: c.primary,
										borderWidth: theme.borderWidth.sm,
										borderColor: c.surface,
									}}
								/>
							</View>
						</GestureDetector>
					))}
				</View>
			</View>
		);
	},
);

RangeSlider.displayName = 'RangeSlider';
