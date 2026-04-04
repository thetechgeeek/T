import React from 'react';
import { Text } from 'react-native';
import { renderWithTheme } from '../../../../__tests__/utils/renderWithTheme';
import { Badge } from '../Badge';

describe('Badge', () => {
	it('renders label correctly', () => {
		const { getByText } = renderWithTheme(<Badge label="Success" variant="success" />);
		expect(getByText('Success')).toBeTruthy();
	});

	it('renders label "Paid" with variant="success"', () => {
		const { getByText } = renderWithTheme(<Badge label="Paid" variant="success" />);
		expect(getByText('Paid')).toBeTruthy();
	});

	it('variant="success" — text element has a defined color style', () => {
		const { UNSAFE_getAllByType } = renderWithTheme(<Badge label="Paid" variant="success" />);
		const texts = UNSAFE_getAllByType(Text);
		const labelText = texts.find((t) => (t.props.children as string | undefined) === 'Paid');
		expect(labelText).toBeDefined();
		const styles = Array.isArray(labelText!.props.style)
			? Object.assign({}, ...labelText!.props.style)
			: labelText!.props.style;
		expect(styles.color).toBeTruthy();
	});

	it('variant="error" — renders with error label', () => {
		const { getByText } = renderWithTheme(<Badge label="Overdue" variant="error" />);
		expect(getByText('Overdue')).toBeTruthy();
	});

	it('variant="error" — text element has a defined color style', () => {
		const { UNSAFE_getAllByType } = renderWithTheme(<Badge label="Overdue" variant="error" />);
		const texts = UNSAFE_getAllByType(Text);
		const labelText = texts.find((t) => t.props.children === 'Overdue');
		expect(labelText).toBeDefined();
		const styles = Array.isArray(labelText!.props.style)
			? Object.assign({}, ...labelText!.props.style)
			: labelText!.props.style;
		expect(styles.color).toBeTruthy();
	});

	it('variant="warning" — renders with warning label', () => {
		const { getByText } = renderWithTheme(<Badge label="Pending" variant="warning" />);
		expect(getByText('Pending')).toBeTruthy();
	});

	it('variant="warning" — text element has a defined color style', () => {
		const { UNSAFE_getAllByType } = renderWithTheme(
			<Badge label="Pending" variant="warning" />,
		);
		const texts = UNSAFE_getAllByType(Text);
		const labelText = texts.find((t) => t.props.children === 'Pending');
		expect(labelText).toBeDefined();
		const styles = Array.isArray(labelText!.props.style)
			? Object.assign({}, ...labelText!.props.style)
			: labelText!.props.style;
		expect(styles.color).toBeTruthy();
	});

	it('renders info and neutral variants correctly', () => {
		const { getByText: getI } = renderWithTheme(<Badge label="Info" variant="info" />);
		const { getByText: getN } = renderWithTheme(<Badge label="Neutral" variant="neutral" />);
		expect(getI('Info')).toBeTruthy();
		expect(getN('Neutral')).toBeTruthy();
	});

	it('renders small size correctly', () => {
		const { getByText } = renderWithTheme(<Badge label="Small" size="sm" />);
		expect(getByText('Small')).toBeTruthy();
	});
});
