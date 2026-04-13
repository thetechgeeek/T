import React, { useState, useRef } from 'react';
import {
	GLASS_WHITE_MEDIUM,
	GLASS_WHITE_TEXT,
	MS_SYNC_POLL,
	OPACITY_INACTIVE,
	OVERLAY_COLOR_DARK,
} from '@/theme/uiMetrics';

const CAMERA_QUALITY = 0.5;
const OCR_PLACEHOLDER_DELAY_MS = MS_SYNC_POLL;
const QR_FRAME_TOP_MARGIN = 62;
const CAPTURE_BTN_OPACITY_IDLE = 1;
const CAPTURE_BTN_OPACITY_BUSY = 0.5;
const SCAN_FRAME_WIDTH = 300;
const SCAN_FRAME_HEIGHT = 180;
const SCAN_MANUAL_BOX_MAX_WIDTH = 400;
const SCAN_MANUAL_BOX_MARGIN_BOTTOM = 40;
const SCAN_CAPTURE_BUTTON_SIZE = 72;
const SCAN_CAPTURE_BUTTON_RADIUS = 36;
const SCAN_CAPTURE_BORDER_WIDTH = 4;
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
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
import { BORDER_RADIUS_PX, TOUCH_TARGET_MIN_PX } from '@/src/theme/layoutMetrics';

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
				Alert.alert(t('scanner.itemNotFound'), t('scanner.noMatchFound', { query }), [
					{ text: t('common.cancel'), style: 'cancel' },
					{
						text: t('inventory.add'),
						onPress: () => {
							router.push('/(app)/inventory/add' as Href);
						},
					},
				]);
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
			await cameraRef.current.takePictureAsync({ base64: true, quality: CAMERA_QUALITY });

			// 2. OCR placeholder: We will send photo.base64 to an LLM / Cloud Vision API
			await new Promise((res) => setTimeout(res, OCR_PLACEHOLDER_DELAY_MS));

			Alert.alert(
				t('scanner.itemFound'),
				`${t('scanner.ocrIntro')}\n\n${t('scanner.ocrDisclaimer')}`,
				[{ text: t('common.ok') }],
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
				<ThemedText variant="body" align="center" style={{ marginBottom: s.lg }}>
					{t('scanner.permissionText')}
				</ThemedText>
				<Button
					title={t('scanner.grantPermission')}
					accessibilityLabel="grant-camera-permission"
					accessibilityHint={t('scanner.cameraHint')}
					onPress={requestPermission}
				/>
			</AtomicScreen>
		);
	}

	return (
		<AtomicScreen backgroundColor={c.background} safeAreaEdges={[]}>
			<CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" />
			<View style={styles.overlay}>
				{/* Top dark area */}
				<View style={[styles.darkness, { flex: 1 }]} />

				{/* Middle scan area */}
				<View style={styles.scanRow}>
					<View style={styles.darkness} />
					<View
						style={[
							styles.scanFrame,
							{ borderColor: capturing ? c.primary : GLASS_WHITE_MEDIUM },
						]}
					>
						{capturing && (
							<SkeletonBlock
								width={56}
								height={56}
								borderRadius={28}
								style={{ marginTop: QR_FRAME_TOP_MARGIN, alignSelf: 'center' }}
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
						variant="caption"
						color={GLASS_WHITE_TEXT}
						style={{ opacity: OPACITY_INACTIVE, marginBottom: s.xl }}
					>
						{capturing ? t('scanner.analyzing') : t('scanner.alignFrame')}
					</ThemedText>

					{/* Capture Button */}
					<TouchableOpacity
						disabled={capturing}
						onPress={handleCaptureText}
						accessibilityRole="button"
						accessibilityLabel="capture-button"
						accessibilityHint={t('scanner.cameraHint')}
						accessibilityState={{ busy: capturing }}
						style={[
							styles.captureBtn,
							{
								backgroundColor: c.primary,
								opacity: capturing
									? CAPTURE_BTN_OPACITY_BUSY
									: CAPTURE_BTN_OPACITY_IDLE,
							},
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
							{t('scanner.manualEntry')}
						</ThemedText>
						<View style={{ flexDirection: 'row', gap: s.sm }}>
							<View style={{ flex: 1 }}>
								<TextInput
									accessibilityLabel="manual-entry-input"
									accessibilityHint={t('scanner.searchHint')}
									placeholder={t('scanner.manualEntryPlaceholder')}
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
								accessibilityHint={t('scanner.searchInventoryHint')}
								leftIcon={
									<Search
										size={20}
										color={c.onPrimary}
										importantForAccessibility="no"
									/>
								}
								onPress={() => handleSearch(manualInput)}
								style={{ width: TOUCH_TARGET_MIN_PX, paddingHorizontal: 0 }}
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
	darkness: { backgroundColor: OVERLAY_COLOR_DARK },
	scanRow: { flexDirection: 'row', height: SCAN_FRAME_HEIGHT },
	scanFrame: {
		width: SCAN_FRAME_WIDTH,
		height: SCAN_FRAME_HEIGHT,
		borderWidth: 2,
		borderRadius: BORDER_RADIUS_PX.xl,
		backgroundColor: 'transparent',
	},
	manualBox: {
		width: '85%',
		maxWidth: SCAN_MANUAL_BOX_MAX_WIDTH,
		marginBottom: SCAN_MANUAL_BOX_MARGIN_BOTTOM,
	},
	captureBtn: {
		width: SCAN_CAPTURE_BUTTON_SIZE,
		height: SCAN_CAPTURE_BUTTON_SIZE,
		borderRadius: SCAN_CAPTURE_BUTTON_RADIUS,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: SCAN_CAPTURE_BORDER_WIDTH,
		borderColor: GLASS_WHITE_MEDIUM,
	},
});
