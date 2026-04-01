import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { Divider } from '../Divider';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Divider', () => {
	it('renders without crashing', () => {
		const { toJSON } = renderWithTheme(<Divider />);
		expect(toJSON()).toBeTruthy();
	});

	it('renders a View with height 1 (horizontal divider by default)', () => {
		const { toJSON } = renderWithTheme(<Divider />);
		const json = toJSON() as { type: string };
		// The outermost element is the styled View
		expect(json.type).toBe('View');
	});

	it('applies no leftMargin when inset is not set', () => {
		const { toJSON } = renderWithTheme(<Divider />);
		const json = toJSON() as {
			props: { style: Record<string, unknown> | Record<string, unknown>[] };
		};
		const flatStyle = Array.isArray(json.props.style)
			? Object.assign({}, ...json.props.style)
			: json.props.style;
		expect(flatStyle.marginLeft ?? 0).toBe(0);
	});

	it('applies marginLeft when inset=true', () => {
		const { toJSON } = renderWithTheme(<Divider inset />);
		const json = toJSON() as {
			props: { style: Record<string, unknown> | Record<string, unknown>[] };
		};
		const flatStyle = Array.isArray(json.props.style)
			? Object.assign({}, ...json.props.style)
			: json.props.style;
		expect(flatStyle.marginLeft).toBeGreaterThan(0);
	});

	it('merges custom style prop', () => {
		const { toJSON } = renderWithTheme(<Divider style={{ marginVertical: 8 }} />);
		const json = toJSON() as {
			props: { style: Record<string, unknown> | Record<string, unknown>[] };
		};
		const flatStyle = Array.isArray(json.props.style)
			? Object.assign({}, ...json.props.style)
			: json.props.style;
		expect(flatStyle.marginVertical).toBe(8);
	});
});
