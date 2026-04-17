import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PhoneInput } from '../PhoneInput';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) =>
	render(<ThemeProvider>{component}</ThemeProvider>);

describe('PhoneInput', () => {
	it('renders +91 prefix', () => {
		const { getByText } = renderWithTheme(<PhoneInput defaultValue="" onChange={jest.fn()} />);
		expect(getByText('+91')).toBeTruthy();
	});

	it('calls onChange with 10-digit value', () => {
		const onChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<PhoneInput testID="phone" defaultValue="" onChange={onChange} />,
		);
		fireEvent.changeText(getByTestId('phone'), '9876543210');
		expect(onChange).toHaveBeenCalledWith('9876543210');
	});

	it('strips +91 prefix from pasted number', () => {
		const onChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<PhoneInput testID="phone" defaultValue="" onChange={onChange} />,
		);
		fireEvent.changeText(getByTestId('phone'), '+919876543210');
		expect(onChange).toHaveBeenCalledWith('9876543210');
	});

	it('strips spaces and dashes from pasted number', () => {
		const onChange = jest.fn();
		const { getByTestId } = renderWithTheme(
			<PhoneInput testID="phone" defaultValue="" onChange={onChange} />,
		);
		fireEvent.changeText(getByTestId('phone'), '98765 43210');
		expect(onChange).toHaveBeenCalledWith('9876543210');
	});

	it('uses phone-pad keyboard type', () => {
		const { getByTestId } = renderWithTheme(
			<PhoneInput testID="phone" defaultValue="" onChange={jest.fn()} />,
		);
		expect(getByTestId('phone')).toHaveProp('keyboardType', 'phone-pad');
	});

	it('shows error on blur when less than 10 digits', () => {
		const { getByTestId, getByText } = renderWithTheme(
			<PhoneInput testID="phone" defaultValue="" onChange={jest.fn()} />,
		);
		fireEvent.changeText(getByTestId('phone'), '12345');
		fireEvent(getByTestId('phone'), 'blur');
		expect(getByText(/Enter 10 digits/)).toBeTruthy();
	});

	it('does not show error when exactly 10 digits', () => {
		const { getByTestId, queryByText } = renderWithTheme(
			<PhoneInput testID="phone" defaultValue="" onChange={jest.fn()} />,
		);
		fireEvent.changeText(getByTestId('phone'), '9876543210');
		fireEvent(getByTestId('phone'), 'blur');
		expect(queryByText(/Enter 10 digits/)).toBeNull();
	});
});
