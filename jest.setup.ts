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

require('dotenv').config({ path: '.env.test' });

// Consolidated mock for react-native
jest.mock('react-native', () => {
	const React = require('react');
	const RN = jest.requireActual('react-native');

	// Components
	const View = ({ children, ...props }: any) => React.createElement('View', props, children);
	const Text = ({ children, ...props }: any) => {
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
		const handlePress = () => {
			if (!disabled && onPress) {
				onPress();
			}
		};
		return React.createElement(
			'TouchableOpacity',
			{
				...props,
				onPress: handlePress,
				disabled,
				accessibilityRole: props.accessibilityRole || 'button',
				accessibilityState: props.accessibilityState,
			},
			children,
		);
	};
	const TextInput = (props: any) => React.createElement('TextInput', props);
	const ActivityIndicator = (props: any) =>
		React.createElement('ActivityIndicator', { testID: 'ActivityIndicator', ...props });

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
	const Modal = ({ children, visible, ...props }: any) =>
		visible ? React.createElement('Modal', props, children) : null;
	const RefreshControl = (props: any) => React.createElement('RefreshControl', props);

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

	const AppState = {
		currentState: 'active',
		addEventListener: jest.fn(() => ({ remove: jest.fn() })),
		removeEventListener: jest.fn(),
	};

	const NativeModules = {
		...RN.NativeModules,
		RNOSSafeAreaContext: {
			getConstants: () => ({
				initialWindowMetrics: {
					frame: { x: 0, y: 0, width: 0, height: 0 },
					insets: { top: 0, left: 0, right: 0, bottom: 0 },
				},
			}),
		},
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
		AppState,
		NativeModules,
		useWindowDimensions: jest.fn(() => ({ width: 390, height: 844, fontScale: 1, scale: 3 })),
	};
});

// Mock @shopify/flash-list
jest.mock(
	'@shopify/flash-list',
	() => ({
		FlashList: ({
			data,
			renderItem,
			keyExtractor,
			ListHeaderComponent,
			ListFooterComponent,
			ListEmptyComponent,
		}: any) => {
			const React = require('react');
			const { View } = require('react-native');
			return React.createElement(
				View,
				null,
				ListHeaderComponent &&
					(typeof ListHeaderComponent === 'function'
						? React.createElement(ListHeaderComponent)
						: ListHeaderComponent),
				data?.map((item: any, index: number) =>
					React.createElement(
						View,
						{ key: keyExtractor ? keyExtractor(item, index) : index },
						renderItem({ item, index }),
					),
				),
				ListEmptyComponent &&
					(!data || data.length === 0) &&
					(typeof ListEmptyComponent === 'function'
						? React.createElement(ListEmptyComponent)
						: ListEmptyComponent),
				ListFooterComponent &&
					(typeof ListFooterComponent === 'function'
						? React.createElement(ListFooterComponent)
						: ListFooterComponent),
			);
		},
	}),
	{ virtual: true },
);

// Mock Supabase config globally to prevent "supabaseUrl is required" errors (QA issue 3.1)
jest.mock('@/src/config/supabase', () => {
	const { createSupabaseMock } = require('./__tests__/utils/supabaseMock');
	return {
		supabase: createSupabaseMock(),
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

jest.mock('expo-image', () => {
	const React = require('react');
	return {
		Image: ({ children, ...props }: any) => React.createElement('Image', props, children),
	};
});

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

// Mock i18next globally to prevent import issues in non-React files
jest.mock('i18next', () => {
	const t = (key: string, opts?: any) => {
		const SHARED_TRANSLATIONS: Record<string, string> = {
			'common.add': 'Add',
			'common.save': 'Save',
			'common.ok': 'ok',
			'common.today': 'Today',
			'common.yesterday': 'Yesterday',
			'common.error': 'Error',
			'common.errorTitle': 'Error',
			'common.successTitle': 'Success',
			'customers.addErrorTitle': 'Error Saving Customer',
			'finance.saveExpenseErrorTitle': 'Error Saving Expense',
			'invoices.createErrorTitle': 'Error Creating Invoice',
			'inventory.errorTitle': 'Error',
			'inventory.stockOpValidationError': 'Please enter a valid quantity',
			'finance.loadPurchasesError': 'Network error',
			'finance.loadExpensesError': 'Network error',
			'invoices.loadError': 'Public table missing',
			'invoice.loadError': 'Public table missing',
			'inventory.loadError': 'Schema error',
			'inventory.addErrorTitle': 'Error',
			errorTitle: 'Error',
			stockOpValidationError: 'Please enter a valid quantity',
			loadError: 'Public table missing',
			saveError: 'saveError',
			addErrorTitle: 'Error',
			'auth.signIn': 'Sign In',
			'auth.signUp': 'Sign Up',
			'auth.welcome': 'Welcome to TileMaster',
			'auth.subtitle': 'Manage your tiles & ceramics business',
			'auth.setupBusiness': 'Set Up Your Business',
			'auth.email': 'Email',
			'auth.password': 'Password',
		};
		if (SHARED_TRANSLATIONS[key]) return SHARED_TRANSLATIONS[key];
		const shortKey = key.split('.').pop() || key;
		return SHARED_TRANSLATIONS[shortKey] || opts?.defaultValue || shortKey;
	};
	return {
		__esModule: true,
		default: {
			t,
			changeLanguage: jest.fn().mockResolvedValue(undefined),
			language: 'en',
			use: jest.fn().mockReturnThis(),
			init: jest.fn().mockResolvedValue(undefined),
		},
		t,
		changeLanguage: jest.fn().mockResolvedValue(undefined),
		language: 'en',
	};
});

// Helper for shared translations to avoid discrepancies between different i18n mocks
// Note: We used to have separate mocks for @/src/i18n and i18next, but i18next mock is more fundamental.
// We'll keep @/src/i18n mock as a simple re-export of the i18next mock for completeness.
jest.mock('@/src/i18n', () => require('i18next'));
jest.mock('./src/i18n', () => require('i18next'));

// react-i18next — fallback returns last key segment so tests don't assert raw keys (QA issue 3.4)
jest.mock('react-i18next', () => {
	const i18n = require('i18next').default;
	return {
		useTranslation: () => ({
			t: i18n.t,
			i18n: i18n,
		}),
		initReactI18next: {
			type: '3rdParty',
			init: jest.fn(),
		},
	};
});

jest.mock('@/src/hooks/useLocale', () => ({
	useLocale: () => {
		const i18n = require('i18next').default;
		return {
			t: i18n.t,
			currentLanguage: 'en',
			toggleLanguage: jest.fn(),
			setLanguage: jest.fn(),
			formatCurrency: jest.fn((a) => `₹${a ?? 0}`),
			formatDate: jest.fn((d) => d),
			formatDateShort: jest.fn((d) => d),
		};
	},
}));

// Mock lucide-react-native to avoid SVG issues
jest.mock('lucide-react-native', () => {
	const React = require('react');
	return new Proxy(
		{},
		{
			get: (_target: any, prop: any) => (props: any) =>
				React.createElement('Icon', { ...props, name: prop }),
		},
	);
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
	const inset = { top: 0, right: 0, bottom: 0, left: 0 };
	return {
		SafeAreaProvider: ({ children }: any) => children,
		SafeAreaView: ({ children }: any) => children,
		useSafeAreaInsets: () => inset,
		useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
		initialWindowMetrics: {
			frame: { x: 0, y: 0, width: 0, height: 0 },
			insets: inset,
		},
	};
});

// Mock react-native-keyboard-controller
jest.mock('react-native-keyboard-controller', () => {
	const React = require('react');
	return {
		KeyboardAvoidingView: ({ children }: any) => React.createElement('View', null, children),
		KeyboardProvider: ({ children }: any) => children,
		useKeyboardHandler: jest.fn(),
		useKeyboardController: jest.fn(() => ({
			isKeyboardVisible: false,
			keyboardHeight: 0,
		})),
		KeyboardStickyView: ({ children }: any) => React.createElement('View', null, children),
		KeyboardAwareScrollView: ({ children }: any) =>
			React.createElement('ScrollView', null, children),
	};
});

// NOTE: Supabase is intentionally NOT mocked globally (QA issue 3.1).
// Each test file must declare its own mock via createSupabaseMock() from
// __tests__/utils/supabaseMock.ts to avoid mock/prod divergence.
