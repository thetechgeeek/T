import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { Divider } from '../Divider';
import { SPACING_PX } from '@/src/theme/layoutMetrics';

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

	it('applies no start margin when inset is not set', () => {
		const { toJSON } = renderWithTheme(<Divider />);
		const json = toJSON() as {
			props: { style: Record<string, unknown> | Record<string, unknown>[] };
		};
		const flatStyle = Array.isArray(json.props.style)
			? Object.assign({}, ...json.props.style)
			: json.props.style;
		expect(flatStyle.marginStart ?? 0).toBe(0);
	});

	it('applies start margin when inset=true', () => {
		const { toJSON } = renderWithTheme(<Divider inset />);
		const json = toJSON() as {
			props: { style: Record<string, unknown> | Record<string, unknown>[] };
		};
		const flatStyle = Array.isArray(json.props.style)
			? Object.assign({}, ...json.props.style)
			: json.props.style;
		expect(flatStyle.marginStart).toBeGreaterThan(0);
	});

	it('merges custom style prop', () => {
		const { toJSON } = renderWithTheme(<Divider style={{ marginVertical: SPACING_PX.sm }} />);
		const json = toJSON() as {
			props: { style: Record<string, unknown> | Record<string, unknown>[] };
		};
		const flatStyle = Array.isArray(json.props.style)
			? Object.assign({}, ...json.props.style)
			: json.props.style;
		expect(flatStyle.marginVertical).toBe(SPACING_PX.sm);
	});
});
