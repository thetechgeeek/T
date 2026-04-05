import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Search, Aperture } from 'lucide-react-native';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useLocale } from '@/src/hooks/useLocale';
import { inventoryService } from '@/src/services/inventoryService';
import { TextInput } from '@/src/components/atoms/TextInput';
import { Button } from '@/src/components/atoms/Button';
import { SkeletonBlock } from '@/src/components/molecules/SkeletonBlock';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import logger from '@/src/utils/logger';

export default function ScanTab() {
	const { theme, c, s, r } = useThemeTokens();
	const { t } = useLocale();
	const router = useRouter();

	const [permission, requestPermission] = useCameraPermissions();
	const cameraRef = useRef<CameraView>(null);

	const [manualInput, setManualInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [capturing, setCapturing] = useState(false);

	const handleSearch = async (query: string) => {
		if (!query.trim()) return;
		setLoading(true);
		try {
			const { data } = await inventoryService.fetchItems({ search: query });

			if (data && data.length > 0) {
				if (data.length === 1) {
					router.push(`/(app)/inventory/${data[0].id}`);
				} else {
					const exact = data.find(
						(i) =>
							i.design_name.toLowerCase() === query.toLowerCase() ||
							i.base_item_number.toLowerCase() === query.toLowerCase(),
					);
					router.push(`/(app)/inventory/${exact ? exact.id : data[0].id}`);
				}
			} else {
				Alert.alert(
					'Not Found',
					`No item found matching "${query}". Would you like to add it?`,
					[
						{ text: 'Cancel', style: 'cancel' },
						{
							text: 'Add Item',
							onPress: () => {
								router.push('/(app)/inventory/add');
							},
						},
					],
				);
			}
		} catch (err: unknown) {
			logger.error(
				'Failed to search inventory',
				err instanceof Error ? err : new Error(String(err)),
			);
			Alert.alert(
				t('common.errorTitle'),
				err instanceof Error ? err.message : t('common.unexpectedError'),
				[{ text: t('common.ok') }],
			);
		} finally {
			setLoading(false);
		}
	};

	const handleCaptureText = async () => {
		if (!cameraRef.current) return;
		setCapturing(true);
		try {
			// 1. Take photo
			await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });

			// 2. OCR placeholder: We will send photo.base64 to an LLM / Cloud Vision API
			// Since LLM connectivity is planned for Phase 7 (along with PDF Parsing), we mock it for now.
			await new Promise((res) => setTimeout(res, 1500));

			Alert.alert(
				'Simulated OCR Success',
				'Image captured! Cloud OCR integration will be wired up during Phase 7.\n\nFor now, please use the manual entry field to test search.',
				[{ text: 'OK' }],
			);
		} catch (err: unknown) {
			logger.error(
				'Failed to capture image',
				err instanceof Error ? err : new Error(String(err)),
			);
			Alert.alert(
				t('common.errorTitle'),
				err instanceof Error ? err.message : t('common.unexpectedError'),
				[{ text: t('common.ok') }],
			);
		} finally {
			setCapturing(false);
		}
	};

	if (!permission) {
		return (
			<AtomicScreen>
				<View />
			</AtomicScreen>
		);
	}

	if (!permission.granted) {
		return (
			<AtomicScreen style={{ justifyContent: 'center', padding: s.xl }}>
				<ThemedText align="center" style={{ marginBottom: s.lg, fontSize: 16 }}>
					We need your permission to show the camera for scanning tile box text.
				</ThemedText>
				<Button
					title="Grant Permission"
					accessibilityLabel="grant-camera-permission"
					accessibilityHint="Allow TileMaster to use your camera for scanning"
					onPress={requestPermission}
				/>
			</AtomicScreen>
		);
	}

	return (
		<AtomicScreen backgroundColor="#000" safeAreaEdges={[]}>
			<CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" />
			<View style={styles.overlay}>
				{/* Top dark area */}
				<View style={[styles.darkness, { flex: 1 }]} />

				{/* Middle scan area */}
				<View style={{ flexDirection: 'row', height: 180 }}>
					<View style={styles.darkness} />
					<View
						style={[
							styles.scanFrame,
							{ borderColor: capturing ? c.primary : '#ffffff80' },
						]}
					>
						{capturing && (
							<SkeletonBlock
								width={56}
								height={56}
								borderRadius={28}
								style={{ marginTop: 62, alignSelf: 'center' }}
							/>
						)}
					</View>
					<View style={styles.darkness} />
				</View>

				{/* Bottom area */}
				<View
					style={[styles.darkness, { flex: 1, paddingTop: s.xl, alignItems: 'center' }]}
				>
					<ThemedText
						color="#fff"
						style={{ fontSize: 14, opacity: 0.8, marginBottom: s.xl }}
					>
						{capturing
							? 'Analyzing text...'
							: 'Align item name / model number in frame'}
					</ThemedText>

					{/* Capture Button */}
					<TouchableOpacity
						disabled={capturing}
						onPress={handleCaptureText}
						accessibilityRole="button"
						accessibilityLabel="capture-button"
						accessibilityHint="Take a photo to scan item text"
						accessibilityState={{ busy: capturing }}
						style={[
							styles.captureBtn,
							{ backgroundColor: c.primary, opacity: capturing ? 0.5 : 1 },
						]}
					>
						<Aperture size={32} color={c.onPrimary} importantForAccessibility="no" />
					</TouchableOpacity>

					<View style={{ flex: 1 }} />

					{/* Manual Entry */}
					<View
						style={[
							styles.manualBox,
							{
								backgroundColor: theme.colors.card,
								borderRadius: r.lg,
								padding: s.md,
							},
						]}
					>
						<ThemedText
							weight="semibold"
							accessibilityRole="header"
							style={{ marginBottom: s.sm }}
						>
							Manual Entry
						</ThemedText>
						<View style={{ flexDirection: 'row', gap: s.sm }}>
							<View style={{ flex: 1 }}>
								<TextInput
									accessibilityLabel="manual-entry-input"
									accessibilityHint="Type an item name or design number to search"
									placeholder="Enter item or design #"
									value={manualInput}
									onChangeText={setManualInput}
									containerStyle={{ marginBottom: 0 }}
									returnKeyType="search"
									onSubmitEditing={() => handleSearch(manualInput)}
									editable={!loading}
								/>
							</View>
							<Button
								title=""
								accessibilityLabel="scan-search-button"
								accessibilityHint="Search inventory for entered text"
								leftIcon={
									<Search
										size={20}
										color={c.onPrimary}
										importantForAccessibility="no"
									/>
								}
								onPress={() => handleSearch(manualInput)}
								style={{ width: 48, paddingHorizontal: 0 }}
								loading={loading}
							/>
						</View>
					</View>
				</View>
			</View>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	overlay: { flex: 1 },
	darkness: { backgroundColor: 'rgba(0,0,0,0.6)' },
	scanFrame: {
		width: 300,
		height: 180,
		borderWidth: 2,
		borderRadius: 16,
		backgroundColor: 'transparent',
	},
	manualBox: { width: '85%', maxWidth: 400, marginBottom: 40 },
	captureBtn: {
		width: 72,
		height: 72,
		borderRadius: 36,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 4,
		borderColor: '#ffffff80',
	},
});
