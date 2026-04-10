import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { businessProfileService } from '@/src/services/businessProfileService';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';

const TOTAL_STEPS = 4;

type BusinessType = 'retail' | 'wholesale' | 'manufacturing' | 'service' | 'other';

interface WizardData {
	// Step 1
	businessName: string;
	ownerName: string;
	phone: string;
	// Step 2
	businessType: BusinessType | null;
	address: string;
	city: string;
	state: string;
	pincode: string;
	// Step 3
	gstRegistered: boolean | null;
	gstin: string;
	pan: string;
	// Step 4
	invoicePrefix: string;
	invoiceStartNumber: string;
}

const BUSINESS_TYPES: { key: BusinessType; label: string; subLabel: string }[] = [
	{ key: 'retail', label: 'Retail Shop', subLabel: 'दुकान' },
	{ key: 'wholesale', label: 'Wholesale', subLabel: 'थोक' },
	{ key: 'manufacturing', label: 'Manufacturing', subLabel: 'उत्पादन' },
	{ key: 'service', label: 'Service', subLabel: 'सेवा' },
	{ key: 'other', label: 'Other', subLabel: 'अन्य' },
];

/**
 * P1.4 — 4-Step Business Setup Wizard
 * Route: /(auth)/setup
 */
export default function SetupScreen() {
	const { theme } = useTheme();
	const c = theme.colors;
	const router = useRouter();
	const { user } = useAuthStore();

	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const [data, setData] = useState<WizardData>({
		businessName: '',
		ownerName: '',
		phone: (user as { phone?: string } | null)?.phone?.replace('+91', '') ?? '',
		businessType: null,
		address: '',
		city: '',
		state: '',
		pincode: '',
		gstRegistered: null,
		gstin: '',
		pan: '',
		invoicePrefix: 'INV-',
		invoiceStartNumber: '1',
	});

	const update = (key: keyof WizardData, value: string | boolean | null | BusinessType) =>
		setData((prev) => ({ ...prev, [key]: value }));

	// Step 1 validation
	const step1Valid = data.businessName.trim().length >= 2 && data.ownerName.trim().length >= 1;

	const canGoNext = () => {
		if (step === 1) return step1Valid;
		return true; // steps 2-4 are skippable
	};

	const handleNext = () => {
		setError('');
		if (step < TOTAL_STEPS) {
			setStep((s) => s + 1);
		}
	};

	const handleBack = () => {
		setError('');
		if (step > 1) {
			setStep((s) => s - 1);
		}
	};

	const handleFinish = async () => {
		setLoading(true);
		setError('');
		try {
			await businessProfileService.upsert({
				business_name: data.businessName,
				phone: data.phone ? `+91${data.phone}` : undefined,
				gstin: data.gstin || undefined,
				address: data.address || undefined,
				city: data.city || undefined,
				state: data.state || undefined,
				invoice_prefix: data.invoicePrefix || 'INV-',
				invoice_sequence: parseInt(data.invoiceStartNumber, 10) || 1,
			});
			router.replace('/(app)/(tabs)');
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : 'Setup में समस्या हुई। फिर से try करें।');
		} finally {
			setLoading(false);
		}
	};

	const progressFraction = step / TOTAL_STEPS;

	const stepTitles = [
		'आपके व्यापार का नाम',
		'व्यापार का प्रकार और पता',
		'GST जानकारी',
		'Invoice की जानकारी',
	];

	return (
		<View style={[styles.root, { backgroundColor: c.background }]}>
			{/* Progress Bar */}
			<View style={[styles.progressTrack, { backgroundColor: c.border }]}>
				<View
					style={[
						styles.progressFill,
						{
							backgroundColor: c.primary,
							width: `${progressFraction * 100}%`,
						},
					]}
				/>
			</View>

			{/* Step Indicator */}
			<View style={styles.stepIndicatorRow}>
				<ThemedText
					testID="step-indicator"
					style={{ color: c.onSurfaceVariant, fontSize: 14 }}
				>
					{`चरण ${step} / ${TOTAL_STEPS}`}
				</ThemedText>
			</View>

			{/* Step Title */}
			<View style={{ paddingHorizontal: theme.spacing.lg }}>
				<ThemedText variant="h2" style={{ color: c.onSurface, marginBottom: 8 }}>
					{stepTitles[step - 1]}
				</ThemedText>
			</View>

			{/* Content */}
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ padding: theme.spacing.lg, paddingTop: 8 }}
				keyboardShouldPersistTaps="handled"
			>
				{step === 1 && <Step1 data={data} update={update} c={c} theme={theme} />}
				{step === 2 && <Step2 data={data} update={update} c={c} theme={theme} />}
				{step === 3 && <Step3 data={data} update={update} c={c} theme={theme} />}
				{step === 4 && <Step4 data={data} update={update} c={c} theme={theme} />}

				{error ? (
					<Text
						style={{ color: c.error, fontSize: 13, marginTop: 12, textAlign: 'center' }}
					>
						{error}
					</Text>
				) : null}
			</ScrollView>

			{/* Bottom Action Bar */}
			<View
				style={[styles.actionBar, { borderTopColor: c.border, backgroundColor: c.surface }]}
			>
				{step > 1 ? (
					<Pressable
						testID="back-button"
						onPress={handleBack}
						accessibilityRole="button"
						style={[
							styles.actionBtn,
							styles.backBtn,
							{ borderColor: c.primary, borderRadius: theme.borderRadius.md },
						]}
					>
						<Text style={{ color: c.primary, fontSize: 16, fontWeight: '600' }}>
							← वापस
						</Text>
					</Pressable>
				) : (
					<View style={styles.actionBtn} />
				)}

				{step < TOTAL_STEPS ? (
					<Pressable
						testID="next-button"
						onPress={handleNext}
						disabled={!canGoNext()}
						accessibilityRole="button"
						accessibilityState={{ disabled: !canGoNext() }}
						style={[
							styles.actionBtn,
							{
								backgroundColor: canGoNext() ? c.primary : c.surfaceVariant,
								borderRadius: theme.borderRadius.md,
							},
						]}
					>
						<Text
							style={{
								color: canGoNext() ? c.onPrimary : c.placeholder,
								fontSize: 16,
								fontWeight: '700',
							}}
						>
							अगला →
						</Text>
					</Pressable>
				) : (
					<Pressable
						testID="finish-button"
						onPress={handleFinish}
						disabled={loading}
						accessibilityRole="button"
						accessibilityState={{ disabled: loading }}
						style={[
							styles.actionBtn,
							{
								backgroundColor: loading ? c.surfaceVariant : c.primary,
								borderRadius: theme.borderRadius.md,
							},
						]}
					>
						<Text
							style={{
								color: loading ? c.placeholder : c.onPrimary,
								fontSize: 16,
								fontWeight: '700',
							}}
						>
							{loading ? 'Save हो रहा है...' : 'Setup पूरी करें ✓'}
						</Text>
					</Pressable>
				)}
			</View>
		</View>
	);
}

// ─── Step 1: Business Identity ───────────────────────────────────────────────

function Step1({
	data,
	update,
	c,
	theme,
}: {
	data: WizardData;
	update: (k: keyof WizardData, v: string) => void;
	c: ReturnType<typeof useTheme>['theme']['colors'];
	theme: ReturnType<typeof useTheme>['theme'];
}) {
	return (
		<View>
			<ThemedText style={{ color: c.onSurfaceVariant, fontSize: 14, marginBottom: 16 }}>
				व्यापार का नाम और आपकी जानकारी भरें
			</ThemedText>

			<ThemedText style={[styles.label, { color: c.onSurfaceVariant }]}>
				व्यापार का नाम *
			</ThemedText>
			<TextInput
				testID="business-name-input"
				value={data.businessName}
				onChangeText={(v) => update('businessName', v)}
				placeholder="जैसे: शर्मा टाइल्स एंड हार्डवेयर"
				placeholderTextColor={c.placeholder}
				style={[
					styles.input,
					{
						borderColor: c.border,
						backgroundColor: c.surface,
						color: c.onSurface,
						borderRadius: theme.borderRadius.md,
					},
				]}
				maxLength={100}
			/>

			<ThemedText style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}>
				मालिक का नाम *
			</ThemedText>
			<TextInput
				testID="owner-name-input"
				value={data.ownerName}
				onChangeText={(v) => update('ownerName', v)}
				placeholder="जैसे: रमेश शर्मा"
				placeholderTextColor={c.placeholder}
				style={[
					styles.input,
					{
						borderColor: c.border,
						backgroundColor: c.surface,
						color: c.onSurface,
						borderRadius: theme.borderRadius.md,
					},
				]}
			/>

			<ThemedText style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}>
				Mobile Number
			</ThemedText>
			<View
				style={[
					styles.phoneRow,
					{
						borderColor: c.border,
						backgroundColor: c.surface,
						borderRadius: theme.borderRadius.md,
					},
				]}
			>
				<Text
					style={{ color: c.onSurface, fontSize: 16, paddingLeft: 12, paddingRight: 4 }}
				>
					+91
				</Text>
				<TextInput
					testID="phone-input"
					value={data.phone}
					onChangeText={(v) => update('phone', v.replace(/\D/g, '').slice(0, 10))}
					placeholder="9876543210"
					placeholderTextColor={c.placeholder}
					keyboardType="number-pad"
					maxLength={10}
					style={{ flex: 1, color: c.onSurface, fontSize: 16, height: 52 }}
				/>
			</View>
		</View>
	);
}

// ─── Step 2: Business Type & Location ─────────────────────────────────────────

function Step2({
	data,
	update,
	c,
	theme,
}: {
	data: WizardData;
	update: (k: keyof WizardData, v: string | BusinessType | null) => void;
	c: ReturnType<typeof useTheme>['theme']['colors'];
	theme: ReturnType<typeof useTheme>['theme'];
}) {
	return (
		<View>
			<ThemedText style={[styles.label, { color: c.onSurfaceVariant, marginBottom: 8 }]}>
				व्यापार का प्रकार चुनें
			</ThemedText>

			<View testID="business-type-grid" style={styles.typeGrid}>
				{BUSINESS_TYPES.map((bt) => {
					const selected = data.businessType === bt.key;
					return (
						<Pressable
							key={bt.key}
							testID={`business-type-${bt.key}`}
							onPress={() => update('businessType', bt.key)}
							style={[
								styles.typeCard,
								{
									borderColor: selected ? c.primary : c.border,
									borderWidth: selected ? 2 : 1,
									backgroundColor: selected ? `${c.primary}15` : c.surface,
									borderRadius: theme.borderRadius.md,
								},
							]}
						>
							<Text style={{ color: c.onSurface, fontSize: 15, fontWeight: '600' }}>
								{bt.label}
							</Text>
							<Text style={{ color: c.onSurfaceVariant, fontSize: 13, marginTop: 2 }}>
								{bt.subLabel}
							</Text>
						</Pressable>
					);
				})}
			</View>

			<ThemedText style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}>
				पता
			</ThemedText>
			<TextInput
				testID="address-input"
				value={data.address}
				onChangeText={(v) => update('address', v)}
				placeholder="दुकान/मकान नं., गली, मोहल्ला"
				placeholderTextColor={c.placeholder}
				multiline
				numberOfLines={3}
				style={[
					styles.input,
					styles.textarea,
					{
						borderColor: c.border,
						backgroundColor: c.surface,
						color: c.onSurface,
						borderRadius: theme.borderRadius.md,
					},
				]}
			/>

			<ThemedText style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}>
				Pincode
			</ThemedText>
			<TextInput
				testID="pincode-input"
				value={data.pincode}
				onChangeText={(v) => update('pincode', v.replace(/\D/g, '').slice(0, 6))}
				placeholder="110001"
				placeholderTextColor={c.placeholder}
				keyboardType="number-pad"
				maxLength={6}
				style={[
					styles.input,
					{
						borderColor: c.border,
						backgroundColor: c.surface,
						color: c.onSurface,
						borderRadius: theme.borderRadius.md,
					},
				]}
			/>

			<ThemedText style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}>
				शहर / City
			</ThemedText>
			<TextInput
				testID="city-input"
				value={data.city}
				onChangeText={(v) => update('city', v)}
				placeholder="जैसे: दिल्ली"
				placeholderTextColor={c.placeholder}
				style={[
					styles.input,
					{
						borderColor: c.border,
						backgroundColor: c.surface,
						color: c.onSurface,
						borderRadius: theme.borderRadius.md,
					},
				]}
			/>

			<ThemedText style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}>
				राज्य / State
			</ThemedText>
			<TextInput
				testID="state-input"
				value={data.state}
				onChangeText={(v) => update('state', v)}
				placeholder="जैसे: Rajasthan"
				placeholderTextColor={c.placeholder}
				style={[
					styles.input,
					{
						borderColor: c.border,
						backgroundColor: c.surface,
						color: c.onSurface,
						borderRadius: theme.borderRadius.md,
					},
				]}
			/>
		</View>
	);
}

// ─── Step 3: GST & Tax ────────────────────────────────────────────────────────

function Step3({
	data,
	update,
	c,
	theme,
}: {
	data: WizardData;
	update: (k: keyof WizardData, v: string | boolean | null) => void;
	c: ReturnType<typeof useTheme>['theme']['colors'];
	theme: ReturnType<typeof useTheme>['theme'];
}) {
	return (
		<View>
			<ThemedText style={{ color: c.onSurfaceVariant, fontSize: 14, marginBottom: 16 }}>
				क्या आप GST में रजिस्टर हैं?
			</ThemedText>

			<View style={styles.gstToggleRow}>
				<Pressable
					testID="gst-toggle-yes"
					onPress={() => update('gstRegistered', true)}
					style={[
						styles.gstToggleBtn,
						{
							borderColor: data.gstRegistered === true ? c.primary : c.border,
							borderWidth: data.gstRegistered === true ? 2 : 1,
							backgroundColor:
								data.gstRegistered === true ? `${c.primary}15` : c.surface,
							borderRadius: theme.borderRadius.md,
							marginRight: 8,
						},
					]}
				>
					<Text style={{ color: c.onSurface, fontSize: 16, fontWeight: '700' }}>
						हाँ (YES)
					</Text>
				</Pressable>

				<Pressable
					testID="gst-toggle-no"
					onPress={() => update('gstRegistered', false)}
					style={[
						styles.gstToggleBtn,
						{
							borderColor: data.gstRegistered === false ? c.primary : c.border,
							borderWidth: data.gstRegistered === false ? 2 : 1,
							backgroundColor:
								data.gstRegistered === false ? `${c.primary}15` : c.surface,
							borderRadius: theme.borderRadius.md,
						},
					]}
				>
					<Text style={{ color: c.onSurface, fontSize: 16, fontWeight: '700' }}>
						नहीं (NO)
					</Text>
				</Pressable>
			</View>

			{data.gstRegistered === true && (
				<View style={{ marginTop: 20 }}>
					<ThemedText style={[styles.label, { color: c.onSurfaceVariant }]}>
						GSTIN (15 अंक)
					</ThemedText>
					<TextInput
						testID="gstin-input"
						value={data.gstin}
						onChangeText={(v) => update('gstin', v.toUpperCase().slice(0, 15))}
						placeholder="22AAAAA0000A1Z5"
						placeholderTextColor={c.placeholder}
						autoCapitalize="characters"
						maxLength={15}
						style={[
							styles.input,
							{
								borderColor: c.border,
								backgroundColor: c.surface,
								color: c.onSurface,
								borderRadius: theme.borderRadius.md,
								fontFamily: 'monospace',
							},
						]}
					/>

					<ThemedText
						style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}
					>
						PAN (वैकल्पिक)
					</ThemedText>
					<TextInput
						testID="pan-input"
						value={data.pan}
						onChangeText={(v) => update('pan', v.toUpperCase().slice(0, 10))}
						placeholder="AAAAA9999A"
						placeholderTextColor={c.placeholder}
						autoCapitalize="characters"
						maxLength={10}
						style={[
							styles.input,
							{
								borderColor: c.border,
								backgroundColor: c.surface,
								color: c.onSurface,
								borderRadius: theme.borderRadius.md,
								fontFamily: 'monospace',
							},
						]}
					/>
				</View>
			)}

			{data.gstRegistered === false && (
				<View
					style={[
						styles.infoCard,
						{
							backgroundColor: `${c.primary}10`,
							borderColor: c.border,
							borderRadius: theme.borderRadius.md,
							marginTop: 16,
						},
					]}
				>
					<Text style={{ color: c.onSurfaceVariant, fontSize: 14, lineHeight: 22 }}>
						आप बिना GST के भी invoices बना सकते हैं।{'\n'}Settings में बाद में जोड़ सकते
						हैं।
					</Text>
				</View>
			)}
		</View>
	);
}

// ─── Step 4: Branding ─────────────────────────────────────────────────────────

function Step4({
	data,
	update,
	c,
	theme,
}: {
	data: WizardData;
	update: (k: keyof WizardData, v: string) => void;
	c: ReturnType<typeof useTheme>['theme']['colors'];
	theme: ReturnType<typeof useTheme>['theme'];
}) {
	const startNum = parseInt(data.invoiceStartNumber, 10) || 1;
	const preview = `${data.invoicePrefix}${String(startNum).padStart(3, '0')}`;

	return (
		<View>
			<ThemedText style={{ color: c.onSurfaceVariant, fontSize: 14, marginBottom: 16 }}>
				Invoice नंबर की जानकारी भरें
			</ThemedText>

			<ThemedText style={[styles.label, { color: c.onSurfaceVariant }]}>
				Invoice Prefix
			</ThemedText>
			<TextInput
				testID="invoice-prefix-input"
				value={data.invoicePrefix}
				onChangeText={(v) => update('invoicePrefix', v.slice(0, 10))}
				placeholder="INV-"
				placeholderTextColor={c.placeholder}
				autoCapitalize="characters"
				maxLength={10}
				style={[
					styles.input,
					{
						borderColor: c.border,
						backgroundColor: c.surface,
						color: c.onSurface,
						borderRadius: theme.borderRadius.md,
					},
				]}
			/>

			<ThemedText style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}>
				Starting Number
			</ThemedText>
			<TextInput
				testID="invoice-start-input"
				value={data.invoiceStartNumber}
				onChangeText={(v) => update('invoiceStartNumber', v.replace(/\D/g, ''))}
				placeholder="1"
				placeholderTextColor={c.placeholder}
				keyboardType="number-pad"
				style={[
					styles.input,
					{
						borderColor: c.border,
						backgroundColor: c.surface,
						color: c.onSurface,
						borderRadius: theme.borderRadius.md,
					},
				]}
			/>

			<View
				style={[
					styles.previewCard,
					{
						backgroundColor: c.surface,
						borderColor: c.border,
						borderRadius: theme.borderRadius.md,
						marginTop: 20,
					},
				]}
			>
				<ThemedText style={{ color: c.onSurfaceVariant, fontSize: 13 }}>
					Preview:
				</ThemedText>
				<ThemedText
					style={{ color: c.primary, fontSize: 22, fontWeight: '700', marginTop: 4 }}
				>
					{preview}
				</ThemedText>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1 },
	progressTrack: { height: 4, width: '100%' },
	progressFill: { height: 4 },
	stepIndicatorRow: {
		paddingHorizontal: 16,
		paddingVertical: 10,
	},
	label: {
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 6,
	},
	input: {
		height: 52,
		borderWidth: 1,
		paddingHorizontal: 12,
		fontSize: 16,
	},
	textarea: {
		height: 90,
		textAlignVertical: 'top',
		paddingTop: 12,
	},
	phoneRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		height: 52,
	},
	typeGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	typeCard: {
		width: '47%',
		padding: 14,
		borderWidth: 1,
	},
	gstToggleRow: {
		flexDirection: 'row',
	},
	gstToggleBtn: {
		flex: 1,
		height: 56,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
	},
	infoCard: {
		padding: 16,
		borderWidth: 1,
	},
	previewCard: {
		padding: 16,
		borderWidth: 1,
		alignItems: 'center',
	},
	actionBar: {
		flexDirection: 'row',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderTopWidth: 1,
		gap: 12,
	},
	actionBtn: {
		flex: 1,
		height: 52,
		alignItems: 'center',
		justifyContent: 'center',
	},
	backBtn: {
		borderWidth: 1,
	},
});
