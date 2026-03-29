module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { isolatedModules: true, tsconfig: { jsx: 'react-jsx' } }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|lucide-react-native|immer|zustand|@testing-library)/)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^expo-file-system$': '<rootDir>/src/__mocks__/expo-file-system.ts',
    '^expo-file-system/legacy$': '<rootDir>/src/__mocks__/expo-file-system.ts',
    '^expo-sharing$': '<rootDir>/src/__mocks__/expo-sharing.ts',
    '^expo-print$': '<rootDir>/src/__mocks__/expo-print.ts',
    '^expo-document-picker$': '<rootDir>/src/__mocks__/expo-document-picker.ts',
  },
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts'
  ],
};
