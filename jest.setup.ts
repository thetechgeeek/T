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

const mockNativeRegistry = {
	textInputs: new Map<
		string,
		{
			focus: jest.Mock;
			blur: jest.Mock;
			clear: jest.Mock;
			setNativeProps: jest.Mock;
		}
	>(),
	scrollViews: new Map<
		string,
		{
			scrollTo: jest.Mock;
		}
	>(),
};

(
	global as typeof globalThis & { __RN_TEST_REGISTRY__?: typeof mockNativeRegistry }
).__RN_TEST_REGISTRY__ = mockNativeRegistry;

beforeEach(() => {
	mockNativeRegistry.textInputs.clear();
	mockNativeRegistry.scrollViews.clear();
});

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
	const ScrollView = React.forwardRef(
		(
			{ children, ...props }: ScrollViewProps & { children?: React.ReactNode },
			ref: React.ForwardedRef<{ scrollTo: jest.Mock }>,
		) => {
			const scrollTo = React.useRef(jest.fn()).current;
			if (typeof props.testID === 'string') {
				mockNativeRegistry.scrollViews.set(props.testID, { scrollTo });
			}
			React.useImperativeHandle(ref, () => ({ scrollTo }), [scrollTo]);
			return React.createElement('ScrollView', { ...props, ref: null }, children);
		},
	);
	ScrollView.displayName = 'MockScrollView';
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
				accessibilityState: {
					disabled: !!disabled,
					...props.accessibilityState,
				},
			},
			children,
		);
	};
	const TextInput = React.forwardRef(
		(
			props: React.ComponentProps<typeof RN.TextInput>,
			ref: React.ForwardedRef<{
				focus: jest.Mock;
				blur: jest.Mock;
				clear: jest.Mock;
				setNativeProps: jest.Mock;
			}>,
		) => {
			const focus = React.useRef(
				jest.fn(() => {
					props.onFocus?.({ nativeEvent: {} } as never);
				}),
			).current;
			const blur = React.useRef(
				jest.fn(() => {
					props.onBlur?.({ nativeEvent: {} } as never);
				}),
			).current;
			const clear = React.useRef(jest.fn()).current;
			const setNativeProps = React.useRef(jest.fn()).current;

			focus.mockImplementation(() => {
				props.onFocus?.({ nativeEvent: {} } as never);
			});
			blur.mockImplementation(() => {
				props.onBlur?.({ nativeEvent: {} } as never);
			});
			if (typeof props.testID === 'string') {
				mockNativeRegistry.textInputs.set(props.testID, {
					focus,
					blur,
					clear,
					setNativeProps,
				});
			}

			React.useImperativeHandle(
				ref,
				() => ({
					focus,
					blur,
					clear,
					setNativeProps,
				}),
				[blur, clear, focus, setNativeProps],
			);

			return React.createElement('TextInput', { ...props, ref: null });
		},
	);
	TextInput.displayName = 'MockTextInput';
	const ActivityIndicator = (props: React.ComponentProps<typeof RN.ActivityIndicator>) =>
		React.createElement('ActivityIndicator', { testID: 'ActivityIndicator', ...props });

	const Platform = {
		OS: 'ios' as string,
		Version: 1,
		select: (obj: Record<string, unknown>) => obj[Platform.OS] ?? obj.default,
	};
	const PixelRatio = {
		get: jest.fn(() => 3),
		getFontScale: jest.fn(() => 1),
		roundToNearestPixel: (value: number) => value,
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
	const AccessibilityInfo = {
		isReduceMotionEnabled: jest.fn().mockResolvedValue(false),
		isBoldTextEnabled: jest.fn().mockResolvedValue(false),
		isHighTextContrastEnabled: jest.fn().mockResolvedValue(false),
		addEventListener: jest.fn(() => ({ remove: jest.fn() })),
		announceForAccessibility: jest.fn(),
		setAccessibilityFocus: jest.fn(),
	};
	const I18nManager = {
		isRTL: false,
		allowRTL: jest.fn(),
		forceRTL: jest.fn(),
		swapLeftAndRightInRTL: jest.fn(),
	};
	const KeyboardAvoidingView = ({
		children,
		...props
	}: { children?: React.ReactNode } & Record<string, unknown>) =>
		React.createElement('KeyboardAvoidingView', props, children);
	const TouchableWithoutFeedback = ({
		children,
		...props
	}: { children?: React.ReactNode } & Record<string, unknown>) =>
		React.createElement('TouchableWithoutFeedback', props, children);
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
	const Clipboard = {
		setString: jest.fn(),
		getString: jest.fn().mockResolvedValue(''),
	};
	const Share = {
		share: jest.fn().mockResolvedValue({ action: 'sharedAction' }),
	};

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
		ListFooterComponent,
		ListEmptyComponent,
		onEndReached,
		refreshControl,
		testID,
		...props
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
		ListFooterComponent?: React.ReactNode | React.ComponentType;
		ListEmptyComponent?: React.ReactNode | React.ComponentType;
		onEndReached?: () => void;
		refreshControl?: React.ReactNode;
		testID?: string;
		[key: string]: unknown;
	}) => {
		return React.createElement(
			'View',
			{ testID, ...props, refreshControl },
			sections.length > 0
				? sections.map((section: { data: unknown[] }, sIndex: number) =>
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
					)
				: ListEmptyComponent
					? typeof ListEmptyComponent === 'function'
						? React.createElement(ListEmptyComponent)
						: ListEmptyComponent
					: null,
			ListFooterComponent
				? typeof ListFooterComponent === 'function'
					? React.createElement(ListFooterComponent)
					: ListFooterComponent
				: null,
			React.createElement(TouchableOpacity, {
				testID: testID ? `${testID}-end-trigger` : 'sectionlist-end-trigger',
				onPress: onEndReached,
			}),
			React.createElement(TouchableOpacity, {
				testID: testID ? `${testID}-refresh-trigger` : 'sectionlist-refresh-trigger',
				onPress: (refreshControl as { props?: { onRefresh?: () => void } } | null)?.props
					?.onRefresh,
			}),
		);
	};

	const AppState = {
		currentState: 'active',
		addEventListener: jest.fn(() => ({ remove: jest.fn() })),
		removeEventListener: jest.fn(),
	};
	const Keyboard = {
		dismiss: jest.fn(),
		addListener: jest.fn(() => ({ remove: jest.fn() })),
		removeListener: jest.fn(),
	};
	const Dimensions = {
		get: jest.fn(() => ({ width: 390, height: 844, scale: 3, fontScale: 1 })),
		addEventListener: jest.fn(() => ({ remove: jest.fn() })),
	};
	const LayoutAnimation = {
		configureNext: jest.fn(),
		create: jest.fn(),
		Presets: {
			easeInEaseOut: { duration: 200 },
		},
		Types: {
			easeInEaseOut: 'easeInEaseOut',
		},
		Properties: {
			opacity: 'opacity',
			scaleXY: 'scaleXY',
		},
	};
	const InteractionManager = {
		runAfterInteractions: jest.fn((callback?: () => void) => {
			const timer = setTimeout(() => {
				callback?.();
			}, 0);
			return {
				cancel: jest.fn(() => clearTimeout(timer)),
			};
		}),
		createInteractionHandle: jest.fn(() => 1),
		clearInteractionHandle: jest.fn(),
	};
	const UIManager = {
		...RN.UIManager,
		setLayoutAnimationEnabledExperimental: jest.fn(),
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
		PixelRatio,
		StyleSheet,
		Appearance,
		Alert,
		AccessibilityInfo,
		I18nManager,
		Keyboard,
		Dimensions,
		InteractionManager,
		LayoutAnimation,
		KeyboardAvoidingView,
		TouchableWithoutFeedback,
		Touchable,
		UIManager,
		Pressable,
		Modal,
		RefreshControl,
		Clipboard,
		Share,
		FlatList,
		SectionList,
		AppState,
		NativeModules,
		Switch: ({ value, onValueChange, ...props }: any) =>
			React.createElement('Switch', { ...props, value, onChange: onValueChange }),
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
			onEndReached,
			onRefresh,
			testID,
			...props
		}: {
			data?: unknown[];
			renderItem: ({ item, index }: { item: unknown; index: number }) => React.ReactNode;
			keyExtractor?: (item: unknown, index: number) => string;
			ListHeaderComponent?: React.ReactNode | React.ComponentType;
			ListFooterComponent?: React.ReactNode | React.ComponentType;
			ListEmptyComponent?: React.ReactNode | React.ComponentType;
			onEndReached?: () => void;
			onRefresh?: () => void;
			testID?: string;
			[key: string]: unknown;
		}) => {
			const React = jest.requireActual('react');
			const { TouchableOpacity, View } = jest.requireActual('react-native');
			return React.createElement(
				View,
				{ testID, ...props },
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
				React.createElement(TouchableOpacity, {
					testID: testID ? `${testID}-end-trigger` : 'flashlist-end-trigger',
					onPress: onEndReached,
				}),
				React.createElement(TouchableOpacity, {
					testID: testID ? `${testID}-refresh-trigger` : 'flashlist-refresh-trigger',
					onPress: onRefresh,
				}),
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

// Manual Reanimated mock — avoids react-native-worklets native module init in Jest
jest.mock('react-native-reanimated', () => {
	const ReactNative = require('react-native');
	const sharedValueFactory = (val: unknown) => ({ value: val });

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

jest.mock('react-native-gesture-handler', () => {
	const React = require('react');
	const RN = require('react-native');
	const createGesture = () => {
		const handlers: Record<string, ((event?: any) => void) | undefined> = {};
		const gesture = {
			handlers,
			runOnJS: () => gesture,
			activateAfterLongPress: () => gesture,
			onBegin: (callback: (event?: any) => void) => {
				handlers.begin = callback;
				return gesture;
			},
			onChange: (callback: (event?: any) => void) => {
				handlers.change = callback;
				return gesture;
			},
			onUpdate: (callback: (event?: any) => void) => {
				handlers.update = callback;
				return gesture;
			},
			onEnd: (callback: (event?: any) => void) => {
				handlers.end = callback;
				return gesture;
			},
			onFinalize: (callback: (event?: any) => void) => {
				handlers.finalize = callback;
				return gesture;
			},
		};

		return gesture;
	};

	return {
		Gesture: {
			Pan: () => createGesture(),
			Pinch: () => createGesture(),
			Simultaneous: (...gestures: unknown[]) => ({ type: 'simultaneous', gestures }),
		},
		GestureDetector: ({
			children,
			gesture,
		}: {
			children?: React.ReactNode;
			gesture?: unknown;
		}) => React.createElement('GestureDetector', { gesture }, children),
		GestureHandlerRootView: ({ children }: { children?: React.ReactNode }) =>
			React.createElement(RN.View, null, children),
		Swipeable: RN.View,
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

jest.mock(
	'expo-clipboard',
	() => ({
		setStringAsync: jest.fn().mockResolvedValue(true),
		getStringAsync: jest.fn().mockResolvedValue(''),
	}),
	{ virtual: true },
);

jest.mock('expo-image-picker', () => ({
	launchImageLibraryAsync: jest.fn(),
	MediaTypeOptions: {
		Images: 'images',
	},
}));

jest.mock('expo-haptics', () => ({
	selectionAsync: jest.fn(),
	impactAsync: jest.fn(),
	notificationAsync: jest.fn(),
	ImpactFeedbackStyle: {
		Light: 'light',
	},
	NotificationFeedbackType: {
		Success: 'success',
		Warning: 'warning',
		Error: 'error',
	},
}));

jest.mock('@react-native-community/datetimepicker', () => {
	const React = require('react');
	const MockDateTimePicker = ({
		children,
		...props
	}: { children?: React.ReactNode } & Record<string, unknown>) =>
		React.createElement('RNDateTimePicker', props, children);
	MockDateTimePicker.displayName = 'MockDateTimePicker';
	return MockDateTimePicker;
});

jest.mock('expo-file-system', () => ({
	documentDirectory: 'test-dir/',
	writeAsStringAsync: jest.fn(),
	readAsStringAsync: jest.fn(),
	deleteAsync: jest.fn(),
	makeDirectoryAsync: jest.fn(),
	getInfoAsync: jest.fn(),
}));

jest.mock('expo-file-system/legacy', () => ({
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

jest.mock('@expo/vector-icons', () => {
	const React = require('react');
	const MaterialIcons = ({
		children,
		...props
	}: { children?: React.ReactNode } & Record<string, unknown>) =>
		React.createElement('MaterialIcons', props, children);
	MaterialIcons.displayName = 'MaterialIcons';
	return { MaterialIcons };
});

jest.mock('expo-camera', () => ({
	CameraView: 'CameraView',
	useCameraPermissions: jest.fn().mockReturnValue([{ granted: true }, jest.fn()]),
}));

// Mock i18next globally — loads real en.json so tests see actual English strings
jest.mock('i18next', () => {
	const enJson = require('./src/i18n/locales/en.json') as Record<string, unknown>;

	// Flatten nested JSON into dot-separated keys
	function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
		const result: Record<string, string> = {};
		for (const [k, v] of Object.entries(obj)) {
			const fullKey = prefix ? `${prefix}.${k}` : k;
			if (v && typeof v === 'object' && !Array.isArray(v)) {
				Object.assign(result, flatten(v as Record<string, unknown>, fullKey));
			} else {
				result[fullKey] = String(v ?? '');
			}
		}
		return result;
	}

	const TRANSLATIONS = flatten(enJson);

	const t = (key: string, opts?: Record<string, unknown>): string => {
		let val = TRANSLATIONS[key];
		if (!val) {
			// Fallback: last segment of key
			const shortKey = key.split('.').pop() || key;
			val = TRANSLATIONS[shortKey] || (opts?.defaultValue as string) || shortKey;
		}
		// Handle interpolation e.g. {{lang}}, {{theme}}
		if (val && opts) {
			return val.replace(/\{\{(\w+)\}\}/g, (_: string, k: string) =>
				k in opts ? String(opts[k]) : `{{${k}}}`,
			);
		}
		return val;
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
// The design-system contract now relies on runtime locale helpers as well, so we
// merge those real exports onto the lightweight i18next test double.
const createI18nModuleMock = () => {
	const i18nModule = require('i18next');
	const runtime = jest.requireActual('./src/i18n/runtime');
	const defaultExport = i18nModule.default ?? i18nModule;
	return {
		__esModule: true,
		default: defaultExport,
		...i18nModule,
		...runtime,
	};
};

jest.mock('@/src/i18n', () => createI18nModuleMock());

jest.mock('./src/i18n', () => createI18nModuleMock());

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

jest.mock('expo-localization', () =>
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	require('expo-localization/mocks/ExpoLocalization'),
);

// NOTE: Supabase is intentionally NOT mocked globally (QA issue 3.1).
// Each test file must declare its own mock via createSupabaseMock() from
// __tests__/utils/supabaseMock.ts to avoid mock/prod divergence.

// Mock react-native-svg and react-native-qrcode-svg
jest.mock('react-native-svg', () => {
	const React = jest.requireActual('react');
	return {
		__esModule: true,
		default: ({ children, ...props }: any) => React.createElement('Svg', props, children),
		Svg: ({ children, ...props }: any) => React.createElement('Svg', props, children),
		Circle: (props: any) => React.createElement('Circle', props),
		Line: (props: any) => React.createElement('Line', props),
		Rect: (props: any) => React.createElement('Rect', props),
		Path: (props: any) => React.createElement('Path', props),
		G: ({ children, ...props }: any) => React.createElement('G', props, children),
		Text: ({ children, ...props }: any) => React.createElement('Text', props, children),
		TSpan: ({ children, ...props }: any) => React.createElement('TSpan', props, children),
		Defs: ({ children, ...props }: any) => React.createElement('Defs', props, children),
		Pattern: ({ children, ...props }: any) => React.createElement('Pattern', props, children),
		LinearGradient: ({ children, ...props }: any) =>
			React.createElement('LinearGradient', props, children),
		Stop: (props: any) => React.createElement('Stop', props),
		ClipPath: ({ children, ...props }: any) => React.createElement('ClipPath', props, children),
		Polygon: (props: any) => React.createElement('Polygon', props),
		Polyline: (props: any) => React.createElement('Polyline', props),
	};
});

jest.mock('react-native-qrcode-svg', () => {
	const React = jest.requireActual('react');
	function QRCodeMock(props: Record<string, unknown>) {
		return React.createElement('QRCode', props);
	}
	QRCodeMock.displayName = 'QRCodeMock';
	return QRCodeMock;
});
