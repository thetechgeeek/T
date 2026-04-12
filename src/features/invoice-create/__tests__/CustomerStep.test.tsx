import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { CustomerStep } from '../CustomerStep';
import { renderWithTheme } from '@/__tests__/utils/renderWithTheme';

const mockSetCustomer = jest.fn();
const mockSetIsInterState = jest.fn();

const mockSetInvoiceDate = jest.fn();
const mockSetInvoiceNumber = jest.fn();
const mockSetIsCashSale = jest.fn();

function makeProps(overrides = {}) {
	return {
		customer: null,
		setCustomer: mockSetCustomer,
		isInterState: false,
		setIsInterState: mockSetIsInterState,
		invoiceDate: '2026-04-12',
		setInvoiceDate: mockSetInvoiceDate,
		invoiceNumber: 'INV-001',
		setInvoiceNumber: mockSetInvoiceNumber,
		isCashSale: false,
		setIsCashSale: mockSetIsCashSale,
		...overrides,
	};
}

beforeEach(() => jest.clearAllMocks());

describe('CustomerStep', () => {
	it('renders Customer Details heading', () => {
		const { getByText } = renderWithTheme(<CustomerStep {...makeProps()} />);
		expect(getByText('Customer Details')).toBeTruthy();
	});

	it('renders Name field with placeholder', () => {
		const { getByPlaceholderText } = renderWithTheme(<CustomerStep {...makeProps()} />);
		expect(getByPlaceholderText('e.g. Rahul Sharma')).toBeTruthy();
	});

	it('renders Phone field with placeholder', () => {
		const { getByPlaceholderText } = renderWithTheme(<CustomerStep {...makeProps()} />);
		expect(getByPlaceholderText('10-digit mobile number')).toBeTruthy();
	});

	it('renders GSTIN field with placeholder', () => {
		const { getByPlaceholderText } = renderWithTheme(<CustomerStep {...makeProps()} />);
		expect(getByPlaceholderText('22AAAAA0000A1Z5')).toBeTruthy();
	});

	it('calls setCustomer with updated name on change', () => {
		const { getByPlaceholderText } = renderWithTheme(<CustomerStep {...makeProps()} />);
		fireEvent.changeText(getByPlaceholderText('e.g. Rahul Sharma'), 'Rajesh');
		expect(mockSetCustomer).toHaveBeenCalled();
	});

	it('calls setCustomer with updated phone on change', () => {
		const { getByPlaceholderText } = renderWithTheme(<CustomerStep {...makeProps()} />);
		fireEvent.changeText(getByPlaceholderText('10-digit mobile number'), '9876543210');
		expect(mockSetCustomer).toHaveBeenCalled();
	});

	it('populates Name field from customer prop', () => {
		const { getByDisplayValue } = renderWithTheme(
			<CustomerStep {...makeProps({ customer: { name: 'Suresh', phone: '', gstin: '' } })} />,
		);
		expect(getByDisplayValue('Suresh')).toBeTruthy();
	});

	it('shows Inter-State toggle with "No" when isInterState=false', () => {
		const { getByText } = renderWithTheme(<CustomerStep {...makeProps()} />);
		expect(getByText('Inter-State (IGST): No')).toBeTruthy();
	});

	it('shows Inter-State toggle with "Yes" when isInterState=true', () => {
		const { getByText } = renderWithTheme(
			<CustomerStep {...makeProps({ isInterState: true })} />,
		);
		expect(getByText('Inter-State (IGST): Yes')).toBeTruthy();
	});

	it('calls setIsInterState when inter-state toggle pressed', () => {
		const { getByText } = renderWithTheme(<CustomerStep {...makeProps()} />);
		fireEvent.press(getByText('Inter-State (IGST): No'));
		expect(mockSetIsInterState).toHaveBeenCalledWith(true);
	});

	it('calls setIsInterState(false) when already true and pressed', () => {
		const { getByText } = renderWithTheme(
			<CustomerStep {...makeProps({ isInterState: true })} />,
		);
		fireEvent.press(getByText('Inter-State (IGST): Yes'));
		expect(mockSetIsInterState).toHaveBeenCalledWith(false);
	});

	it('toggle has accessibilityRole togglebutton', () => {
		const { toJSON } = renderWithTheme(<CustomerStep {...makeProps()} />);
		expect(JSON.stringify(toJSON())).toContain('"togglebutton"');
	});
});
