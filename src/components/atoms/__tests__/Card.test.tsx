import React from 'react';
import { render } from '@testing-library/react-native';
import { Card } from '../Card';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { Text } from 'react-native';

const renderWithTheme = (component: React.ReactElement) => {
	return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Card', () => {
	it('renders children correctly', () => {
		const { getByText } = renderWithTheme(
			<Card>
				<Text>Card Content</Text>
			</Card>,
		);
		expect(getByText('Card Content')).toBeTruthy();
	});
});
