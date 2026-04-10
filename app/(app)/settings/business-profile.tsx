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

interface ProfileForm {
	business_name: string;
	phone: string;
	gstin: string;
	address: string;
	city: string;
	state: string;
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
		gstin: '',
		address: '',
		city: '',
		state: '',
		invoice_prefix: 'INV-',
		invoice_sequence: '1',
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
						gstin: (profile as { gstin?: string }).gstin ?? '',
						address: (profile as { address?: string }).address ?? '',
						city: (profile as { city?: string }).city ?? '',
						state: (profile as { state?: string }).state ?? '',
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
				gstin: form.gstin || undefined,
				address: form.address || undefined,
				city: form.city || undefined,
				state: form.state || undefined,
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

				{/* Invoice Prefix */}
				<ThemedText style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}>
					Invoice Prefix
				</ThemedText>
				<TextInput
					testID="invoice-prefix-field"
					value={form.invoice_prefix}
					onChangeText={(v) => update('invoice_prefix', v.slice(0, 10))}
					placeholder="INV-"
					placeholderTextColor={c.placeholder}
					autoCapitalize="characters"
					maxLength={10}
					style={[styles.input, inputStyle(c, theme)]}
				/>

				{/* Invoice Sequence */}
				<ThemedText style={[styles.label, { color: c.onSurfaceVariant, marginTop: 16 }]}>
					Current Invoice Number
				</ThemedText>
				<TextInput
					testID="invoice-sequence-field"
					value={form.invoice_sequence}
					onChangeText={(v) => update('invoice_sequence', v.replace(/\D/g, ''))}
					placeholder="1"
					placeholderTextColor={c.placeholder}
					keyboardType="number-pad"
					style={[styles.input, inputStyle(c, theme)]}
				/>

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
});
