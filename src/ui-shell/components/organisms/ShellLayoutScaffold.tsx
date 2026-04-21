import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Screen } from '@easydesign/design-system';
import { useThemeTokens } from '@easydesign/design-system/foundation';
import { useShellEnvironment } from '../../ShellEnvironment';
import { ScreenHeader } from '../molecules/ScreenHeader';

const SHELL_LAYOUT_ASIDE_WIDTH = 320;

export interface ShellLayoutScaffoldProps {
	title: string | React.ReactNode;
	children: React.ReactNode;
	aside?: React.ReactNode;
	rightHeaderElement?: React.ReactNode;
	showBackButton?: boolean;
	contentStyle?: StyleProp<ViewStyle>;
	asideStyle?: StyleProp<ViewStyle>;
}

export function ShellLayoutScaffold({
	title,
	children,
	aside,
	rightHeaderElement,
	showBackButton,
	contentStyle,
	asideStyle,
}: ShellLayoutScaffoldProps) {
	const { adaptiveRuntime } = useShellEnvironment();
	const { s } = useThemeTokens();
	const isSplitPane = adaptiveRuntime.layoutVariant === 'split-pane' && Boolean(aside);

	return (
		<Screen scrollable={false}>
			<ScreenHeader
				title={title}
				rightElement={rightHeaderElement}
				showBackButton={showBackButton}
			/>
			<View
				testID="shell-layout-body"
				style={[
					styles.body,
					{
						gap: s.lg,
						padding: s.lg,
						flexDirection: isSplitPane ? 'row' : 'column',
					},
				]}
			>
				{isSplitPane ? (
					<View
						testID="shell-layout-aside"
						style={[styles.aside, { width: SHELL_LAYOUT_ASIDE_WIDTH }, asideStyle]}
					>
						{aside}
					</View>
				) : null}
				<View testID="shell-layout-content" style={[styles.content, contentStyle]}>
					{children}
				</View>
			</View>
			{!isSplitPane && aside ? (
				<View
					testID="shell-layout-aside"
					style={[
						{
							paddingHorizontal: s.lg,
							paddingBottom: s.lg,
						},
						asideStyle,
					]}
				>
					{aside}
				</View>
			) : null}
		</Screen>
	);
}

const styles = StyleSheet.create({
	body: {
		flex: 1,
	},
	aside: {
		flexShrink: 0,
	},
	content: {
		flex: 1,
	},
});
