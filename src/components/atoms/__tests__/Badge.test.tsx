import React from 'react';
import { render } from '@testing-library/react-native';
import { Badge } from '../Badge';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('Badge', () => {
  it('renders label correctly', () => {
    const { getByText } = renderWithTheme(<Badge label="Success" variant="success" />);
    expect(getByText('Success')).toBeTruthy();
  });
});
