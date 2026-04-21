import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/src/design-system';
import { BORDER_RADIUS_PX, FONT_SIZE, SPACING_PX, useTheme } from '@/src/design-system/foundation';
import { useShellEnvironment } from '../../ShellEnvironment';

interface Props {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

function FallbackUI({ error, onReset }: { error: Error | null; onReset: () => void }) {
	const { translate } = useShellEnvironment();
	const { theme } = useTheme();
	return (
		<View style={styles.container}>
			<ThemedText variant="h3" style={styles.title}>
				{translate('error.boundaryTitle', 'Something went wrong')}
			</ThemedText>
			<ThemedText
				variant="caption"
				style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
			>
				{error?.message || translate('common.unexpectedError', 'Unexpected error')}
			</ThemedText>
			<TouchableOpacity
				onPress={onReset}
				style={[styles.button, { backgroundColor: theme.colors.primary }]}
			>
				<ThemedText
					variant="body"
					style={[styles.buttonText, { color: theme.colors.onPrimary }]}
				>
					{translate('error.boundaryRetry', 'Try again')}
				</ThemedText>
			</TouchableOpacity>
		</View>
	);
}

export class ErrorBoundary extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		// In Phase 10, wire this to the observability logger
		console.error('[ErrorBoundary]', error, info.componentStack);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) return <>{this.props.fallback}</>;
			return <FallbackUI error={this.state.error} onReset={this.handleReset} />;
		}
		return this.props.children;
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: SPACING_PX['2xl'],
	},
	title: { fontSize: FONT_SIZE.h3, fontWeight: '700', marginBottom: SPACING_PX.sm },
	message: {
		fontSize: FONT_SIZE.caption,
		textAlign: 'center',
		marginBottom: SPACING_PX['2xl'],
	},
	button: {
		paddingHorizontal: SPACING_PX['2xl'],
		paddingVertical: SPACING_PX.md,
		borderRadius: BORDER_RADIUS_PX.md,
	},
	buttonText: { fontWeight: '600' },
});
