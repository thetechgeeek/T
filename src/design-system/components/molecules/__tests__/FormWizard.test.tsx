import React from 'react';
import { act, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithTheme } from '../../../../../__tests__/utils/renderWithTheme';
import { FormWizard, type FormWizardStep } from '../FormWizard';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

// Declarative multi-step validation can run slower when the full design-system suite is saturated.
jest.setTimeout(30000);

describe('FormWizard', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('validates one step at a time, allows jump-back navigation, and completes with combined values', async () => {
		const onComplete = jest.fn().mockResolvedValue(undefined);
		const steps: FormWizardStep[] = [
			{
				id: 'scope',
				label: 'Scope',
				description: 'Capture the owning team and workflow owner.',
				fields: [
					{
						name: 'teamName',
						label: 'Owning team',
						required: true,
						requiredMessage: 'Owning team is required.',
					},
					{
						name: 'ownerEmail',
						label: 'Workflow owner email',
						required: true,
						requiredMessage: 'Workflow owner email is required.',
						pattern: EMAIL_PATTERN,
						patternMessage: 'Enter a valid workflow owner email.',
					},
				],
			},
			{
				id: 'review',
				label: 'Review flow',
				description: 'Collect the approval routing details.',
				fields: [
					{
						name: 'approvalCode',
						label: 'Approval code',
						required: true,
						requiredMessage: 'Approval code is required before continuing.',
					},
				],
			},
			{
				id: 'confirm',
				label: 'Confirm',
				description: 'Finalize the workflow launch settings.',
				fields: [
					{
						name: 'includeExecutiveSummary',
						type: 'toggle',
						label: 'Include executive summary',
						description: 'Completed steps remain clickable for quick edits.',
						defaultValue: true,
					},
				],
			},
		];

		const screen = renderWithTheme(
			<FormWizard
				title="Wizard form"
				description="Multi-step form proof"
				steps={steps}
				backLabel="Back"
				nextLabel="Next step"
				completeLabel="Finish setup"
				onComplete={onComplete}
				testID="wizard"
			/>,
		);

		expect(screen.getByLabelText('Scope step')).toBeTruthy();
		expect(screen.getByText('Owning team')).toBeTruthy();

		fireEvent.press(screen.getByText('Next step'));
		await waitFor(() => expect(screen.getByText('Owning team is required.')).toBeTruthy());
		expect(screen.queryByText('Approval code')).toBeNull();

		fireEvent.changeText(screen.getByTestId('wizard-form-teamName'), 'Operations');
		fireEvent.changeText(screen.getByTestId('wizard-form-ownerEmail'), 'ops.lead@example.com');
		fireEvent.press(screen.getByText('Next step'));

		await waitFor(() => expect(screen.getByText('Approval code')).toBeTruthy());

		fireEvent.changeText(screen.getByTestId('wizard-form-approvalCode'), 'APR-42');
		fireEvent.press(screen.getByText('Next step'));

		await waitFor(() => expect(screen.getByText('Include executive summary')).toBeTruthy());

		fireEvent.press(screen.getByLabelText('Scope step'));
		expect(screen.getByText('Owning team')).toBeTruthy();
		expect(screen.queryByText('Approval code')).toBeNull();

		fireEvent.press(screen.getByText('Next step'));
		await waitFor(() => expect(screen.getByText('Approval code')).toBeTruthy());

		fireEvent.press(screen.getByText('Next step'));
		await waitFor(() => expect(screen.getByText('Include executive summary')).toBeTruthy());

		await act(async () => {
			fireEvent.press(screen.getByText('Finish setup'));
		});

		await waitFor(() =>
			expect(onComplete).toHaveBeenCalledWith({
				teamName: 'Operations',
				ownerEmail: 'ops.lead@example.com',
				approvalCode: 'APR-42',
				includeExecutiveSummary: 'true',
			}),
		);
	});
});
