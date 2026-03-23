import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('Button', () => {
  it('renders correctly with title', () => {
    const { getByText } = renderWithTheme(<Button title="Click Me" />);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when clicked', () => {
    const onPressMock = jest.fn();
    const { getByText } = renderWithTheme(<Button title="Tap" onPress={onPressMock} />);
    fireEvent.press(getByText('Tap'));
    expect(onPressMock).toHaveBeenCalled();
  });

  it('is disabled when loading', () => {
    const onPressMock = jest.fn();
    const { getByTestId, queryByText } = renderWithTheme(
      <Button title="Save" loading onPress={onPressMock} />
    );
    // When loading, title is hidden and ActivityIndicator is shown
    expect(queryByText('Save')).toBeFalsy();
    fireEvent.press(getByTestId('ActivityIndicator')); // This depends on your mock
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
