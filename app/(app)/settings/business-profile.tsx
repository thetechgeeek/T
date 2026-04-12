import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TextInput,
	Pressable,
	ScrollView,
	ActivityIndicator,
	StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { businessProfileService } from '@/src/services/businessProfileService';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { storageService } from '@/src/services/storageService';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Camera, X, ChevronDown, ChevronUp } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
interface ProfileForm {
	business_name: string;
	phone: string;
	email: string;
	website: string;
	alternate_phone: string;
	business_description: string;
	gstin: string;
	address: string;
	city: string;
	state: string;
	logo_url: string;
	signature_url: string;
	upi_id: string;
	bank_details: {
		bank_name: string;
		account_number: string;
		ifsc_code: string;
		holder_name: string;
		branch_name: string;
	};
	invoice_prefix: string;
	invoice_sequence: string;
}

/**
 * P1.5 — Business Profile Edit Screen
 * Route: /(app)/settings/business-profile
 */
export default function BusinessProfileScreen() {
	const { theme } = useTheme();
	const c = theme.colors;
	const router = useRouter();

	const [fetchLoading, setFetchLoading] = useState(true);
	const [saveLoading, setSaveLoading] = useState(false);
	const [fetchError, setFetchError] = useState('');
	const [saveError, setSaveError] = useState('');
	const [saved, setSaved] = useState(false);

	const [form, setForm] = useState<ProfileForm>({
		business_name: '',
		phone: '',
		email: '',
		website: '',
		alternate_phone: '',
		business_description: '',
		gstin: '',
		address: '',
		city: '',
		state: '',
		logo_url: '',
		signature_url: '',
		upi_id: '',
		bank_details: {
			bank_name: '',
			account_number: '',
			ifsc_code: '',
			holder_name: '',
			branch_name: '',
		},
		invoice_prefix: 'INV-',
		invoice_sequence: '1',
	});

	const [sections, setSections] = useState({
		branding: true,
		bank: false,
		sequence: false,
	});

	useEffect(() => {
		let cancelled = false;
		setFetchLoading(true);
		setFetchError('');
		businessProfileService
			.fetch()
			.then((profile) => {
				if (cancelled) return;
				if (profile) {
					setForm({
						business_name: profile.business_name ?? '',
						phone: profile.phone ?? '',
						email: profile.email ?? '',
						website: profile.website ?? '',
						alternate_phone: profile.alternate_phone ?? '',
						business_description: profile.business_description ?? '',
						gstin: profile.gstin ?? '',
						address: profile.address ?? '',
						city: profile.city ?? '',
						state: profile.state ?? '',
						logo_url: profile.logo_url ?? '',
						signature_url: profile.signature_url ?? '',
						upi_id: profile.upi_id ?? '',
						bank_details: {
							bank_name: profile.bank_details?.bank_name ?? '',
							account_number: profile.bank_details?.account_number ?? '',
							ifsc_code: profile.bank_details?.ifsc_code ?? '',
							holder_name: profile.bank_details?.holder_name ?? '',
							branch_name: profile.bank_details?.branch_name ?? '',
						},
						invoice_prefix: profile.invoice_prefix ?? 'INV-',
						invoice_sequence: String(profile.invoice_sequence ?? 1),
					});
				}
			})
			.catch((e: unknown) => {
				if (cancelled) return;
				setFetchError(e instanceof Error ? e.message : 'Profile load नहीं हुई।');
			})
			.finally(() => {
				if (!cancelled) setFetchLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const update = (key: keyof ProfileForm, value: string) =>
		setForm((prev) => ({ ...prev, [key]: value }));

	const handleSave = async () => {
		setSaveLoading(true);
		setSaveError('');
		setSaved(false);
		try {
			await businessProfileService.upsert({
				business_name: form.business_name,
				phone: form.phone || undefined,
				email: form.email || undefined,
				website: form.website || undefined,
				alternate_phone: form.alternate_phone || undefined,
				business_description: form.business_description || undefined,
				gstin: form.gstin || undefined,
				address: form.address || undefined,
				city: form.city || undefined,
				state: form.state || undefined,
				logo_url: form.logo_url || undefined,
				signature_url: form.signature_url || undefined,
				upi_id: form.upi_id || undefined,
				bank_details: {
					bank_name: form.bank_details.bank_name || undefined,
					account_number: form.bank_details.account_number || undefined,
					ifsc_code: form.bank_details.ifsc_code || undefined,
					holder_name: form.bank_details.holder_name || undefined,
					branch_name: form.bank_details.branch_name || undefined,
				},
				invoice_prefix: form.invoice_prefix || 'INV-',
				invoice_sequence: parseInt(form.invoice_sequence, 10) || 1,
			});
			setSaved(true);
			setTimeout(() => setSaved(false), 3000);
		} catch (e: unknown) {
			setSaveError(e instanceof Error ? e.message : 'Save नहीं हुआ। फिर से try करें।');
		} finally {
			setSaveLoading(false);
		}
	};

	const toggleSection = (key: keyof typeof sections) =>
		setSections((prev) => ({ ...prev, [key]: !prev[key] }));

	const updateBank = (key: keyof ProfileForm['bank_details'], val: string) => {
		setForm((prev) => ({
			...prev,
			bank_details: { ...prev.bank_details, [key]: val },
		}));
	};

	if (fetchLoading) {
		return (
			<View style={[styles.root, styles.center, { backgroundColor: c.background }]}>
				<ActivityIndicator testID="loading-indicator" color={c.primary} size="large" />
			</View>
		);
	}

	if (fetchError) {
		return (
			<View style={[styles.root, styles.center, { backgroundColor: c.background }]}>
				<Text
					testID="error-message"
					style={{ color: c.error, fontSize: 15, textAlign: 'center' }}
				>
					{fetchError}
				</Text>
				<Pressable
					onPress={() => router.back()}
					style={[
						styles.retryBtn,
						{ backgroundColor: c.primary, borderRadius: theme.borderRadius.md },
					]}
				>
					<Text style={{ color: c.onPrimary, fontSize: 15 }}>वापस जाएं</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<View style={[styles.root, { backgroundColor: c.background }]}>
			{/* Header */}
			<View style={[styles.header, { backgroundColor: c.primary }]}>
				<ThemedText variant="h2" style={{ color: c.onPrimary }}>
					Business Profile
				</ThemedText>
			</View>

			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ padding: theme.spacing.lg }}
				keyboardShouldPersistTaps="handled"
			>
				{/* Business Name */}
				<ThemedText style={[styles.label, { color: c.onSurfaceVariant }]}>
					व्यापार का नाम *
				</ThemedText>
				<TextInput
					testID="business-name-field"
					value={form.business_name}
					onChangeText={(v) => update('business_name', v)}
					placeholder="जैसे: शर्मा टाइल्स"
					placeholderTextColor={c.placeholder}
					style={[styles.input, inputStyle(c, theme)]}
				/>

				{/* Phone */}
				<ThemedText style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}>
					Mobile Number
				</ThemedText>
				<TextInput
					testID="phone-field"
					value={form.phone}
					onChangeText={(v) => update('phone', v)}
					placeholder="+919876543210"
					placeholderTextColor={c.placeholder}
					keyboardType="phone-pad"
					style={[styles.input, inputStyle(c, theme)]}
				/>

				{/* GSTIN */}
				<ThemedText style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}>
					GSTIN (वैकल्पिक)
				</ThemedText>
				<TextInput
					testID="gstin-field"
					value={form.gstin}
					onChangeText={(v) => update('gstin', v.toUpperCase().slice(0, 15))}
					placeholder="22AAAAA0000A1Z5"
					placeholderTextColor={c.placeholder}
					autoCapitalize="characters"
					maxLength={15}
					style={[styles.input, inputStyle(c, theme)]}
				/>

				{/* Address */}
				<ThemedText style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}>
					पता
				</ThemedText>
				<TextInput
					testID="address-field"
					value={form.address}
					onChangeText={(v) => update('address', v)}
					placeholder="दुकान/मकान नं., गली, मोहल्ला"
					placeholderTextColor={c.placeholder}
					multiline
					numberOfLines={3}
					style={[styles.input, styles.textarea, inputStyle(c, theme)]}
				/>

				{/* City */}
				<ThemedText style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}>
					शहर / City
				</ThemedText>
				<TextInput
					testID="city-field"
					value={form.city}
					onChangeText={(v) => update('city', v)}
					placeholder="जैसे: जयपुर"
					placeholderTextColor={c.placeholder}
					style={[styles.input, inputStyle(c, theme)]}
				/>

				{/* State */}
				<ThemedText style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}>
					राज्य / State
				</ThemedText>
				<TextInput
					testID="state-field"
					value={form.state}
					onChangeText={(v) => update('state', v)}
					placeholder="जैसे: Rajasthan"
					placeholderTextColor={c.placeholder}
					style={[styles.input, inputStyle(c, theme)]}
				/>

				{/* Additional Info Section */}
				<Pressable
					onPress={() => toggleSection('branding')}
					style={[styles.sectionHeader, { borderBottomColor: c.border }]}
				>
					<ThemedText variant="h3">Branding & Additional Info</ThemedText>
					{sections.branding ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
				</Pressable>

				{sections.branding && (
					<View style={{ marginTop: 12 }}>
						{/* Email */}
						<ThemedText style={[styles.label, { color: c.onSurfaceVariant }]}>
							Email Address
						</ThemedText>
						<TextInput
							testID="email-field"
							value={form.email}
							onChangeText={(v) => update('email', v)}
							placeholder="info@business.com"
							keyboardType="email-address"
							style={[styles.input, inputStyle(c, theme)]}
						/>

						{/* Website */}
						<ThemedText
							style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}
						>
							Website
						</ThemedText>
						<TextInput
							testID="website-field"
							value={form.website}
							onChangeText={(v) => update('website', v)}
							placeholder="www.business.com"
							style={[styles.input, inputStyle(c, theme)]}
						/>

						{/* Description */}
						<ThemedText
							style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}
						>
							Business Description (max 200 chars)
						</ThemedText>
						<TextInput
							testID="desc-field"
							value={form.business_description}
							onChangeText={(v) => update('business_description', v.slice(0, 200))}
							placeholder="About your business..."
							multiline
							numberOfLines={2}
							style={[styles.input, styles.textareaCompact, inputStyle(c, theme)]}
						/>

						{/* Logo Picker */}
						<ThemedText
							style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}
						>
							Business Logo
						</ThemedText>
						<ImagePickerBox
							value={form.logo_url}
							onChange={(v) => update('logo_url', v)}
							label="Logo"
							c={c}
							theme={theme}
						/>

						{/* Signature Picker */}
						<ThemedText
							style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}
						>
							Signature Image (for invoices)
						</ThemedText>
						<ImagePickerBox
							value={form.signature_url}
							onChange={(v) => update('signature_url', v)}
							label="Signature"
							c={c}
							theme={theme}
						/>
					</View>
				)}

				{/* Bank Details & UPI Section */}
				<Pressable
					onPress={() => toggleSection('bank')}
					style={[styles.sectionHeader, { borderBottomColor: c.border, marginTop: 24 }]}
				>
					<ThemedText variant="h3">Bank Details & UPI</ThemedText>
					{sections.bank ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
				</Pressable>

				{sections.bank && (
					<View style={{ marginTop: 12 }}>
						<ThemedText style={[styles.label, { color: c.onSurfaceVariant }]}>
							UPI ID (for payments)
						</ThemedText>
						<TextInput
							testID="upi-id-field"
							value={form.upi_id}
							onChangeText={(v) => update('upi_id', v)}
							placeholder="9123456780@upi"
							style={[styles.input, inputStyle(c, theme)]}
						/>

						{form.upi_id ? (
							<View style={styles.qrContainer}>
								<QRCode
									value={`upi://pay?pa=${form.upi_id}&pn=${form.business_name}`}
									size={120}
								/>
								<ThemedText variant="caption" style={{ marginTop: 8 }}>
									PREVIEW: This QR will appear on invoices
								</ThemedText>
							</View>
						) : null}

						<ThemedText
							style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}
						>
							Bank Name
						</ThemedText>
						<TextInput
							value={form.bank_details.bank_name}
							onChangeText={(v) => updateBank('bank_name', v)}
							placeholder="State Bank of India"
							style={[styles.input, inputStyle(c, theme)]}
						/>

						<ThemedText
							style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}
						>
							Account Number
						</ThemedText>
						<TextInput
							value={form.bank_details.account_number}
							onChangeText={(v) => updateBank('account_number', v)}
							placeholder="1234567890"
							keyboardType="numeric"
							style={[styles.input, inputStyle(c, theme)]}
						/>

						<ThemedText
							style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}
						>
							IFSC Code
						</ThemedText>
						<TextInput
							value={form.bank_details.ifsc_code}
							onChangeText={(v) => updateBank('ifsc_code', v.toUpperCase())}
							placeholder="SBIN0001234"
							autoCapitalize="characters"
							style={[styles.input, inputStyle(c, theme)]}
						/>

						<ThemedText
							style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}
						>
							Account Holder Name
						</ThemedText>
						<TextInput
							value={form.bank_details.holder_name}
							onChangeText={(v) => updateBank('holder_name', v)}
							placeholder="John Doe"
							style={[styles.input, inputStyle(c, theme)]}
						/>
					</View>
				)}

				{/* Invoice Sequence Section */}
				<Pressable
					onPress={() => toggleSection('sequence')}
					style={[styles.sectionHeader, { borderBottomColor: c.border, marginTop: 24 }]}
				>
					<ThemedText variant="h3">Invoice Settings</ThemedText>
					{sections.sequence ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
				</Pressable>

				{sections.sequence && (
					<View style={{ marginTop: 12 }}>
						<ThemedText style={[styles.label, { color: c.onSurfaceVariant }]}>
							Invoice Prefix
						</ThemedText>
						<TextInput
							testID="invoice-prefix-field"
							value={form.invoice_prefix}
							onChangeText={(v) => update('invoice_prefix', v.slice(0, 10))}
							placeholder="INV-"
							autoCapitalize="characters"
							maxLength={10}
							style={[styles.input, inputStyle(c, theme)]}
						/>

						<ThemedText
							style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}
						>
							Next Invoice Number
						</ThemedText>
						<TextInput
							testID="invoice-sequence-field"
							value={form.invoice_sequence}
							onChangeText={(v) => update('invoice_sequence', v.replace(/\D/g, ''))}
							placeholder="1"
							keyboardType="number-pad"
							style={[styles.input, inputStyle(c, theme)]}
						/>
					</View>
				)}

				{saveError ? (
					<Text style={{ color: c.error, fontSize: 13, marginTop: 12 }}>{saveError}</Text>
				) : null}

				{saved ? (
					<Text style={{ color: c.success, fontSize: 13, marginTop: 12 }}>
						✓ Profile save हो गई
					</Text>
				) : null}

				{/* Save Button */}
				<Pressable
					testID="save-button"
					onPress={handleSave}
					disabled={saveLoading || !form.business_name.trim()}
					accessibilityRole="button"
					accessibilityState={{ disabled: saveLoading || !form.business_name.trim() }}
					style={[
						styles.saveBtn,
						{
							backgroundColor:
								saveLoading || !form.business_name.trim()
									? c.surfaceVariant
									: c.primary,
							borderRadius: theme.borderRadius.md,
							marginTop: theme.spacing.xl,
						},
					]}
				>
					<Text
						style={{
							color:
								saveLoading || !form.business_name.trim()
									? c.placeholder
									: c.onPrimary,
							fontSize: 16,
							fontWeight: '700',
						}}
					>
						{saveLoading ? 'Save हो रहा है...' : 'Save करें'}
					</Text>
				</Pressable>
			</ScrollView>
		</View>
	);
}

function inputStyle(
	c: ReturnType<typeof useTheme>['theme']['colors'],
	theme: ReturnType<typeof useTheme>['theme'],
) {
	return {
		borderColor: c.border,
		backgroundColor: c.surface,
		color: c.onSurface,
		borderRadius: theme.borderRadius.md,
	};
}

const styles = StyleSheet.create({
	root: { flex: 1 },
	center: { alignItems: 'center', justifyContent: 'center' },
	header: {
		alignItems: 'center',
		paddingVertical: 20,
		paddingHorizontal: 24,
	},
	label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
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
	saveBtn: {
		height: 52,
		alignItems: 'center',
		justifyContent: 'center',
	},
	retryBtn: {
		marginTop: 16,
		paddingHorizontal: 24,
		paddingVertical: 12,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
	},
	textareaCompact: {
		height: 60,
		textAlignVertical: 'top',
		paddingTop: 8,
	},
	qrContainer: {
		alignItems: 'center',
		marginTop: 16,
		padding: 16,
		backgroundColor: 'white',
		borderRadius: 8,
	},
	imageBox: {
		width: 100,
		height: 100,
		borderWidth: 1,
		borderStyle: 'dashed',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 4,
	},
	removeBtn: {
		position: 'absolute',
		top: -8,
		right: -8,
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

function ImagePickerBox({
	value,
	onChange,
	label,
	c,
	theme,
}: {
	value?: string;
	onChange: (v: string) => void;
	label: string;
	c: ReturnType<typeof useTheme>['theme']['colors'];
	theme: ReturnType<typeof useTheme>['theme'];
}) {
	const [uploading, setUploading] = useState(false);

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.7,
		});

		if (!result.canceled && result.assets[0].uri) {
			setUploading(true);
			try {
				const uri = result.assets[0].uri;
				const fileName = `${label.toLowerCase()}-${Date.now()}.jpg`;
				const path = await storageService.uploadFile('branding', uri, fileName, {
					contentType: 'image/jpeg',
				});
				const publicUrl = storageService.getPublicUrl('branding', path);
				onChange(publicUrl);
			} catch (e) {
				console.error(`${label} upload failed`, e);
				alert(`${label} upload failed. Please try again.`);
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
				styles.imageBox,
				{
					borderColor: c.border,
					backgroundColor: c.surface,
					borderRadius: theme.borderRadius.sm,
				},
			]}
		>
			{value ? (
				<View style={{ width: '100%', height: '100%' }}>
					<Image
						source={{ uri: value }}
						style={{ flex: 1, borderRadius: theme.borderRadius.sm }}
						contentFit="cover"
					/>
					<Pressable
						onPress={(e) => {
							e.stopPropagation();
							onChange('');
						}}
						style={[styles.removeBtn, { backgroundColor: c.error }]}
					>
						<X size={16} color="white" />
					</Pressable>
				</View>
			) : (
				<View style={{ alignItems: 'center' }}>
					<Camera size={24} color={c.placeholder} strokeWidth={1.5} />
					<Text style={{ color: c.placeholder, fontSize: 10, marginTop: 4 }}>
						{uploading ? '...' : `Add ${label}`}
					</Text>
				</View>
			)}
		</Pressable>
	);
}
