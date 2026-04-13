import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Modal, TextInput, Alert } from 'react-native';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { Button } from '@/src/components/atoms/Button';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { withOpacity } from '@/src/utils/color';
import { OVERLAY_COLOR_STRONG, OPACITY_SKELETON_BASE } from '@/src/theme/uiMetrics';

const GST_RATES = [0, 5, 12, 18, 28];

export default function CalculatorScreen() {
	const { c, s, r } = useThemeTokens();
	const [display, setDisplay] = useState('0');
	const [expression, setExpression] = useState('');
	const [gstModal, setGstModal] = useState(false);
	const [emiModal, setEmiModal] = useState(false);
	const [emiPrincipal, setEmiPrincipal] = useState('');
	const [emiRate, setEmiRate] = useState('');
	const [emiTenure, setEmiTenure] = useState('');
	const [emiResult, setEmiResult] = useState<{
		emi: number;
		total: number;
		interest: number;
	} | null>(null);

	const handleKey = (key: string) => {
		if (key === 'C') {
			setDisplay('0');
			setExpression('');
			return;
		}
		if (key === '=') {
			try {
				const expr = expression + display;
				// Safe eval via Function
				const result = new Function(
					'return ' + expr.replace(/×/g, '*').replace(/÷/g, '/'),
				)();
				const rounded = parseFloat(result.toFixed(6));
				setDisplay(String(rounded));
				setExpression('');
			} catch {
				setDisplay('Error');
				setExpression('');
			}
			return;
		}
		if (['+', '−', '×', '÷'].includes(key)) {
			setExpression(expression + display + key);
			setDisplay('0');
			return;
		}
		if (key === '%') {
			const val = parseFloat(display) / 100;
			setDisplay(String(val));
			return;
		}
		if (key === '.') {
			if (!display.includes('.')) setDisplay(display + '.');
			return;
		}
		setDisplay(display === '0' ? key : display + key);
	};

	const calcGST = (base: number, rate: number) => {
		const gst = (base * rate) / 100;
		return { base, gst, total: base + gst };
	};

	const calcEMI = () => {
		const P = parseFloat(emiPrincipal);
		const annualRate = parseFloat(emiRate);
		const n = parseInt(emiTenure);
		if (!P || !annualRate || !n) {
			Alert.alert('Error', 'Please fill all fields');
			return;
		}
		const r = annualRate / 12 / 100;
		const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
		const total = emi * n;
		const interest = total - P;
		setEmiResult({
			emi: Math.round(emi),
			total: Math.round(total),
			interest: Math.round(interest),
		});
	};

	const btn = (key: string, flex = 1, variant: 'num' | 'op' | 'eq' | 'clear' = 'num') => {
		const bgColor =
			variant === 'eq'
				? c.primary
				: variant === 'clear'
					? c.error
					: variant === 'op'
						? c.surfaceVariant
						: c.surface;
		const textColor =
			variant === 'eq' || variant === 'clear'
				? c.onPrimary
				: variant === 'op'
					? c.primary
					: c.onSurface;
		return (
			<Pressable
				key={key}
				onPress={() => handleKey(key)}
				style={[
					styles.btn,
					{
						flex,
						backgroundColor: bgColor,
						borderRadius: r.md,
						borderColor: c.border,
						borderWidth: variant === 'num' ? 1 : 0,
					},
				]}
			>
				<ThemedText variant="h2" color={textColor} style={styles.btnText}>
					{key}
				</ThemedText>
			</Pressable>
		);
	};

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
			<ScreenHeader title="Calculator" />

			{/* Shortcut buttons */}
			<View style={[styles.shortcuts, { borderBottomColor: c.border }]}>
				<Pressable
					onPress={() => setGstModal(true)}
					style={[
						styles.shortcutBtn,
						{ backgroundColor: c.primary + '20', borderRadius: r.md },
					]}
				>
					<ThemedText variant="bodyBold" color={c.primary}>
						GST
					</ThemedText>
				</Pressable>
				<Pressable
					onPress={() => setEmiModal(true)}
					style={[
						styles.shortcutBtn,
						{ backgroundColor: c.primary + '20', borderRadius: r.md },
					]}
				>
					<ThemedText variant="bodyBold" color={c.primary}>
						EMI
					</ThemedText>
				</Pressable>
			</View>

			{/* Display */}
			<View style={[styles.display, { backgroundColor: c.surface, borderColor: c.border }]}>
				<ThemedText variant="caption" color={c.onSurfaceVariant} style={{ minHeight: 20 }}>
					{expression}
				</ThemedText>
				<ThemedText
					variant="display"
					style={{ fontSize: 48, textAlign: 'right' }}
					numberOfLines={1}
					adjustsFontSizeToFit
				>
					{display}
				</ThemedText>
			</View>

			{/* Keypad */}
			<View style={styles.pad}>
				<View style={styles.row}>
					{btn('C', 1, 'clear')}
					{btn('%', 1, 'op')}
					{btn('÷', 1, 'op')}
					{btn('×', 1, 'op')}
				</View>
				<View style={styles.row}>
					{btn('7')}
					{btn('8')}
					{btn('9')}
					{btn('−', 1, 'op')}
				</View>
				<View style={styles.row}>
					{btn('4')}
					{btn('5')}
					{btn('6')}
					{btn('+', 1, 'op')}
				</View>
				<View style={styles.row}>
					{btn('1')}
					{btn('2')}
					{btn('3')}
					{btn('=', 1, 'eq')}
				</View>
				<View style={styles.row}>
					{btn('0', 2)}
					{btn('.')}
				</View>
			</View>

			{/* GST Modal */}
			<Modal
				visible={gstModal}
				transparent
				animationType="slide"
				onRequestClose={() => setGstModal(false)}
			>
				<View style={styles.modalOverlay}>
					<View
						style={[
							styles.modalBox,
							{ backgroundColor: c.surface, borderRadius: r.xl },
						]}
					>
						<ThemedText variant="h2" style={{ marginBottom: s.md }}>
							GST Calculator
						</ThemedText>
						<ThemedText variant="body" style={{ marginBottom: s.sm }}>
							Base Amount: ₹ {display !== 'Error' ? display : '0'}
						</ThemedText>
						<ThemedText
							variant="label"
							color={c.onSurfaceVariant}
							style={{ marginBottom: s.sm }}
						>
							Select GST Rate:
						</ThemedText>
						{GST_RATES.map((rate) => {
							const base = parseFloat(display) || 1000;
							const { gst, total } = calcGST(base, rate);
							return (
								<Pressable
									key={rate}
									onPress={() => {
										setDisplay(String(total.toFixed(2)));
										setGstModal(false);
									}}
									style={[
										styles.gstRow,
										{ borderColor: c.border, borderRadius: r.md },
									]}
								>
									<ThemedText variant="bodyBold">{rate}% GST</ThemedText>
									<ThemedText variant="caption" color={c.onSurfaceVariant}>
										Base ₹{base.toFixed(0)} + GST ₹{gst.toFixed(2)} = Total ₹
										{total.toFixed(2)}
									</ThemedText>
								</Pressable>
							);
						})}
						<Pressable
							onPress={() => setGstModal(false)}
							style={{ marginTop: s.md, alignItems: 'center' }}
						>
							<ThemedText variant="body" color={c.primary}>
								Close
							</ThemedText>
						</Pressable>
					</View>
				</View>
			</Modal>

			{/* EMI Modal */}
			<Modal
				visible={emiModal}
				transparent
				animationType="slide"
				onRequestClose={() => setEmiModal(false)}
			>
				<View style={styles.modalOverlay}>
					<View
						style={[
							styles.modalBox,
							{ backgroundColor: c.surface, borderRadius: r.xl },
						]}
					>
						<ThemedText variant="h2" style={{ marginBottom: s.md }}>
							EMI Calculator
						</ThemedText>
						{(['Principal (₹)', 'Annual Rate (%)', 'Tenure (Months)'] as const).map(
							(label, i) => {
								const val = [emiPrincipal, emiRate, emiTenure][i];
								const setter = [setEmiPrincipal, setEmiRate, setEmiTenure][i];
								return (
									<View key={label} style={{ marginBottom: s.sm }}>
										<ThemedText
											variant="label"
											color={c.onSurfaceVariant}
											style={{ marginBottom: 4 }}
										>
											{label}
										</ThemedText>
										<TextInput
											value={val}
											onChangeText={setter}
											keyboardType="numeric"
											placeholderTextColor={c.placeholder}
											placeholder="0"
											style={[
												styles.emiInput,
												{
													borderColor: c.border,
													color: c.onSurface,
													borderRadius: r.md,
												},
											]}
										/>
									</View>
								);
							},
						)}
						<Button title="Calculate EMI" onPress={calcEMI} />
						{emiResult && (
							<View
								style={[
									styles.emiResult,
									{
										backgroundColor: withOpacity(
											c.primary,
											OPACITY_SKELETON_BASE,
										),
										borderRadius: r.md,
									},
								]}
							>
								<ThemedText variant="h3" color={c.primary}>
									Monthly EMI: ₹ {emiResult.emi.toLocaleString('en-IN')}
								</ThemedText>
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									Total Payment: ₹ {emiResult.total.toLocaleString('en-IN')}
								</ThemedText>
								<ThemedText variant="caption" color={c.onSurfaceVariant}>
									Total Interest: ₹ {emiResult.interest.toLocaleString('en-IN')}
								</ThemedText>
							</View>
						)}
						<Pressable
							onPress={() => {
								setEmiModal(false);
								setEmiResult(null);
							}}
							style={{ marginTop: s.md, alignItems: 'center' }}
						>
							<ThemedText variant="body" color={c.primary}>
								Close
							</ThemedText>
						</Pressable>
					</View>
				</View>
			</Modal>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	shortcuts: {
		flexDirection: 'row',
		gap: 8,
		padding: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	shortcutBtn: { paddingHorizontal: 20, paddingVertical: 10 },
	display: {
		padding: 16,
		margin: 12,
		borderRadius: 12,
		borderWidth: 1,
		minHeight: 100,
		justifyContent: 'flex-end',
	},
	pad: { flex: 1, padding: 12, gap: 8 },
	row: { flexDirection: 'row', gap: 8 },
	btn: { height: 64, alignItems: 'center', justifyContent: 'center' },
	btnText: { fontWeight: '600' },
	modalOverlay: { flex: 1, backgroundColor: OVERLAY_COLOR_STRONG, justifyContent: 'flex-end' },
	modalBox: { padding: 24, gap: 8 },
	gstRow: { padding: 12, borderWidth: 1, marginBottom: 8 },
	emiInput: { borderWidth: 1, padding: 12, fontSize: 16 },
	emiResult: { marginTop: 12, padding: 14, gap: 4 },
});
