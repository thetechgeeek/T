import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { OtpCodeInput } from '../OtpCodeInput';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('OtpCodeInput', () => {
	it('splits pasted codes across cells', () => {
		const onChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<OtpCodeInput label="OTP" onChange={onChange} testID="otp" />,
		);
		fireEvent.changeText(getByTestId('otp-0'), '123456');
		expect(onChange).toHaveBeenCalledWith('123456');
	});

	it('supports masked display', () => {
		const { getByTestId } = renderWithTheme(
			<OtpCodeInput label="OTP" value="123456" masked onChange={jest.fn()} testID="otp" />,
		);
		expect(getByTestId('otp-0')).toHaveProp('value', '•');
	});
});
