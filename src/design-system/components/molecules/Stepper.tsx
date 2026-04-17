import React, { forwardRef } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';

export type StepState = 'completed' | 'active' | 'upcoming' | 'error';

export interface StepperStep {
	label: string;
	value: string;
	state: StepState;
	description?: string;
}

export interface StepperProps {
	steps: StepperStep[];
	orientation?: 'horizontal' | 'vertical';
	onStepPress?: (value: string) => void;
	testID?: string;
	style?: StyleProp<ViewStyle>;
}

export const Stepper = forwardRef<View, StepperProps>(
	({ steps, orientation = 'horizontal', onStepPress, testID, style }, ref) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const isVertical = orientation === 'vertical';

		return (
			<View
				ref={ref}
				testID={testID}
				style={[
					{
						flexDirection: isVertical ? 'column' : 'row',
						gap: theme.spacing.md,
					},
					style,
				]}
			>
				{steps.map((step, index) => {
					const badgeVariant =
						step.state === 'completed'
							? 'success'
							: step.state === 'error'
								? 'error'
								: step.state === 'active'
									? 'info'
									: 'neutral';
					return (
						<Pressable
							key={step.value}
							testID={`${testID ?? 'stepper'}-${step.value}`}
							onPress={() => {
								if (step.state === 'completed' && onStepPress) {
									onStepPress(step.value);
								}
							}}
							disabled={step.state !== 'completed' || !onStepPress}
							accessibilityRole="button"
							accessibilityLabel={`${step.label} step`}
							accessibilityState={{ disabled: step.state !== 'completed' }}
							style={{
								flex: isVertical ? 0 : 1,
								flexDirection: 'row',
								alignItems: 'flex-start',
								gap: theme.spacing.sm,
							}}
						>
							<Badge label={String(index + 1)} variant={badgeVariant} />
							<View style={{ flex: 1 }}>
								<ThemedText variant="bodyStrong" style={{ color: c.onSurface }}>
									{step.label}
								</ThemedText>
								{step.description ? (
									<ThemedText
										variant="caption"
										style={{
											color: c.onSurfaceVariant,
											marginTop: theme.spacing.xxs,
										}}
									>
										{step.description}
									</ThemedText>
								) : null}
							</View>
						</Pressable>
					);
				})}
			</View>
		);
	},
);

Stepper.displayName = 'Stepper';
