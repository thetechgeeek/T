import React from 'react';
import { render } from '@testing-library/react-native';
import { Search } from 'lucide-react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { LucideIconGlyph, MaterialIconGlyph, resolveAccessibleIconSize } from '../iconography';

describe('design-system iconography helpers', () => {
	it('scales icon size with the runtime font scale when enabled', () => {
		expect(resolveAccessibleIconSize(20, 1.3)).toBeGreaterThan(20);
	});

	it('keeps icon size fixed when accessibility scaling is disabled', () => {
		expect(resolveAccessibleIconSize(20, 1.3, false)).toBe(20);
	});

	it('renders Lucide and Material adapters with the shared scaling contract', () => {
		const scaledSize = resolveAccessibleIconSize(20, 1.3);
		const { getByTestId } = render(
			<ThemeProvider persist={false} runtimeOverrides={{ fontScale: 1.3 }}>
				<>
					<LucideIconGlyph testID="lucide-icon" icon={Search} size={20} color="#111111" />
					<MaterialIconGlyph
						testID="material-icon"
						name="calendar-month"
						size={20}
						color="#111111"
					/>
				</>
			</ThemeProvider>,
		);

		expect(getByTestId('lucide-icon').props.size).toBe(scaledSize);
		expect(getByTestId('material-icon').props.size).toBe(scaledSize);
		expect(getByTestId('material-icon').props.allowFontScaling).toBe(true);
	});
});
