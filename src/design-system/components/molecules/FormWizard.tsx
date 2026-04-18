import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Button } from '@/src/design-system/components/atoms/Button';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import {
	DeclarativeForm,
	type DeclarativeFormDensity,
	type DeclarativeFormField,
	type DeclarativeFormHandle,
	type DeclarativeFormValues,
} from '@/src/design-system/components/molecules/DeclarativeForm';
import { Stepper, type StepperStep } from '@/src/design-system/components/molecules/Stepper';

export interface FormWizardStep {
	id: string;
	label: string;
	description?: string;
	fields: readonly DeclarativeFormField[];
}

export interface FormWizardProps {
	title: string;
	description: string;
	steps: readonly FormWizardStep[];
	values?: DeclarativeFormValues;
	defaultValues?: DeclarativeFormValues;
	onValuesChange?: (values: DeclarativeFormValues) => void;
	step?: string;
	defaultStep?: string;
	onStepChange?: (stepId: string) => void;
	density?: DeclarativeFormDensity;
	backLabel: string;
	nextLabel: string;
	completeLabel: string;
	onComplete?: (values: DeclarativeFormValues) => Promise<void> | void;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

function buildWizardDefaultValues(
	steps: readonly FormWizardStep[],
	defaultValues?: DeclarativeFormValues,
) {
	const nextValues: DeclarativeFormValues = { ...(defaultValues ?? {}) };

	for (const step of steps) {
		for (const field of step.fields) {
			if ((field.type ?? 'text') === 'toggle') {
				const toggleField = field as Extract<DeclarativeFormField, { type: 'toggle' }>;
				nextValues[field.name] =
					defaultValues?.[field.name] ?? String(toggleField.defaultValue ?? false);
				continue;
			}

			const valueField = field as Exclude<DeclarativeFormField, { type: 'toggle' }>;
			nextValues[field.name] = defaultValues?.[field.name] ?? valueField.defaultValue ?? '';
		}
	}

	return nextValues;
}

export const FormWizard = forwardRef<View, FormWizardProps>(
	(
		{
			title,
			description,
			steps,
			values,
			defaultValues,
			onValuesChange,
			step,
			defaultStep,
			onStepChange,
			density = 'dense',
			backLabel,
			nextLabel,
			completeLabel,
			onComplete,
			style,
			testID,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const resolvedDefaultValues = useMemo(
			() => buildWizardDefaultValues(steps, defaultValues),
			[defaultValues, steps],
		);
		const [wizardValues, setWizardValues] = useControllableState({
			value: values,
			defaultValue: resolvedDefaultValues,
			onChange: (nextValues) => onValuesChange?.(nextValues),
		});
		const [currentStepId, setCurrentStepId] = useControllableState({
			value: step,
			defaultValue: defaultStep ?? steps[0]?.id ?? '',
			onChange: (nextStepId) => onStepChange?.(nextStepId),
		});
		const [maxCompletedStepIndex, setMaxCompletedStepIndex] = useState(-1);
		const [errorStepId, setErrorStepId] = useState<string | null>(null);
		const [isCompleting, setIsCompleting] = useState(false);
		const formRef = useRef<DeclarativeFormHandle | null>(null);
		const currentStepIndex = Math.max(
			steps.findIndex((wizardStep) => wizardStep.id === currentStepId),
			0,
		);
		const currentStep = steps[currentStepIndex] ?? steps[0];
		const stepperSteps: StepperStep[] = steps.map((wizardStep, index) => ({
			label: wizardStep.label,
			value: wizardStep.id,
			description: wizardStep.description,
			state:
				errorStepId === wizardStep.id
					? 'error'
					: index < currentStepIndex || index <= maxCompletedStepIndex
						? 'completed'
						: index === currentStepIndex
							? 'active'
							: 'upcoming',
		}));

		return (
			<View
				ref={ref}
				testID={testID}
				style={[
					{
						gap: theme.spacing.lg,
					},
					style,
				]}
			>
				<View style={{ gap: theme.spacing.xxs }}>
					<ThemedText variant="sectionTitle" style={{ color: theme.colors.onSurface }}>
						{title}
					</ThemedText>
					<ThemedText variant="body" style={{ color: theme.colors.onSurfaceVariant }}>
						{description}
					</ThemedText>
				</View>

				<Stepper
					steps={stepperSteps}
					onStepPress={(stepId) => {
						const nextIndex = steps.findIndex((wizardStep) => wizardStep.id === stepId);
						if (nextIndex >= 0 && nextIndex <= maxCompletedStepIndex) {
							setCurrentStepId(stepId);
						}
					}}
					testID={testID ? `${testID}-stepper` : undefined}
				/>

				{currentStep ? (
					<DeclarativeForm
						ref={formRef}
						title={currentStep.label}
						description={currentStep.description ?? description}
						fields={currentStep.fields}
						values={wizardValues}
						onValuesChange={setWizardValues}
						density={density}
						testID={testID ? `${testID}-form` : undefined}
						footer={
							<View
								style={{
									flexDirection: 'row',
									flexWrap: 'wrap',
									gap: theme.spacing.sm,
								}}
							>
								{currentStepIndex > 0 ? (
									<Button
										title={backLabel}
										variant="outline"
										onPress={() => {
											setErrorStepId(null);
											setCurrentStepId(
												steps[currentStepIndex - 1]?.id ?? currentStep.id,
											);
										}}
									/>
								) : null}
								<Button
									title={
										currentStepIndex === steps.length - 1
											? completeLabel
											: nextLabel
									}
									loading={isCompleting}
									onPress={() => {
										void formRef.current
											?.validateFields(
												currentStep.fields.map((field) => field.name),
											)
											.then(async (isStepValid) => {
												if (!isStepValid) {
													setErrorStepId(currentStep.id);
													return;
												}

												setErrorStepId(null);
												setMaxCompletedStepIndex((currentMax) =>
													Math.max(currentMax, currentStepIndex),
												);
												if (currentStepIndex < steps.length - 1) {
													setCurrentStepId(
														steps[currentStepIndex + 1]?.id ??
															currentStep.id,
													);
													return;
												}

												if (!onComplete) {
													return;
												}

												setIsCompleting(true);
												try {
													await onComplete(
														formRef.current?.getValues() ??
															wizardValues,
													);
												} finally {
													setIsCompleting(false);
												}
											});
									}}
								/>
							</View>
						}
					/>
				) : null}
			</View>
		);
	},
);

FormWizard.displayName = 'FormWizard';
