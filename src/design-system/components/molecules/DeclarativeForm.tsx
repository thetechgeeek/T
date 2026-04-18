import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	View,
	type NativeSyntheticEvent,
	type ScrollView as NativeScrollView,
	type StyleProp,
	type TextInput,
	type TextInputSubmitEditingEventData,
	type ViewStyle,
} from 'react-native';
import { Lock } from 'lucide-react-native';
import { useControllableState } from '@/src/hooks/useControllableState';
import { announceForScreenReader } from '@/src/utils/accessibility';
import { useTheme } from '@/src/theme/ThemeProvider';
import { LucideIconGlyph } from '@/src/design-system/iconography';
import { triggerDesignSystemHaptic } from '@/src/design-system/haptics';
import { Badge } from '@/src/design-system/components/atoms/Badge';
import { Button } from '@/src/design-system/components/atoms/Button';
import { ThemedText } from '@/src/design-system/components/atoms/ThemedText';
import { AlertBanner } from '@/src/design-system/components/molecules/AlertBanner';
import { FormField } from '@/src/design-system/components/molecules/FormField';
import { TextAreaField } from '@/src/design-system/components/molecules/TextAreaField';
import { ToggleSwitch } from '@/src/design-system/components/atoms/ToggleSwitch';

export type DeclarativeFormValues = Record<string, string>;
export type DeclarativeFormMode = 'edit' | 'read-only';
export type DeclarativeFormDensity = 'relaxed' | 'dense';

type FieldVisibilityResolver = (values: DeclarativeFormValues) => boolean;
type FieldReadOnlyFormatter = (value: string, values: DeclarativeFormValues) => string;
type FieldFormatValidator = (value: string, values: DeclarativeFormValues) => string | undefined;
type FieldAsyncValidator = (
	value: string,
	values: DeclarativeFormValues,
) => Promise<string | undefined>;

export interface DeclarativeFormStatusCopy {
	saving: string;
	saved: string;
	error: string;
	retry: string;
}

export interface DeclarativeFormConflictState {
	title: string;
	description: string;
	actionLabel?: string;
	onAction?: () => void;
}

interface DeclarativeFormBaseField {
	name: string;
	label: string;
	placeholder?: string;
	helperText?: string;
	warningText?: string;
	required?: boolean;
	requiredMessage?: string;
	disabledReason?: string;
	readOnlyFormatter?: FieldReadOnlyFormatter;
	visibleWhen?: FieldVisibilityResolver;
	testID?: string;
}

export interface DeclarativeFormTextField extends DeclarativeFormBaseField {
	type?: 'text';
	defaultValue?: string;
	keyboardType?: React.ComponentProps<typeof FormField>['keyboardType'];
	autoCapitalize?: React.ComponentProps<typeof FormField>['autoCapitalize'];
	secureTextEntry?: boolean;
	formatValidator?: FieldFormatValidator;
	pattern?: RegExp;
	patternMessage?: string;
	asyncValidator?: FieldAsyncValidator;
	asyncDebounceMs?: number;
	asyncSuccessAnnouncement?: string;
}

export interface DeclarativeFormTextareaField extends DeclarativeFormBaseField {
	type: 'textarea';
	defaultValue?: string;
	maxLength?: number;
	maxLines?: number;
}

export interface DeclarativeFormToggleField extends DeclarativeFormBaseField {
	type: 'toggle';
	defaultValue?: boolean;
	description?: string;
}

export type DeclarativeFormField =
	| DeclarativeFormTextField
	| DeclarativeFormTextareaField
	| DeclarativeFormToggleField;

export interface DeclarativeFormHandle {
	focusField: (fieldName: string) => void;
	getValues: () => DeclarativeFormValues;
	scrollToField: (fieldName: string) => void;
	validateFields: (fieldNames?: readonly string[]) => Promise<boolean>;
}

export interface DeclarativeFormProps {
	title: string;
	description: string;
	fields: readonly DeclarativeFormField[];
	values?: DeclarativeFormValues;
	defaultValues?: DeclarativeFormValues;
	onValuesChange?: (values: DeclarativeFormValues) => void;
	mode?: DeclarativeFormMode;
	density?: DeclarativeFormDensity;
	submitLabel?: string;
	onSubmit?: (
		values: DeclarativeFormValues,
	) => Promise<Record<string, string> | void> | Record<string, string> | void;
	footer?: React.ReactNode;
	draftStatusCopy?: DeclarativeFormStatusCopy;
	onDraftSave?: (values: DeclarativeFormValues) => Promise<void> | void;
	draftSaveDelayMs?: number;
	draftConflict?: DeclarativeFormConflictState;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}

type DraftStatus = 'idle' | 'saving' | 'saved' | 'error';

// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- autosave should wait long enough to avoid noisy status churn while typing.
const DEFAULT_DRAFT_SAVE_DELAY_MS = 800;
const FORM_INPUT_TYPES = new Set<DeclarativeFormField['type']>(['text', 'textarea']);

function buildInitialValues(
	fields: readonly DeclarativeFormField[],
	defaultValues?: DeclarativeFormValues,
) {
	const nextValues: DeclarativeFormValues = { ...(defaultValues ?? {}) };

	for (const field of fields) {
		if (field.type === 'toggle') {
			nextValues[field.name] =
				defaultValues?.[field.name] ?? String(field.defaultValue ?? false);
			continue;
		}

		nextValues[field.name] = defaultValues?.[field.name] ?? field.defaultValue ?? '';
	}

	return nextValues;
}

function resolveFieldType(field: DeclarativeFormField) {
	return field.type ?? 'text';
}

function filterFieldMap(fieldMap: Record<string, string>, visibleFieldNames: ReadonlySet<string>) {
	return Object.fromEntries(
		Object.entries(fieldMap).filter(([fieldName]) => visibleFieldNames.has(fieldName)),
	);
}

function DeclarativeReadOnlyField({
	label,
	value,
	helperText,
}: {
	label: string;
	value: string;
	helperText?: string;
}) {
	const { theme } = useTheme();
	const c = theme.colors;

	return (
		<View
			style={{
				borderWidth: theme.borderWidth.sm,
				borderColor: c.border,
				borderRadius: theme.borderRadius.md,
				paddingHorizontal: theme.spacing.md,
				paddingVertical: theme.spacing.md,
				backgroundColor: theme.visual.surfaces.quiet,
				gap: theme.spacing.xxs,
			}}
		>
			<ThemedText variant="label" style={{ color: c.onSurfaceVariant }}>
				{label}
			</ThemedText>
			<ThemedText variant="body" style={{ color: c.onSurface }}>
				{value}
			</ThemedText>
			{helperText ? (
				<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
					{helperText}
				</ThemedText>
			) : null}
		</View>
	);
}

export const DeclarativeForm = forwardRef<DeclarativeFormHandle, DeclarativeFormProps>(
	(
		{
			title,
			description,
			fields,
			values,
			defaultValues,
			onValuesChange,
			mode = 'edit',
			density = 'relaxed',
			submitLabel,
			onSubmit,
			footer,
			draftStatusCopy,
			onDraftSave,
			draftSaveDelayMs = DEFAULT_DRAFT_SAVE_DELAY_MS,
			draftConflict,
			style,
			testID,
		},
		ref,
	) => {
		const { theme } = useTheme();
		const c = theme.colors;
		const resolvedDefaultValues = useMemo(
			() => buildInitialValues(fields, defaultValues),
			[defaultValues, fields],
		);
		const [formValues, setFormValues] = useControllableState({
			value: values,
			defaultValue: resolvedDefaultValues,
			onChange: (nextValues) => onValuesChange?.(nextValues),
		});
		const [formatErrors, setFormatErrors] = useState<Record<string, string>>({});
		const [blurErrors, setBlurErrors] = useState<Record<string, string>>({});
		const [asyncErrors, setAsyncErrors] = useState<Record<string, string>>({});
		const [asyncPending, setAsyncPending] = useState<Record<string, boolean>>({});
		const [internalServerErrors, setInternalServerErrors] = useState<Record<string, string>>(
			{},
		);
		const [draftStatus, setDraftStatus] = useState<DraftStatus>('idle');
		const [isSubmitting, setIsSubmitting] = useState(false);
		const inputRefs = useRef<Record<string, TextInput | null>>({});
		const fieldOffsets = useRef<Record<string, number>>({});
		const scrollRef = useRef<NativeScrollView | null>(null);
		const asyncValidationTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
		const asyncValidationTickets = useRef<Record<string, number>>({});
		const didMountRef = useRef(false);
		const lastSavedSnapshotRef = useRef(JSON.stringify(resolvedDefaultValues));

		const visibleFields = useMemo(
			() =>
				fields.filter((field) => {
					if (!field.visibleWhen) {
						return true;
					}

					return field.visibleWhen(formValues);
				}),
			[fields, formValues],
		);
		const visibleFieldNameSet = useMemo(
			() => new Set(visibleFields.map((field) => field.name)),
			[visibleFields],
		);
		const combinedServerErrors = useMemo(
			() => filterFieldMap(internalServerErrors, visibleFieldNameSet),
			[internalServerErrors, visibleFieldNameSet],
		);
		const filteredFormatErrors = useMemo(
			() => filterFieldMap(formatErrors, visibleFieldNameSet),
			[formatErrors, visibleFieldNameSet],
		);
		const filteredBlurErrors = useMemo(
			() => filterFieldMap(blurErrors, visibleFieldNameSet),
			[blurErrors, visibleFieldNameSet],
		);
		const filteredAsyncErrors = useMemo(
			() => filterFieldMap(asyncErrors, visibleFieldNameSet),
			[asyncErrors, visibleFieldNameSet],
		);
		const focusableFieldNames = useMemo(
			() =>
				visibleFields
					.filter(
						(field) =>
							mode !== 'read-only' &&
							FORM_INPUT_TYPES.has(resolveFieldType(field)) &&
							!field.disabledReason,
					)
					.map((field) => field.name),
			[mode, visibleFields],
		);
		const formSnapshot = useMemo(() => JSON.stringify(formValues), [formValues]);

		const scrollToField = useCallback(
			(fieldName: string) => {
				const y = fieldOffsets.current[fieldName];
				if (typeof y !== 'number') {
					return;
				}

				scrollRef.current?.scrollTo({
					y: Math.max(y - theme.spacing.sm, 0),
					animated: true,
				});
			},
			[theme.spacing.sm],
		);

		const focusField = useCallback(
			(fieldName: string) => {
				scrollToField(fieldName);
				inputRefs.current[fieldName]?.focus();
			},
			[scrollToField],
		);

		const getFieldError = useCallback(
			(fieldName: string) =>
				filteredFormatErrors[fieldName] ??
				filteredBlurErrors[fieldName] ??
				filteredAsyncErrors[fieldName] ??
				combinedServerErrors[fieldName],
			[combinedServerErrors, filteredAsyncErrors, filteredBlurErrors, filteredFormatErrors],
		);

		const clearFieldErrorState = useCallback((fieldName: string) => {
			setBlurErrors((current) => {
				if (!current[fieldName]) {
					return current;
				}

				const nextErrors = { ...current };
				delete nextErrors[fieldName];
				return nextErrors;
			});
			setInternalServerErrors((current) => {
				if (!current[fieldName]) {
					return current;
				}

				const nextErrors = { ...current };
				delete nextErrors[fieldName];
				return nextErrors;
			});
		}, []);

		const runBlurValidation = useCallback(
			(field: DeclarativeFormField, nextValues: DeclarativeFormValues) => {
				const nextValue = nextValues[field.name] ?? '';

				if (field.required && nextValue.trim().length === 0) {
					return field.requiredMessage;
				}

				if (
					'pattern' in field &&
					field.pattern &&
					nextValue &&
					!field.pattern.test(nextValue)
				) {
					return field.patternMessage;
				}

				return undefined;
			},
			[],
		);

		const queueAsyncValidation = useCallback(
			(field: DeclarativeFormTextField, nextValues: DeclarativeFormValues) => {
				if (!field.asyncValidator || mode === 'read-only' || field.disabledReason) {
					return;
				}

				const currentValue = nextValues[field.name] ?? '';
				const existingTimeout = asyncValidationTimeouts.current[field.name];
				if (existingTimeout) {
					clearTimeout(existingTimeout);
				}

				if (currentValue.trim().length === 0) {
					setAsyncPending((current) => {
						if (!current[field.name]) {
							return current;
						}

						const nextPending = { ...current };
						delete nextPending[field.name];
						return nextPending;
					});
					setAsyncErrors((current) => {
						if (!current[field.name]) {
							return current;
						}

						const nextErrors = { ...current };
						delete nextErrors[field.name];
						return nextErrors;
					});
					return;
				}

				setAsyncPending((current) => ({ ...current, [field.name]: true }));
				const ticket = (asyncValidationTickets.current[field.name] ?? 0) + 1;
				asyncValidationTickets.current[field.name] = ticket;
				asyncValidationTimeouts.current[field.name] = setTimeout(() => {
					void field
						.asyncValidator?.(currentValue, nextValues)
						.then(async (nextError) => {
							if (asyncValidationTickets.current[field.name] !== ticket) {
								return;
							}

							setAsyncPending((current) => {
								const nextPending = { ...current };
								delete nextPending[field.name];
								return nextPending;
							});
							setAsyncErrors((current) => {
								if (!nextError && !current[field.name]) {
									return current;
								}

								const nextErrors = { ...current };
								if (nextError) {
									nextErrors[field.name] = nextError;
								} else {
									delete nextErrors[field.name];
								}
								return nextErrors;
							});
							await announceForScreenReader(
								nextError ?? field.asyncSuccessAnnouncement,
							);
						})
						.catch(async () => {
							if (asyncValidationTickets.current[field.name] !== ticket) {
								return;
							}

							setAsyncPending((current) => {
								const nextPending = { ...current };
								delete nextPending[field.name];
								return nextPending;
							});
						});
				}, field.asyncDebounceMs ?? draftSaveDelayMs);
			},
			[draftSaveDelayMs, mode],
		);

		const handleFieldValueChange = useCallback(
			(field: DeclarativeFormField, nextValue: string) => {
				const nextValues = {
					...formValues,
					[field.name]: nextValue,
				};
				setFormValues(nextValues);
				clearFieldErrorState(field.name);

				if ('formatValidator' in field && field.formatValidator) {
					const nextFormatError = field.formatValidator(nextValue, nextValues);
					setFormatErrors((current) => {
						if (!nextFormatError && !current[field.name]) {
							return current;
						}

						const nextErrors = { ...current };
						if (nextFormatError) {
							nextErrors[field.name] = nextFormatError;
						} else {
							delete nextErrors[field.name];
						}
						return nextErrors;
					});
				}

				if (resolveFieldType(field) === 'text') {
					queueAsyncValidation(field as DeclarativeFormTextField, nextValues);
				}
			},
			[clearFieldErrorState, formValues, queueAsyncValidation, setFormValues],
		);

		const handleFieldBlur = useCallback(
			(field: DeclarativeFormField) => {
				const nextError = runBlurValidation(field, formValues);
				setBlurErrors((current) => {
					if (!nextError && !current[field.name]) {
						return current;
					}

					const nextErrors = { ...current };
					if (nextError) {
						nextErrors[field.name] = nextError;
					} else {
						delete nextErrors[field.name];
					}
					return nextErrors;
				});
			},
			[formValues, runBlurValidation],
		);

		const validateFields = useCallback(
			async (fieldNames?: readonly string[]) => {
				const targetFieldNameSet = fieldNames ? new Set(fieldNames) : null;
				const nextBlurErrors = filterFieldMap(blurErrors, visibleFieldNameSet);
				let firstErrorFieldName: string | undefined;
				let firstErrorMessage: string | undefined;

				for (const field of visibleFields) {
					if (targetFieldNameSet && !targetFieldNameSet.has(field.name)) {
						continue;
					}

					const nextBlurError = runBlurValidation(field, formValues);
					if (nextBlurError) {
						nextBlurErrors[field.name] = nextBlurError;
					} else {
						delete nextBlurErrors[field.name];
					}

					const nextFieldError =
						filteredFormatErrors[field.name] ??
						nextBlurError ??
						filteredAsyncErrors[field.name] ??
						combinedServerErrors[field.name];
					if (!firstErrorFieldName && nextFieldError) {
						firstErrorFieldName = field.name;
						firstErrorMessage = nextFieldError;
					}
				}

				setBlurErrors(nextBlurErrors);

				if (!firstErrorFieldName) {
					return true;
				}

				scrollToField(firstErrorFieldName);
				await triggerDesignSystemHaptic('error');
				await announceForScreenReader(firstErrorMessage);
				return false;
			},
			[
				blurErrors,
				combinedServerErrors,
				filteredAsyncErrors,
				filteredFormatErrors,
				formValues,
				runBlurValidation,
				scrollToField,
				visibleFieldNameSet,
				visibleFields,
			],
		);

		const submitForm = useCallback(async () => {
			const isValid = await validateFields();
			if (!isValid || !onSubmit) {
				return false;
			}

			setIsSubmitting(true);
			try {
				const nextServerErrors = await onSubmit(formValues);
				if (nextServerErrors && Object.keys(nextServerErrors).length > 0) {
					setInternalServerErrors(nextServerErrors);
					const [firstServerFieldName] = Object.keys(nextServerErrors);
					if (firstServerFieldName) {
						scrollToField(firstServerFieldName);
						await triggerDesignSystemHaptic('error');
						await announceForScreenReader(nextServerErrors[firstServerFieldName]);
					}
					return false;
				}

				return true;
			} finally {
				setIsSubmitting(false);
			}
		}, [formValues, onSubmit, scrollToField, validateFields]);

		useImperativeHandle(
			ref,
			() => ({
				focusField,
				getValues: () => formValues,
				scrollToField,
				validateFields,
			}),
			[focusField, formValues, scrollToField, validateFields],
		);

		useEffect(() => {
			return () => {
				for (const timeout of Object.values(asyncValidationTimeouts.current)) {
					clearTimeout(timeout);
				}
			};
		}, []);

		useEffect(() => {
			if (!onDraftSave || !draftStatusCopy || mode === 'read-only') {
				return;
			}

			if (!didMountRef.current) {
				didMountRef.current = true;
				lastSavedSnapshotRef.current = formSnapshot;
				return;
			}

			if (formSnapshot === lastSavedSnapshotRef.current) {
				return;
			}

			const timeout = setTimeout(() => {
				setDraftStatus('saving');
				void Promise.resolve(onDraftSave(formValues))
					.then(async () => {
						lastSavedSnapshotRef.current = JSON.stringify(formValues);
						setDraftStatus('saved');
						await announceForScreenReader(draftStatusCopy.saved);
					})
					.catch(async () => {
						setDraftStatus('error');
						await announceForScreenReader(draftStatusCopy.error);
					});
			}, draftSaveDelayMs);

			return () => {
				clearTimeout(timeout);
			};
		}, [draftSaveDelayMs, draftStatusCopy, formSnapshot, formValues, mode, onDraftSave]);

		const draftStatusLabel =
			draftStatus === 'saving'
				? draftStatusCopy?.saving
				: draftStatus === 'saved'
					? draftStatusCopy?.saved
					: draftStatus === 'error'
						? draftStatusCopy?.error
						: null;
		const draftStatusVariant =
			draftStatus === 'saved' ? 'success' : draftStatus === 'error' ? 'warning' : 'info';
		const outerGap = density === 'dense' ? theme.spacing.md : theme.spacing.lg;
		const fieldGap = density === 'dense' ? theme.spacing.sm : theme.spacing.md;

		return (
			<View
				testID={testID}
				style={[
					{
						gap: outerGap,
					},
					style,
				]}
			>
				<View style={{ gap: theme.spacing.xxs }}>
					<ThemedText variant="sectionTitle" style={{ color: c.onSurface }}>
						{title}
					</ThemedText>
					<ThemedText variant="body" style={{ color: c.onSurfaceVariant }}>
						{description}
					</ThemedText>
				</View>

				{draftConflict ? (
					<AlertBanner
						title={draftConflict.title}
						description={draftConflict.description}
						variant="warning"
						actionLabel={draftConflict.actionLabel}
						onAction={draftConflict.onAction}
					/>
				) : null}

				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
					<ScrollView
						ref={scrollRef}
						testID={testID ? `${testID}-scroll` : undefined}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
						contentContainerStyle={{ gap: fieldGap }}
					>
						{visibleFields.map((field) => {
							const fieldType = resolveFieldType(field);
							const currentValue = formValues[field.name] ?? '';
							const isDisabled = Boolean(field.disabledReason);
							const helperText = isDisabled ? field.disabledReason : field.helperText;
							const error = getFieldError(field.name);
							const fieldTestId =
								field.testID ?? `${testID ?? 'declarative-form'}-${field.name}`;

							return (
								<View
									key={field.name}
									onLayout={(event) => {
										fieldOffsets.current[field.name] =
											event.nativeEvent.layout.y;
									}}
								>
									{mode === 'read-only' ? (
										<DeclarativeReadOnlyField
											label={field.label}
											value={
												field.readOnlyFormatter
													? field.readOnlyFormatter(
															currentValue,
															formValues,
														)
													: currentValue
											}
											helperText={helperText}
										/>
									) : fieldType === 'textarea' ? (
										<TextAreaField
											ref={(nextRef) => {
												inputRefs.current[field.name] = nextRef;
											}}
											label={field.label}
											value={currentValue}
											onChange={(nextValue) =>
												handleFieldValueChange(field, nextValue)
											}
											placeholder={field.placeholder}
											helperText={helperText}
											warningText={field.warningText}
											error={error}
											required={field.required}
											maxLength={
												(field as DeclarativeFormTextareaField).maxLength
											}
											maxLines={
												(field as DeclarativeFormTextareaField).maxLines
											}
											onFocus={() => scrollToField(field.name)}
											onBlur={() => handleFieldBlur(field)}
											testID={fieldTestId}
										/>
									) : fieldType === 'toggle' ? (
										<ToggleSwitch
											label={field.label}
											description={
												helperText ??
												(field as DeclarativeFormToggleField).description
											}
											value={currentValue === 'true'}
											onValueChange={(nextValue) =>
												handleFieldValueChange(field, String(nextValue))
											}
											disabled={isDisabled}
											testID={fieldTestId}
										/>
									) : (
										<FormField
											ref={(nextRef) => {
												inputRefs.current[field.name] = nextRef;
											}}
											label={field.label}
											value={currentValue}
											onValueChange={(nextValue) =>
												handleFieldValueChange(field, nextValue)
											}
											placeholder={field.placeholder}
											helperText={helperText}
											warningText={field.warningText}
											error={error}
											required={field.required}
											editable={!isDisabled}
											loading={Boolean(asyncPending[field.name])}
											rightIcon={
												isDisabled ? (
													<LucideIconGlyph
														icon={Lock}
														size={16}
														color={c.onSurfaceVariant}
													/>
												) : undefined
											}
											keyboardType={
												(field as DeclarativeFormTextField).keyboardType
											}
											autoCapitalize={
												(field as DeclarativeFormTextField).autoCapitalize
											}
											secureTextEntry={
												(field as DeclarativeFormTextField).secureTextEntry
											}
											returnKeyType={
												focusableFieldNames.includes(field.name) &&
												focusableFieldNames.indexOf(field.name) <
													focusableFieldNames.length - 1
													? 'next'
													: (field as DeclarativeFormTextField)
																.asyncValidator || onSubmit
														? 'go'
														: 'done'
											}
											onSubmitEditing={(
												_event: NativeSyntheticEvent<TextInputSubmitEditingEventData>,
											) => {
												const currentIndex = focusableFieldNames.indexOf(
													field.name,
												);
												const nextFieldName =
													currentIndex >= 0
														? focusableFieldNames[currentIndex + 1]
														: undefined;

												if (nextFieldName) {
													focusField(nextFieldName);
													return;
												}

												if (submitLabel && onSubmit) {
													void submitForm();
												}
											}}
											onFocus={() => scrollToField(field.name)}
											onBlur={() => handleFieldBlur(field)}
											testID={fieldTestId}
										/>
									)}
								</View>
							);
						})}
					</ScrollView>
				</KeyboardAvoidingView>

				{footer ?? (
					<View style={{ gap: theme.spacing.sm }}>
						{draftStatusLabel ? (
							<View
								style={{
									flexDirection: 'row',
									flexWrap: 'wrap',
									gap: theme.spacing.sm,
								}}
							>
								<Badge
									label={draftStatusLabel}
									variant={draftStatusVariant}
									size="sm"
								/>
								{draftStatus === 'error' && draftStatusCopy && onDraftSave ? (
									<Button
										title={draftStatusCopy.retry}
										variant="outline"
										size="sm"
										onPress={() => {
											setDraftStatus('idle');
											void Promise.resolve(onDraftSave(formValues))
												.then(async () => {
													lastSavedSnapshotRef.current =
														JSON.stringify(formValues);
													setDraftStatus('saved');
													await announceForScreenReader(
														draftStatusCopy.saved,
													);
												})
												.catch(async () => {
													setDraftStatus('error');
													await announceForScreenReader(
														draftStatusCopy.error,
													);
												});
										}}
									/>
								) : null}
							</View>
						) : null}
						{submitLabel && onSubmit ? (
							<Button
								title={submitLabel}
								onPress={() => {
									void submitForm();
								}}
								loading={isSubmitting}
							/>
						) : null}
					</View>
				)}
			</View>
		);
	},
);

DeclarativeForm.displayName = 'DeclarativeForm';
