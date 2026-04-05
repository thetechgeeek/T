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
(global as unknown as { __DEV__: boolean }).__DEV__ = true;

import React from 'react';
import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';
import { config } from 'dotenv';

config({ path: '.env.test' });

import { ViewProps, TextProps, ScrollViewProps, TouchableOpacityProps } from 'react-native';

// Consolidated mock for react-native
jest.mock('react-native', () => {
	const React = jest.requireActual('react');
	const RN = jest.requireActual('react-native');

	// Components
	const View = ({ children, ...props }: ViewProps & { children?: React.ReactNode }) =>
		React.createElement('View', props, children);
	const Text = ({ children, ...props }: TextProps & { children?: React.ReactNode }) => {
		const content = React.Children.toArray(children)
			.map((child: unknown) =>
				typeof child === 'string' || typeof child === 'number' ? child : '',
			)
			.join('')
			.trim()
			.replace(/\s+/g, ' ');
		return React.createElement('Text', props, content);
	};
	const ScrollView = ({ children, ...props }: ScrollViewProps & { children?: React.ReactNode }) =>
		React.createElement('ScrollView', props, children);
	const TouchableOpacity = ({
		children,
		onPress,
		disabled,
		...props
	}: TouchableOpacityProps & { children?: React.ReactNode; onPress?: () => void }) => {
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
	const TextInput = (props: React.ComponentProps<typeof RN.TextInput>) =>
		React.createElement('TextInput', props);
	const ActivityIndicator = (props: React.ComponentProps<typeof RN.ActivityIndicator>) =>
		React.createElement('ActivityIndicator', { testID: 'ActivityIndicator', ...props });

	const Platform = {
		OS: 'ios' as string,
		Version: 1,
		select: (obj: Record<string, unknown>) => obj[Platform.OS] ?? obj.default,
	};
	const StyleSheet = {
		create: (s: Record<string, unknown>) => s,
		flatten: (s: Record<string, unknown>) => s,
		hairlineWidth: 1,
	};
	const Appearance = {
		getColorScheme: jest.fn(() => 'light'),
		addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
	};
	const Alert = { alert: jest.fn() };
	const KeyboardAvoidingView = ({
		children,
		...props
	}: { children?: React.ReactNode } & Record<string, unknown>) =>
		React.createElement('KeyboardAvoidingView', props, children);
	const Touchable = { Mixin: {} };
	const Pressable = ({
		children,
		...props
	}: { children?: React.ReactNode } & Record<string, unknown>) =>
		React.createElement('Pressable', props, children);
	const Modal = ({
		children,
		visible,
		...props
	}: { children?: React.ReactNode; visible?: boolean } & Record<string, unknown>) =>
		visible ? React.createElement('Modal', props, children) : null;
	const RefreshControl = (props: Record<string, unknown>) =>
		React.createElement('RefreshControl', props);

	const FlatList = ({
		data,
		renderItem,
		keyExtractor,
		ListHeaderComponent,
		ListFooterComponent,
		ListEmptyComponent,
		onEndReached,
	}: {
		data?: unknown[];
		renderItem: ({ item, index }: { item: unknown; index: number }) => React.ReactNode;
		keyExtractor?: (item: unknown, index: number) => string;
		ListHeaderComponent?: React.ReactNode | React.ComponentType;
		ListFooterComponent?: React.ReactNode | React.ComponentType;
		ListEmptyComponent?: React.ReactNode | React.ComponentType;
		onEndReached?: () => void;
	}) => {
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
				? data.map((item: unknown, index: number) =>
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

	const SectionList = ({
		sections,
		renderItem,
		renderSectionHeader,
		keyExtractor,
	}: {
		sections: Array<{ data: unknown[] } & Record<string, unknown>>;
		renderItem: ({
			item,
			index,
			section,
		}: {
			item: unknown;
			index: number;
			section: unknown;
		}) => React.ReactNode;
		renderSectionHeader?: ({ section }: { section: unknown }) => React.ReactNode;
		keyExtractor?: (item: unknown, index: number) => string;
	}) => {
		return React.createElement(
			'View',
			null,
			sections.map((section: { data: unknown[] }, sIndex: number) =>
				React.createElement(
					'View',
					{ key: sIndex },
					renderSectionHeader && renderSectionHeader({ section }),
					section.data.map((item: unknown, index: number) =>
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
		}: {
			data?: unknown[];
			renderItem: ({ item, index }: { item: unknown; index: number }) => React.ReactNode;
			keyExtractor?: (item: unknown, index: number) => string;
			ListHeaderComponent?: React.ReactNode | React.ComponentType;
			ListFooterComponent?: React.ReactNode | React.ComponentType;
			ListEmptyComponent?: React.ReactNode | React.ComponentType;
		}) => {
			const React = jest.requireActual('react');
			const { View } = jest.requireActual('react-native');
			return React.createElement(
				View,
				null,
				ListHeaderComponent &&
					(typeof ListHeaderComponent === 'function'
						? React.createElement(ListHeaderComponent)
						: ListHeaderComponent),
				data?.map((item: unknown, index: number) =>
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
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const { createSupabaseMock } = require('./__tests__/utils/supabaseMock');
	return {
		supabase: createSupabaseMock(),
	};
});

jest.mock('@react-native-async-storage/async-storage', () =>
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Manual Reanimated mock — avoids react-native-worklets native module init in Jest
jest.mock('react-native-reanimated', () => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const ReactNative = require('react-native');
	const sharedValueFactory = (val: unknown) => ({ value: val });
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const safeCall = (fn: () => unknown): any => {
		try {
			return fn();
		} catch {
			return {};
		}
	};
	return {
		__esModule: true,
		default: {
			View: ReactNative.View,
			Text: ReactNative.Text,
			Image: ReactNative.Image,
			ScrollView: ReactNative.ScrollView,
			FlatList: ReactNative.FlatList,
			createAnimatedComponent: (c: unknown) => c,
			call: () => {},
		},
		createAnimatedComponent: (c: unknown) => c,
		useSharedValue: sharedValueFactory,
		useAnimatedStyle: safeCall,
		useAnimatedProps: safeCall,
		useDerivedValue: (fn: () => unknown) => ({ value: safeCall(fn) }),
		useAnimatedReaction: () => {},
		useAnimatedScrollHandler: () => ({}),
		useAnimatedRef: () => ({ current: null }),
		withSpring: (val: unknown) => val,
		withTiming: (val: unknown) => val,
		withRepeat: (val: unknown) => val,
		withSequence: (...args: unknown[]) => args[0],
		withDelay: (_: number, val: unknown) => val,
		cancelAnimation: () => {},
		runOnUI: (fn: () => void) => fn,
		runOnJS: (fn: () => void) => fn,
		interpolate: (_i: number, _r: number[], output: number[]) => output[0] ?? 0,
		Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
		Easing: {
			inOut: (fn: (t: number) => number) => fn,
			ease: (t: number) => t,
			linear: (t: number) => t,
			bezier: () => (t: number) => t,
		},
	};
});

// expo-router — useLocalSearchParams returns {} by default (QA issue 3.3)
// Per-test params: use setMockSearchParams() from __tests__/utils/mockSearchParams.ts
jest.mock('expo-router', () => {
	const push = jest.fn();
	const replace = jest.fn();
	const back = jest.fn();
	const setParams = jest.fn();
	return {
		useRouter: jest.fn(() => ({ push, replace, back, setParams })),
		useLocalSearchParams: jest.fn(() => ({})),
		useFocusEffect: jest.fn((cb) => cb()),
		useNavigation: jest.fn(() => ({
			navigate: jest.fn(),
			goBack: back,
			setOptions: jest.fn(),
		})),
		Tabs: Object.assign(() => null, { Screen: () => null }),
		Stack: Object.assign(() => null, { Screen: () => null }),
	};
});

jest.mock('expo-image', () => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const React = require('react');
	return {
		Image: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) =>
			React.createElement('Image', props, children),
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
	const t = (key: string, opts?: { defaultValue?: string }) => {
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
			'inventory.noItems': 'No items in inventory',
			'inventory.title': 'Inventory',
			'invoice.noInvoices': 'No invoices found.',
			'customer.noCustomers': 'No customers found',
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
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('@/src/i18n', () => require('i18next'));
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('./src/i18n', () => require('i18next'));

// react-i18next — fallback returns last key segment so tests don't assert raw keys (QA issue 3.4)
jest.mock('react-i18next', () => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
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
		// eslint-disable-next-line @typescript-eslint/no-require-imports
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
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const React = require('react');
	return new Proxy(
		{},
		{
			get: (_target: unknown, prop: string) => (props: Record<string, unknown>) =>
				React.createElement('Icon', { ...props, name: prop }),
		},
	);
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
	const inset = { top: 0, right: 0, bottom: 0, left: 0 };
	return {
		SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => children,
		SafeAreaView: ({ children }: { children?: React.ReactNode }) => children,
		useSafeAreaInsets: jest.fn(() => inset),
		useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
		initialWindowMetrics: {
			frame: { x: 0, y: 0, width: 0, height: 0 },
			insets: inset,
		},
	};
});

// Mock react-native-keyboard-controller
jest.mock('react-native-keyboard-controller', () => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const React = require('react');
	return {
		KeyboardAvoidingView: ({ children, ...props }: { children?: React.ReactNode }) =>
			React.createElement('View', props, children),
		KeyboardProvider: ({ children }: { children?: React.ReactNode }) => children,
		useKeyboardHandler: jest.fn(),
		useKeyboardController: jest.fn(() => ({
			isKeyboardVisible: false,
			keyboardHeight: 0,
		})),
		KeyboardStickyView: ({ children }: { children?: React.ReactNode }) =>
			React.createElement('View', null, children),
		KeyboardAwareScrollView: ({ children }: { children?: React.ReactNode }) =>
			React.createElement('ScrollView', null, children),
	};
});

// NOTE: Supabase is intentionally NOT mocked globally (QA issue 3.1).
// Each test file must declare its own mock via createSupabaseMock() from
// __tests__/utils/supabaseMock.ts to avoid mock/prod divergence.
