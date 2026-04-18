import React from 'react';
import { AccessibilityInfo, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { act, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import {
	getNativeScrollViewMocks,
	getNativeTextInputMocks,
} from '../../../../../__tests__/utils/rnMockRegistry';
import {
	DeclarativeForm,
	type DeclarativeFormField,
	type DeclarativeFormHandle,
} from '../DeclarativeForm';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

function markFieldLayouts(screen: ReturnType<typeof renderWithTheme>) {
	screen
		.UNSAFE_getAllByType(View)
		.filter((view) => typeof view.props.onLayout === 'function')
		.forEach((view, index) => {
			fireEvent(view, 'layout', {
				nativeEvent: {
					layout: {
						x: 0,
						y: index * 48,
						width: 320,
						height: 48,
					},
				},
			});
		});
}

describe('DeclarativeForm', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders warning, conditional, disabled, and read-only form states', () => {
		const fields: DeclarativeFormField[] = [
			{
				name: 'projectName',
				label: 'Project name',
				helperText: 'Visible to the rollout team and preserved in read-only review mode.',
			},
			{
				name: 'approvalRouting',
				label: 'Approval routing description for teams with legal, procurement, finance, and regional operations stakeholders',
				helperText:
					'Long labels and helper copy should wrap cleanly without breaking the field rhythm.',
				warningText:
					'Keep this routing note short enough for dense enterprise review queues.',
			},
			{
				name: 'requiresManualReview',
				type: 'toggle',
				label: 'Require manual reviewer notes',
				description: 'Toggling this on reveals a conditional notes field.',
			},
			{
				name: 'reviewerNotes',
				type: 'textarea',
				label: 'Manual review notes',
				helperText: 'Only appears when manual review is enabled.',
				visibleWhen: (values) => values.requiresManualReview === 'true',
			},
			{
				name: 'costCenterOverride',
				label: 'Cost center override',
				disabledReason:
					'Locked because only Finance Admins can change this override after submission.',
			},
		];
		const editableScreen = renderWithTheme(
			<DeclarativeForm
				title="Relaxed onboarding form"
				description="Schema-backed forms should support long copy, warnings, and conditional rendering."
				fields={fields}
				testID="forms-relaxed"
			/>,
		);

		expect(editableScreen.getByText('Relaxed onboarding form')).toBeTruthy();
		expect(
			editableScreen.getByText(
				'Visible to the rollout team and preserved in read-only review mode.',
			),
		).toBeTruthy();
		expect(
			editableScreen.getByText(
				'Keep this routing note short enough for dense enterprise review queues.',
			),
		).toBeTruthy();
		expect(
			editableScreen.getByText(
				'Locked because only Finance Admins can change this override after submission.',
			),
		).toBeTruthy();
		expect(editableScreen.queryByText('Manual review notes')).toBeNull();

		fireEvent.press(editableScreen.getByTestId('forms-relaxed-requiresManualReview'));

		expect(editableScreen.getByText('Manual review notes')).toBeTruthy();
		expect(
			editableScreen.getByText('Only appears when manual review is enabled.'),
		).toBeTruthy();

		const readOnlyScreen = renderWithTheme(
			<DeclarativeForm
				title="Read-only form mode"
				description="Read-only mode should render plain text instead of disabled inputs."
				fields={fields}
				mode="read-only"
				defaultValues={{
					projectName: 'Northwind rollout',
					approvalRouting: 'Shared review lane with legal and procurement notes enabled.',
					requiresManualReview: 'true',
					reviewerNotes: 'Manual notes were captured during the escalated review.',
					costCenterOverride: 'Finance controlled',
				}}
				testID="forms-read-only"
			/>,
		);

		expect(readOnlyScreen.getByText('Northwind rollout')).toBeTruthy();
		expect(
			readOnlyScreen.getByText('Manual notes were captured during the escalated review.'),
		).toBeTruthy();
		expect(readOnlyScreen.queryByTestId('forms-read-only-projectName')).toBeNull();
	});

	it('proves validation timing, async validation, server errors, and mobile focus/scroll behavior', async () => {
		jest.useFakeTimers();
		const asyncValidator = jest
			.fn<Promise<string | undefined>, [string, Record<string, string>]>()
			.mockImplementation(async (value) =>
				value === 'taken@example.com'
					? 'That email is already assigned to another approval lane.'
					: undefined,
			);
		const onSubmit = jest.fn().mockResolvedValue({
			submissionCode:
				'Server rejected the submission code. Use a project-specific code instead.',
		});
		const screen = renderWithTheme(
			<DeclarativeForm
				title="Validation proof"
				description="Exercise validation timing, server-side error injection, and keyboard flow."
				fields={[
					{
						name: 'projectName',
						label: 'Project name',
						required: true,
						requiredMessage: 'Project name is required before submission.',
					},
					{
						name: 'approverEmail',
						label: 'Approver email',
						required: true,
						requiredMessage: 'Approver email is required.',
						formatValidator: (value) =>
							value.includes(' ')
								? 'Approver email cannot contain spaces.'
								: undefined,
						pattern: EMAIL_PATTERN,
						patternMessage: 'Enter a valid email address.',
						asyncValidator,
						asyncDebounceMs: 200,
						asyncSuccessAnnouncement: 'Approval lane is available.',
					},
					{
						name: 'submissionCode',
						label: 'Submission code',
						helperText: 'The server can reject this field after submit.',
					},
				]}
				submitLabel="Submit form"
				onSubmit={onSubmit}
				testID="validation-form"
			/>,
		);

		markFieldLayouts(screen);

		const projectInput = screen.getByTestId('validation-form-projectName');
		const emailInput = screen.getByTestId('validation-form-approverEmail');
		const codeInput = screen.getByTestId('validation-form-submissionCode');
		const scrollViewMocks = getNativeScrollViewMocks('validation-form-scroll');
		const codeInputMocks = getNativeTextInputMocks('validation-form-submissionCode');

		expect(projectInput.props.returnKeyType).toBe('next');
		expect(emailInput.props.returnKeyType).toBe('next');
		expect(codeInput.props.returnKeyType).toBe('go');
		expect(scrollViewMocks).toBeDefined();
		expect(codeInputMocks).toBeDefined();

		scrollViewMocks?.scrollTo.mockClear();
		fireEvent(emailInput, 'focus', { nativeEvent: {} });
		expect(scrollViewMocks?.scrollTo).toHaveBeenCalledTimes(1);

		act(() => {
			emailInput.props.onSubmitEditing?.({ nativeEvent: { text: '' } });
		});
		expect(codeInputMocks?.focus).toHaveBeenCalledTimes(1);

		fireEvent.changeText(emailInput, 'bad email');
		expect(screen.getByText('Approver email cannot contain spaces.')).toBeTruthy();

		fireEvent.changeText(emailInput, 'reviewer');
		fireEvent(emailInput, 'blur', { nativeEvent: {} });
		expect(screen.getByText('Enter a valid email address.')).toBeTruthy();

		fireEvent.changeText(emailInput, 'taken@example.com');
		expect(screen.getByLabelText('Input loading')).toBeTruthy();
		await act(async () => {
			jest.advanceTimersByTime(200);
		});
		await waitFor(() =>
			expect(asyncValidator).toHaveBeenLastCalledWith(
				'taken@example.com',
				expect.objectContaining({
					approverEmail: 'taken@example.com',
				}),
			),
		);
		expect(
			screen.getByText('That email is already assigned to another approval lane.'),
		).toBeTruthy();
		expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
			'That email is already assigned to another approval lane.',
		);

		fireEvent.press(screen.getByText('Submit form'));
		await waitFor(() =>
			expect(Haptics.notificationAsync).toHaveBeenCalledWith(
				Haptics.NotificationFeedbackType.Error,
			),
		);
		expect(scrollViewMocks?.scrollTo).toHaveBeenCalled();
		expect(screen.getByText('Project name is required before submission.')).toBeTruthy();

		fireEvent.changeText(projectInput, 'Northwind rollout');
		fireEvent.changeText(emailInput, 'available@example.com');
		await act(async () => {
			jest.advanceTimersByTime(200);
		});
		await waitFor(() =>
			expect(asyncValidator).toHaveBeenLastCalledWith(
				'available@example.com',
				expect.objectContaining({
					projectName: 'Northwind rollout',
					approverEmail: 'available@example.com',
				}),
			),
		);
		await waitFor(() =>
			expect(
				screen.queryByText('That email is already assigned to another approval lane.'),
			).toBeNull(),
		);
		expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
			'Approval lane is available.',
		);

		fireEvent.changeText(codeInput, 'duplicate');
		fireEvent.press(screen.getByText('Submit form'));
		await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
		await waitFor(() =>
			expect(
				screen.getByText(
					'Server rejected the submission code. Use a project-specific code instead.',
				),
			).toBeTruthy(),
		);
		expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
			'Server rejected the submission code. Use a project-specific code instead.',
		);

		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	it('supports autosave retry and imperative focus control', async () => {
		jest.useFakeTimers();
		const onDraftSave = jest
			.fn<Promise<void>, [Record<string, string>]>()
			.mockRejectedValueOnce(new Error('save failed'))
			.mockResolvedValueOnce(undefined);
		const formRef = React.createRef<DeclarativeFormHandle>();
		const screen = renderWithTheme(
			<DeclarativeForm
				ref={formRef}
				title="Draft autosave form"
				description="Autosave should expose status, retry, and imperative focus helpers."
				fields={[
					{
						name: 'projectName',
						label: 'Project name',
						required: true,
						requiredMessage: 'Project name is required.',
					},
					{
						name: 'approverEmail',
						label: 'Approver email',
						pattern: EMAIL_PATTERN,
						patternMessage: 'Enter a valid email address.',
					},
				]}
				draftStatusCopy={{
					saving: 'Saving…',
					saved: 'Saved',
					error: 'Save failed — retry',
					retry: 'Retry save',
				}}
				onDraftSave={onDraftSave}
				draftSaveDelayMs={200}
				draftConflict={{
					title: 'Draft conflict detected',
					description:
						'This draft was reopened after a newer revision landed, so the conflict stays visible.',
				}}
				testID="draft-form"
			/>,
		);

		expect(screen.getByText('Draft conflict detected')).toBeTruthy();

		const projectInput = screen.getByTestId('draft-form-projectName');
		const emailInputMocks = getNativeTextInputMocks('draft-form-approverEmail');

		fireEvent.changeText(projectInput, 'Northwind rollout');
		await act(async () => {
			jest.advanceTimersByTime(200);
		});
		await waitFor(() => expect(onDraftSave).toHaveBeenCalledTimes(1));
		await waitFor(() => expect(screen.getByText('Save failed — retry')).toBeTruthy());

		fireEvent.press(screen.getByText('Retry save'));
		await waitFor(() => expect(onDraftSave).toHaveBeenCalledTimes(2));
		await waitFor(() => expect(screen.getByText('Saved')).toBeTruthy());

		act(() => {
			formRef.current?.focusField('approverEmail');
		});
		expect(formRef.current).not.toBeNull();
		expect(emailInputMocks?.focus).toHaveBeenCalledTimes(1);

		act(() => {
			projectInput.props.onSubmitEditing?.({ nativeEvent: { text: 'Northwind rollout' } });
		});
		expect(emailInputMocks?.focus).toHaveBeenCalledTimes(2);

		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});
});
