import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { Stepper } from '../Stepper';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('Stepper', () => {
	it('renders horizontal steps with state badges', () => {
		const { getByText } = renderWithTheme(
			<Stepper
				steps={[
					{ label: 'Details', value: 'details', state: 'completed' },
					{ label: 'Approval', value: 'approval', state: 'active' },
					{ label: 'Archive', value: 'archive', state: 'upcoming' },
				]}
			/>,
		);
		expect(getByText('Details')).toBeTruthy();
		expect(getByText('Approval')).toBeTruthy();
		expect(getByText('Archive')).toBeTruthy();
	});

	it('allows non-linear jump to completed steps', () => {
		const onStepPress = jest.fn();
		const { getByText } = renderWithTheme(
			<Stepper
				onStepPress={onStepPress}
				steps={[
					{ label: 'Details', value: 'details', state: 'completed' },
					{ label: 'Approval', value: 'approval', state: 'active' },
				]}
			/>,
		);
		fireEvent.press(getByText('Details'));
		expect(onStepPress).toHaveBeenCalledWith('details');
	});
});
