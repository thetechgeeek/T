// React Native uses __DEV__ inside node_modules
(global as any).__DEV__ = true;

import React from 'react';

import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Manual mock for react-native components
jest.mock('react-native', () => {
	const React = require('react');
	const View = ({ children, ...props }: any) => React.createElement('View', props, children);
	const Text = ({ children, ...props }: any) => {
		const React = require('react');
		const content = React.Children.toArray(children)
			.map((child: any) =>
				typeof child === 'string' || typeof child === 'number' ? child : '',
			)
			.join('')
			.trim()
			.replace(/\s+/g, ' ');
		return React.createElement('Text', props, content);
	};
	const ScrollView = ({ children, ...props }: any) =>
		React.createElement('ScrollView', props, children);
	const TouchableOpacity = ({ children, onPress, disabled, ...props }: any) => {
		const React = require('react');
		const handlePress = () => {
			if (!disabled && onPress) {
				onPress();
			}
		};
		return React.createElement(
			'TouchableOpacity',
			{ ...props, onPress: handlePress, disabled },
			children,
		);
	};
	const TextInput = (props: any) => React.createElement('TextInput', props);
	const ActivityIndicator = (props: any) =>
		React.createElement('ActivityIndicator', { ...props, testID: 'ActivityIndicator' });
	const Platform = { OS: 'ios', select: jest.fn((o) => o.ios || o.default), Version: 1 };
	const StyleSheet = { create: (s: any) => s, flatten: (s: any) => s, hairlineWidth: 1 };
	const Appearance = {
		getColorScheme: jest.fn(() => 'light'),
		addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
	};
	const Alert = { alert: jest.fn() };
	const KeyboardAvoidingView = ({ children, ...props }: any) =>
		React.createElement('KeyboardAvoidingView', props, children);
	const Touchable = { Mixin: {} };
	const Pressable = ({ children, ...props }: any) =>
		React.createElement('Pressable', props, children);
	const Modal = ({ children, ...props }: any) => React.createElement('Modal', props, children);
	const RefreshControl = (props: any) => React.createElement('RefreshControl', props);
	const FlatList = ({ data, renderItem, keyExtractor }: any) => {
		const React = require('react');
		return React.createElement(
			'View',
			null,
			data.map((item: any, index: number) =>
				React.createElement(
					'View',
					{ key: keyExtractor ? keyExtractor(item, index) : index },
					renderItem({ item, index }),
				),
			),
		);
	};
	const SectionList = ({ sections, renderItem, renderSectionHeader, keyExtractor }: any) => {
		const React = require('react');
		return React.createElement(
			'View',
			null,
			sections.map((section: any, sIndex: number) =>
				React.createElement(
					'View',
					{ key: sIndex },
					renderSectionHeader && renderSectionHeader({ section }),
					section.data.map((item: any, index: number) =>
						React.createElement(
							'View',
							{ key: keyExtractor ? keyExtractor(item, index) : index },
							renderItem({ item, index, section }),
						),
					),
				),
			),
		);
	};

	return {
		View,
		Text,
		ScrollView,
		TouchableOpacity,
		TextInput,
		RNTextInput: TextInput,
		ActivityIndicator,
		Platform,
		StyleSheet,
		Appearance,
		Alert,
		KeyboardAvoidingView,
		Touchable,
		Pressable,
		Modal,
		RefreshControl,
		FlatList,
		SectionList,
	};
});

jest.mock('@react-native-async-storage/async-storage', () =>
	require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-reanimated', () => {
	const Reanimated = require('react-native-reanimated/mock');
	Reanimated.default.call = () => {};
	return Reanimated;
});

jest.mock('expo-router', () => {
	const push = jest.fn();
	const replace = jest.fn();
	const back = jest.fn();
	return {
		useRouter: jest.fn(() => ({ push, replace, back })),
		useLocalSearchParams: () => ({ id: '123' }),
		Tabs: Object.assign(() => null, { Screen: () => null }),
		Stack: Object.assign(() => null, { Screen: () => null }),
	};
});

jest.mock('expo-image', () => ({
	Image: ({ children, ...props }: any) => React.createElement('Image', props, children),
}));

jest.mock('expo-print', () => ({
	printAsync: jest.fn(),
	selectPrinterAsync: jest.fn(),
	printToFileAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
	isAvailableAsync: jest.fn().mockResolvedValue(true),
	shareAsync: jest.fn(),
}));

jest.mock('expo-document-picker', () => ({
	getDocumentAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
	documentDirectory: 'test-dir/',
	writeAsStringAsync: jest.fn(),
	readAsStringAsync: jest.fn(),
	deleteAsync: jest.fn(),
	makeDirectoryAsync: jest.fn(),
	getInfoAsync: jest.fn(),
}));

jest.mock('expo', () => ({
	Constants: {},
}));

jest.mock('expo-font', () => ({
	isLoaded: jest.fn().mockReturnValue(true),
	loadAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-camera', () => ({
	CameraView: 'CameraView',
	useCameraPermissions: jest.fn().mockReturnValue([{ granted: true }, jest.fn()]),
}));

jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => {
			const translations: Record<string, string> = {
				'common.add': 'Add',
				'common.save': 'Save',
				'auth.signIn': 'Sign In',
				'auth.signUp': 'Sign Up',
				'auth.welcome': 'Welcome to TileMaster',
				'auth.subtitle': 'Manage your tiles & ceramics business',
				'auth.setupBusiness': 'Set Up Your Business',
				'auth.email': 'Email',
				'auth.password': 'Password',
			};
			return translations[key] || key;
		},
		i18n: {
			changeLanguage: jest.fn().mockResolvedValue(undefined),
			language: 'en',
		},
	}),
	initReactI18next: {
		type: '3rdParty',
		init: jest.fn(),
	},
}));

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => ({
		t: (key: string) => {
			const translations: Record<string, string> = {
				'common.add': 'Add',
				'common.save': 'Save',
				'auth.signIn': 'Sign In',
				'auth.signUp': 'Sign Up',
				'auth.welcome': 'Welcome to TileMaster',
				'auth.subtitle': 'Manage your tiles & ceramics business',
				'auth.setupBusiness': 'Set Up Your Business',
				'auth.email': 'Email',
				'auth.password': 'Password',
			};
			return translations[key] || key;
		},
		currentLanguage: 'en',
		toggleLanguage: jest.fn(),
		setLanguage: jest.fn(),
		formatCurrency: jest.fn((a) => `₹${a}`),
		formatDate: jest.fn((d) => d),
		formatDateShort: jest.fn((d) => d),
	}),
}));

// Mock lucide-react-native to avoid SVG issues
jest.mock('lucide-react-native', () => {
	const React = require('react');
	return new Proxy(
		{},
		{
			get: (target, prop) => {
				return (props: any) => React.createElement('Icon', { ...props, name: prop });
			},
		},
	);
});

// Mock the Supabase client entirely so no DB operations happen during unit tests
jest.mock('./src/config/supabase', () => ({
	supabase: {
		auth: {
			getUser: jest
				.fn()
				.mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
			getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
			signInWithPassword: jest
				.fn()
				.mockResolvedValue({ data: { user: {}, session: {} }, error: null }),
			signUp: jest.fn().mockResolvedValue({ data: { user: {}, session: null }, error: null }),
			onAuthStateChange: jest
				.fn()
				.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
		},
		from: jest.fn().mockReturnValue({
			select: jest.fn().mockReturnThis(),
			insert: jest.fn().mockReturnThis(),
			update: jest.fn().mockReturnThis(),
			delete: jest.fn().mockReturnThis(),
			eq: jest.fn().mockReturnThis(),
			order: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			single: jest.fn().mockResolvedValue({ data: null, error: null }),
		}),
		rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
	},
}));
