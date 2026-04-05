import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save } from 'lucide-react-native';
import { ScreenHeader } from '@/src/components/molecules/ScreenHeader';
import { SkeletonBlock } from '@/src/components/molecules/SkeletonBlock';
import { useThemeTokens } from '@/src/hooks/useThemeTokens';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import { inventoryService } from '@/src/services/inventoryService';
import { useLocale } from '@/src/hooks/useLocale';
import { ThemedText } from '@/src/components/atoms/ThemedText';
import { TextInput } from '@/src/components/atoms/TextInput';
import { Button } from '@/src/components/atoms/Button';
import { Screen as AtomicScreen } from '@/src/components/atoms/Screen';
import type { UUID } from '@/src/types/common';
import type { StockOpType, InventoryItem } from '@/src/types/inventory';

import logger from '@/src/utils/logger';

const getSchema = (t: (key: string) => string) =>
	z.object({
		quantity: z.string().min(1, t('common.required')),
		reason: z.string().optional(),
	});

type FormData = z.infer<ReturnType<typeof getSchema>>;

export default function StockOpScreen() {
	const { c, s, r } = useThemeTokens();
	const { t } = useLocale();
	const router = useRouter();
	const { id, type } = useLocalSearchParams<{ id: UUID; type: StockOpType }>();

	const { performStockOperation } = useInventoryStore();
	const [submitting, setSubmitting] = useState(false);
	const [item, setItem] = useState<InventoryItem | null>(null);
	const [loadError, setLoadError] = useState(false);

	useEffect(() => {
		if (id) {
			inventoryService
				.fetchItemById(id)
				.then(setItem)
				.catch((e) => {
					logger.error('error', e instanceof Error ? e : new Error(String(e)));
					setLoadError(true);
				});
		}
	}, [id]);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(getSchema(t)),
		defaultValues: { quantity: '', reason: '' },
	});

	const isStockIn = type === 'stock_in';
	const title = isStockIn
		? `${t('inventory.stockIn')} (${t('common.add')})`
		: `${t('inventory.stockOut')} (${t('common.delete')})`;

	const onSubmit = async (data: FormData) => {
		if (!id || !type) return;
		const qty = parseInt(data.quantity);
		if (isNaN(qty) || qty <= 0) {
			Alert.alert(t('common.errorTitle'), t('inventory.stockOpValidationError'), [
				{ text: t('common.ok') },
			]);
			return;
		}

		setSubmitting(true);
		try {
			const change = isStockIn ? qty : -qty;
			await performStockOperation(id, type, change, data.reason || undefined);
			Alert.alert(t('common.successTitle'), t('inventory.stockOpSuccess'));
			router.back();
		} catch (err: unknown) {
			Alert.alert(
				t('common.errorTitle'),
				err instanceof Error ? err.message : t('inventory.stockOpFailed'),
				[{ text: t('common.ok') }],
			);
		} finally {
			setSubmitting(false);
		}
	};

	if (!item) {
		return (
			<AtomicScreen safeAreaEdges={['bottom']} withKeyboard={false}>
				<ScreenHeader title={title} />
				{loadError ? (
					<View
						style={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center',
							padding: s.lg,
						}}
					>
						<ThemedText color={c.error}>{t('inventory.loadError')}</ThemedText>
						<Button
							title={t('common.back')}
							variant="ghost"
							onPress={() => router.back()}
							style={{ marginTop: s.md }}
						/>
					</View>
				) : (
					<View testID="loading-spinner" style={{ padding: s.lg, gap: s.md }}>
						<SkeletonBlock height={80} borderRadius={r.md} />
						<SkeletonBlock height={52} borderRadius={r.md} />
						<SkeletonBlock height={52} borderRadius={r.md} />
					</View>
				)}
			</AtomicScreen>
		);
	}

	return (
		<AtomicScreen safeAreaEdges={['bottom']} withKeyboard>
			<ScreenHeader title={title} />

			<View style={{ padding: s.lg }}>
				<View
					style={[
						styles.infoBox,
						{
							backgroundColor: c.surfaceVariant,
							borderRadius: r.md,
							marginBottom: s.xl,
						},
					]}
				>
					<ThemedText variant="caption" color={c.onSurfaceVariant}>
						{t('invoice.addItem')}
					</ThemedText>
					<ThemedText weight="bold" style={{ marginTop: 4 }}>
						{item.design_name}
					</ThemedText>
					<ThemedText variant="body2" style={{ marginTop: 4 }}>
						{t('inventory.currentStock')}:{' '}
						<ThemedText weight="bold">
							{item.box_count} {t('common.boxes')}
						</ThemedText>
					</ThemedText>
				</View>

				<Controller
					control={control}
					name="quantity"
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							label={t('inventory.placeholders.quantity')}
							placeholder={t('inventory.placeholders.quantity')}
							keyboardType="number-pad"
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							error={errors.quantity?.message}
						/>
					)}
				/>

				<Controller
					control={control}
					name="reason"
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							label={t('inventory.reason')}
							placeholder={t('inventory.placeholders.reason')}
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
						/>
					)}
				/>

				<Button
					title={t('common.confirm')}
					onPress={handleSubmit(onSubmit)}
					loading={submitting}
					style={{ marginTop: s.lg }}
					leftIcon={<Save size={20} color={c.onPrimary} />}
				/>
			</View>
		</AtomicScreen>
	);
}

const styles = StyleSheet.create({
	infoBox: { padding: 16 },
});
