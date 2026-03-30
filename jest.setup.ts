/**
 * Global Jest setup for TileMaster.
 *
 * SUPABASE: NOT globally mocked here. Each test file that needs Supabase must declare:
 *   jest.mock('../config/supabase', () => ({ supabase: createSupabaseMock() }))
 * Use the shared builder from __tests__/utils/supabaseMock.ts
 *
 * useLocalSearchParams: Returns {} by default. For tests needing specific params:
 *   import { setMockSearchParams } from '__tests__/utils/mockSearchParams';
 *   beforeEach(() => setMockSearchParams({ id: 'abc' }));
 *
 * Platform OS: Defaults to 'ios'. To override in a test:
 *   import { setPlatformOS, resetPlatformOS } from '__tests__/utils/platformHelpers';
 *   beforeEach(() => setPlatformOS('android'));
 *   afterEach(() => resetPlatformOS());
 */

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
		React.createElement('ActivityIndicator', { testID: 'ActivityIndicator', ...props });
	// Platform — mutable so platformHelpers.ts can do per-test OS overrides (QA issue 3.5)
	const Platform = {
		OS: 'ios' as string,
		Version: 1,
		select: (obj: any) => obj[(Platform as any).OS] ?? obj.default,
	};
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
	// Modal — only renders children when visible === true (QA issue 3.7)
	const Modal = ({ children, visible, ...props }: any) =>
		visible ? React.createElement('Modal', props, children) : null;
	const RefreshControl = (props: any) => React.createElement('RefreshControl', props);
	// FlatList — full prop support: header/footer/empty/onEndReached (QA issue 3.6)
	const FlatList = ({
		data,
		renderItem,
		keyExtractor,
		ListHeaderComponent,
		ListFooterComponent,
		ListEmptyComponent,
		onEndReached,
	}: any) => {
		const header = ListHeaderComponent
			? React.createElement(
					'View',
					null,
					typeof ListHeaderComponent === 'function'
						? React.createElement(ListHeaderComponent)
						: ListHeaderComponent,
				)
			: null;
		const footer = ListFooterComponent
			? React.createElement(
					'View',
					null,
					typeof ListFooterComponent === 'function'
						? React.createElement(ListFooterComponent)
						: ListFooterComponent,
				)
			: null;
		const items =
			data && data.length > 0
				? data.map((item: any, index: number) =>
						React.createElement(
							'View',
							{ key: keyExtractor ? keyExtractor(item, index) : String(index) },
							renderItem({ item, index }),
						),
					)
				: ListEmptyComponent
					? typeof ListEmptyComponent === 'function'
						? React.createElement(ListEmptyComponent)
						: ListEmptyComponent
					: null;
		return React.createElement(
			'View',
			null,
			header,
			items,
			footer,
			React.createElement(TouchableOpacity, {
				testID: 'flatlist-end-trigger',
				onPress: onEndReached,
			}),
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

// expo-router — useLocalSearchParams returns {} by default (QA issue 3.3)
// Per-test params: use setMockSearchParams() from __tests__/utils/mockSearchParams.ts
jest.mock('expo-router', () => {
	const push = jest.fn();
	const replace = jest.fn();
	const back = jest.fn();
	return {
		useRouter: jest.fn(() => ({ push, replace, back })),
		useLocalSearchParams: jest.fn(() => ({})),
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

// react-i18next — fallback returns last key segment so tests don't assert raw keys (QA issue 3.4)
jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, opts?: any) => {
			const staticMap: Record<string, string> = {
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
			if (staticMap[key]) return staticMap[key];
			const fallback = key.split('.').pop() ?? key;
			return opts?.defaultValue ?? fallback;
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
		t: (key: string, opts?: any) => {
			const staticMap: Record<string, string> = {
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
			if (staticMap[key]) return staticMap[key];
			const fallback = key.split('.').pop() ?? key;
			return opts?.defaultValue ?? fallback;
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
			get: (_target: any, prop: any) =>
				(props: any) => React.createElement('Icon', { ...props, name: prop }),
		},
	);
});

// NOTE: Supabase is intentionally NOT mocked globally (QA issue 3.1).
// Each test file must declare its own mock via createSupabaseMock() from
// __tests__/utils/supabaseMock.ts to avoid mock/prod divergence.
