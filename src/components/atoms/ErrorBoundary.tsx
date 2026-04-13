import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocale } from '@/src/hooks/useLocale';
import { palette } from '@/src/theme/palette';
import { SPACING_PX, BORDER_RADIUS_PX } from '@/src/theme/layoutMetrics';
import { FONT_SIZE } from '@/src/theme/typographyMetrics';

interface Props {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

function FallbackUI({ error, onReset }: { error: Error | null; onReset: () => void }) {
	const { t } = useLocale();
	return (
		<View style={styles.container}>
			<Text style={styles.title}>{t('error.boundaryTitle')}</Text>
			<Text style={[styles.message, { color: palette.errorBoundaryText }]}>
				{error?.message || t('common.unexpectedError')}
			</Text>
			<TouchableOpacity
				onPress={onReset}
				style={[styles.button, { backgroundColor: palette.errorBoundaryButton }]}
			>
				<Text style={[styles.buttonText, { color: palette.white }]}>
					{t('error.boundaryRetry')}
				</Text>
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
