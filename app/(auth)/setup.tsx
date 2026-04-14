import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Camera, X } from 'lucide-react-native';
import { useAuthStore } from '@/src/stores/authStore';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { businessProfileService } from '@/src/services/businessProfileService';
import { Screen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { storageService } from '@/src/services/storageService';
import { SPACING_PX } from '@/src/theme/layoutMetrics';
import {
	OPACITY_TINT_LIGHT,
	SIZE_INPUT_HEIGHT,
	SIZE_LANGUAGE_FLAG,
	SIZE_PROGRESS_BAR,
	SIZE_TEXTAREA_MIN_HEIGHT,
} from '@/theme/uiMetrics';
import { withOpacity } from '@/src/utils/color';

/** ImagePicker quality for business logo (medium – balances file size vs clarity) */
const LOGO_IMAGE_QUALITY = 0.7;

const TOTAL_STEPS = 4;

type BusinessType = 'retail' | 'wholesale' | 'manufacturing' | 'service' | 'other';
type SetupTokens = Pick<ReturnType<typeof useThemeTokens>, 'c' | 's' | 'r' | 'typo'>;

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
	logoUrl?: string;
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
	const { c, s, r, typo } = useThemeTokens();
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
		logoUrl: '',
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
				logo_url: data.logoUrl || undefined,
			});
			router.replace('/(app)/(tabs)' as Href);
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
		<Screen
			safeAreaEdges={['top', 'bottom']}
			scrollable
			backgroundColor={c.background}
			header={
				<>
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

					<View style={styles.stepIndicatorRow}>
						<ThemedText
							testID="step-indicator"
							variant="caption"
							style={{ color: c.onSurfaceVariant }}
						>
							{`चरण ${step} / ${TOTAL_STEPS}`}
						</ThemedText>
					</View>

					<View style={{ paddingHorizontal: s.lg }}>
						<ThemedText variant="h2" style={{ color: c.onSurface, marginBottom: s.sm }}>
							{stepTitles[step - 1]}
						</ThemedText>
					</View>
				</>
			}
			contentContainerStyle={{ padding: s.lg, paddingTop: s.sm }}
			scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}
			footer={
				<View
					style={[
						styles.actionBar,
						{ borderTopColor: c.border, backgroundColor: c.surface },
					]}
				>
					{step > 1 ? (
						<Pressable
							testID="back-button"
							onPress={handleBack}
							accessibilityRole="button"
							style={[
								styles.actionBtn,
								styles.backBtn,
								{ borderColor: c.primary, borderRadius: r.md },
							]}
						>
							<ThemedText
								variant="body"
								style={{ color: c.primary, fontWeight: '600' }}
							>
								← वापस
							</ThemedText>
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
									borderRadius: r.md,
								},
							]}
						>
							<ThemedText
								variant="body"
								style={{
									color: canGoNext() ? c.onPrimary : c.placeholder,
									fontWeight: '700',
								}}
							>
								अगला →
							</ThemedText>
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
									borderRadius: r.md,
								},
							]}
						>
							<ThemedText
								variant="body"
								style={{
									color: loading ? c.placeholder : c.onPrimary,
									fontWeight: '700',
								}}
							>
								{loading ? 'Save हो रहा है...' : 'Setup पूरी करें ✓'}
							</ThemedText>
						</Pressable>
					)}
				</View>
			}
		>
			{step === 1 && <Step1 data={data} update={update} c={c} s={s} r={r} typo={typo} />}
			{step === 2 && <Step2 data={data} update={update} c={c} s={s} r={r} typo={typo} />}
			{step === 3 && <Step3 data={data} update={update} c={c} s={s} r={r} />}
			{step === 4 && <Step4 data={data} update={update} c={c} s={s} r={r} typo={typo} />}

			{error ? (
				<ThemedText
					variant="label"
					style={{ color: c.error, marginTop: s.md, textAlign: 'center' }}
				>
					{error}
				</ThemedText>
			) : null}
		</Screen>
	);
}

// ─── Step 1: Business Identity ───────────────────────────────────────────────

function Step1({
	data,
	update,
	c,
	s,
	r,
	typo,
}: {
	data: WizardData;
	update: (k: keyof WizardData, v: string) => void;
} & SetupTokens) {
	const inputSurfaceStyle = {
		borderColor: c.border,
		backgroundColor: c.surface,
		color: c.onSurface,
		borderRadius: r.md,
		fontSize: typo.sizes.lg,
	};

	return (
		<View>
			<ThemedText variant="caption" style={{ color: c.onSurfaceVariant, marginBottom: s.lg }}>
				व्यापार का नाम और आपकी जानकारी भरें
			</ThemedText>

			<ThemedText variant="label" style={[styles.label, { color: c.onSurfaceVariant }]}>
				व्यापार का नाम *
			</ThemedText>
			<TextInput
				testID="business-name-input"
				value={data.businessName}
				onChangeText={(v) => update('businessName', v)}
				placeholder="जैसे: शर्मा टाइल्स एंड हार्डवेयर"
				placeholderTextColor={c.placeholder}
				style={[styles.input, inputSurfaceStyle]}
				maxLength={100}
			/>

			<ThemedText
				variant="label"
				style={[styles.label, { color: c.onSurfaceVariant, marginTop: s.lg }]}
			>
				मालिक का नाम *
			</ThemedText>
			<TextInput
				testID="owner-name-input"
				value={data.ownerName}
				onChangeText={(v) => update('ownerName', v)}
				placeholder="जैसे: रमेश शर्मा"
				placeholderTextColor={c.placeholder}
				style={[styles.input, inputSurfaceStyle]}
			/>

			<ThemedText
				variant="label"
				style={[styles.label, { color: c.onSurfaceVariant, marginTop: s.lg }]}
			>
				Mobile Number
			</ThemedText>
			<View
				style={[
					styles.phoneRow,
					{
						borderColor: c.border,
						backgroundColor: c.surface,
						borderRadius: r.md,
					},
				]}
			>
				<ThemedText
					variant="body"
					style={{ color: c.onSurface, paddingLeft: s.md, paddingRight: s.xs }}
				>
					+91
				</ThemedText>
				<TextInput
					testID="phone-input"
					value={data.phone}
					onChangeText={(v) => update('phone', v.replace(/\D/g, '').slice(0, 10))}
					placeholder="9876543210"
					placeholderTextColor={c.placeholder}
					keyboardType="number-pad"
					maxLength={10}
					style={{
						flex: 1,
						color: c.onSurface,
						fontSize: typo.sizes.lg,
						height: SIZE_INPUT_HEIGHT,
					}}
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
	s,
	r,
	typo,
}: {
	data: WizardData;
	update: (k: keyof WizardData, v: string | BusinessType | null) => void;
} & SetupTokens) {
	const inputSurfaceStyle = {
		borderColor: c.border,
		backgroundColor: c.surface,
		color: c.onSurface,
		borderRadius: r.md,
		fontSize: typo.sizes.lg,
	};

	return (
		<View>
			<ThemedText
				variant="label"
				style={[styles.label, { color: c.onSurfaceVariant, marginBottom: s.sm }]}
			>
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
									backgroundColor: selected
										? withOpacity(c.primary, OPACITY_TINT_LIGHT)
										: c.surface,
									borderRadius: r.md,
								},
							]}
						>
							<ThemedText
								variant="body"
								style={{ color: c.onSurface, fontWeight: '600' }}
							>
								{bt.label}
							</ThemedText>
							<ThemedText
								variant="label"
								style={{ color: c.onSurfaceVariant, marginTop: s.xxs }}
							>
								{bt.subLabel}
							</ThemedText>
						</Pressable>
					);
				})}
			</View>

			<ThemedText
				variant="label"
				style={[styles.label, { color: c.onSurfaceVariant, marginTop: s.lg }]}
			>
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
				style={[styles.input, styles.textarea, inputSurfaceStyle]}
			/>

			<ThemedText
				variant="label"
				style={[styles.label, { color: c.onSurfaceVariant, marginTop: s.lg }]}
			>
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
				style={[styles.input, inputSurfaceStyle]}
			/>

			<ThemedText
				variant="label"
				style={[styles.label, { color: c.onSurfaceVariant, marginTop: s.lg }]}
			>
				शहर / City
			</ThemedText>
			<TextInput
				testID="city-input"
				value={data.city}
				onChangeText={(v) => update('city', v)}
				placeholder="जैसे: दिल्ली"
				placeholderTextColor={c.placeholder}
				style={[styles.input, inputSurfaceStyle]}
			/>

			<ThemedText
				variant="label"
				style={[styles.label, { color: c.onSurfaceVariant, marginTop: s.lg }]}
			>
				राज्य / State
			</ThemedText>
			<TextInput
				testID="state-input"
				value={data.state}
				onChangeText={(v) => update('state', v)}
				placeholder="जैसे: Rajasthan"
				placeholderTextColor={c.placeholder}
				style={[styles.input, inputSurfaceStyle]}
			/>
		</View>
	);
}

// ─── Step 3: GST & Tax ────────────────────────────────────────────────────────

function Step3({
	data,
	update,
	c,
	s,
	r,
}: {
	data: WizardData;
	update: (k: keyof WizardData, v: string | boolean | null) => void;
} & Pick<SetupTokens, 'c' | 's' | 'r'>) {
	const inputSurfaceStyle = {
		borderColor: c.border,
		backgroundColor: c.surface,
		color: c.onSurface,
		borderRadius: r.md,
	};

	return (
		<View>
			<ThemedText variant="caption" style={{ color: c.onSurfaceVariant, marginBottom: s.lg }}>
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
								data.gstRegistered === true
									? withOpacity(c.primary, OPACITY_TINT_LIGHT)
									: c.surface,
							borderRadius: r.md,
							marginRight: s.sm,
						},
					]}
				>
					<ThemedText variant="body" style={{ color: c.onSurface, fontWeight: '700' }}>
						हाँ (YES)
					</ThemedText>
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
								data.gstRegistered === false
									? withOpacity(c.primary, OPACITY_TINT_LIGHT)
									: c.surface,
							borderRadius: r.md,
						},
					]}
				>
					<ThemedText variant="body" style={{ color: c.onSurface, fontWeight: '700' }}>
						नहीं (NO)
					</ThemedText>
				</Pressable>
			</View>

			{data.gstRegistered === true && (
				<View style={{ marginTop: s.xl }}>
					<ThemedText
						variant="label"
						style={[styles.label, { color: c.onSurfaceVariant }]}
					>
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
						style={[styles.input, inputSurfaceStyle, styles.monospaceInput]}
					/>

					<ThemedText
						variant="label"
						style={[styles.label, { color: c.onSurfaceVariant, marginTop: s.lg }]}
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
						style={[styles.input, inputSurfaceStyle, styles.monospaceInput]}
					/>
				</View>
			)}

			{data.gstRegistered === false && (
				<View
					style={[
						styles.infoCard,
						{
							backgroundColor: withOpacity(c.primary, OPACITY_TINT_LIGHT),
							borderColor: c.border,
							borderRadius: r.md,
							marginTop: s.lg,
						},
					]}
				>
					<ThemedText variant="caption" style={{ color: c.onSurfaceVariant }}>
						आप बिना GST के भी invoices बना सकते हैं।{'\n'}Settings में बाद में जोड़ सकते
						हैं।
					</ThemedText>
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
	s,
	r,
	typo,
}: {
	data: WizardData;
	update: (k: keyof WizardData, v: string) => void;
} & SetupTokens) {
	const inputSurfaceStyle = {
		borderColor: c.border,
		backgroundColor: c.surface,
		color: c.onSurface,
		borderRadius: r.md,
		fontSize: typo.sizes.lg,
	};
	const startNum = parseInt(data.invoiceStartNumber, 10) || 1;
	const preview = `${data.invoicePrefix}${String(startNum).padStart(3, '0')}`;

	return (
		<View>
			<ThemedText
				variant="label"
				style={[styles.label, { color: c.onSurfaceVariant, marginTop: s.lg }]}
			>
				व्यापार का Logo
			</ThemedText>
			<LogoPicker value={data.logoUrl} onChange={(v) => update('logoUrl', v)} c={c} r={r} />

			<ThemedText
				variant="label"
				style={[styles.label, { color: c.onSurfaceVariant, marginTop: s.xl }]}
			>
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
				style={[styles.input, inputSurfaceStyle]}
			/>

			<ThemedText
				variant="label"
				style={[styles.label, { color: c.onSurfaceVariant, marginTop: s.lg }]}
			>
				Starting Number
			</ThemedText>
			<TextInput
				testID="invoice-start-input"
				value={data.invoiceStartNumber}
				onChangeText={(v) => update('invoiceStartNumber', v.replace(/\D/g, ''))}
				placeholder="1"
				placeholderTextColor={c.placeholder}
				keyboardType="number-pad"
				style={[styles.input, inputSurfaceStyle]}
			/>

			<View
				style={[
					styles.previewCard,
					{
						backgroundColor: c.surface,
						borderColor: c.border,
						borderRadius: r.md,
						marginTop: s.xl,
					},
				]}
			>
				<ThemedText variant="label" style={{ color: c.onSurfaceVariant }}>
					Preview:
				</ThemedText>
				<ThemedText
					variant="h1"
					style={{ color: c.primary, fontWeight: '700', marginTop: s.xs }}
				>
					{preview}
				</ThemedText>
			</View>
		</View>
	);
}

function LogoPicker({
	value,
	onChange,
	c,
	r,
}: {
	value?: string;
	onChange: (v: string) => void;
	c: SetupTokens['c'];
	r: SetupTokens['r'];
}) {
	const [uploading, setUploading] = useState(false);

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			aspect: [1, 1],
			quality: LOGO_IMAGE_QUALITY,
		});

		if (!result.canceled && result.assets[0].uri) {
			setUploading(true);
			try {
				const uri = result.assets[0].uri;
				const fileName = `logo-${Date.now()}.jpg`;
				const path = await storageService.uploadFile('branding', uri, fileName, {
					contentType: 'image/jpeg',
				});
				const publicUrl = storageService.getPublicUrl('branding', path);
				onChange(publicUrl);
			} catch (e) {
				console.error('Logo upload failed', e);
				alert('Logo upload failed. Please try again.');
			} finally {
				setUploading(false);
			}
		}
	};

	return (
		<Pressable
			onPress={pickImage}
			disabled={uploading}
			style={[
				styles.logoBox,
				{
					borderColor: c.border,
					backgroundColor: c.surface,
					borderRadius: r.md,
				},
			]}
		>
			{value ? (
				<View style={{ width: '100%', height: '100%' }}>
					<Image
						source={{ uri: value }}
						style={{ flex: 1, borderRadius: r.md }}
						contentFit="cover"
					/>
					<Pressable
						onPress={(e) => {
							e.stopPropagation();
							onChange('');
						}}
						style={[styles.removeBtn, { backgroundColor: c.error }]}
					>
						<X size={16} color={c.white} />
					</Pressable>
				</View>
			) : (
				<View style={{ alignItems: 'center' }}>
					<Camera size={32} color={c.placeholder} strokeWidth={1.5} />
					<ThemedText
						variant="captionSmall"
						style={{ color: c.placeholder, marginTop: SPACING_PX.xs }}
					>
						{uploading ? 'Uploading...' : 'Upload Logo'}
					</ThemedText>
				</View>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	progressTrack: { height: SIZE_PROGRESS_BAR, width: '100%' },
	progressFill: { height: SIZE_PROGRESS_BAR },
	stepIndicatorRow: {
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.sm,
	},
	label: {
		marginBottom: SPACING_PX.xs,
	},
	input: {
		height: SIZE_INPUT_HEIGHT,
		borderWidth: 1,
		paddingHorizontal: SPACING_PX.md,
	},
	textarea: {
		height: SIZE_TEXTAREA_MIN_HEIGHT,
		textAlignVertical: 'top',
		paddingTop: SPACING_PX.md,
	},
	monospaceInput: {
		fontFamily: 'monospace',
	},
	phoneRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		height: SIZE_INPUT_HEIGHT,
	},
	typeGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: SPACING_PX.sm,
	},
	typeCard: {
		width: '47%',
		padding: SPACING_PX.md,
		borderWidth: 1,
	},
	gstToggleRow: {
		flexDirection: 'row',
	},
	gstToggleBtn: {
		flex: 1,
		height: SIZE_INPUT_HEIGHT,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
	},
	infoCard: {
		padding: SPACING_PX.lg,
		borderWidth: 1,
	},
	previewCard: {
		padding: SPACING_PX.lg,
		borderWidth: 1,
		alignItems: 'center',
	},
	actionBar: {
		flexDirection: 'row',
		paddingHorizontal: SPACING_PX.lg,
		paddingVertical: SPACING_PX.md,
		borderTopWidth: 1,
		gap: SPACING_PX.md,
	},
	actionBtn: {
		flex: 1,
		height: SIZE_INPUT_HEIGHT,
		alignItems: 'center',
		justifyContent: 'center',
	},
	backBtn: {
		borderWidth: 1,
	},
	logoBox: {
		width: SIZE_LANGUAGE_FLAG,
		height: SIZE_LANGUAGE_FLAG,
		borderWidth: 2,
		borderStyle: 'dashed',
		alignItems: 'center',
		justifyContent: 'center',
	},
	removeBtn: {
		position: 'absolute',
		top: -SPACING_PX.sm,
		right: -SPACING_PX.sm,
		width: SPACING_PX.xl,
		height: SPACING_PX.xl,
		borderRadius: SPACING_PX.md,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
