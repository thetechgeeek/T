import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useShallow } from 'zustand/react/shallow';
import { inventoryService } from '@/src/services/inventoryService';
import { useInventoryStore } from '@/src/stores/inventoryStore';
import type { UUID } from '@/src/types/common';
import {
	buildInventoryAddFormValues,
	buildInventoryItemPayload,
	generateInventoryItemCode,
	getInventoryAddSchema,
	INVENTORY_ADD_DEFAULT_VALUES,
	type InventoryAddFormData,
} from './inventoryAddFormModel';

export function useInventoryAddFlow(t: (key: string) => string) {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id?: UUID }>();
	const isEditing = !!id;
	const { createItem, updateItem } = useInventoryStore(
		useShallow((st) => ({ createItem: st.createItem, updateItem: st.updateItem })),
	);
	const [loading, setLoading] = useState(isEditing);
	const [submitting, setSubmitting] = useState(false);

	const form = useForm<InventoryAddFormData>({
		resolver: zodResolver(getInventoryAddSchema(t)),
		defaultValues: INVENTORY_ADD_DEFAULT_VALUES,
	});
	const { control, handleSubmit, reset, setValue } = form;

	const watched = {
		selling: useWatch({ control, name: 'selling_price' }),
		cost: useWatch({ control, name: 'cost_price' }),
		gst: useWatch({ control, name: 'gst_rate' }),
		trackStock: useWatch({ control, name: 'track_stock' }),
		secondaryUnit: useWatch({ control, name: 'use_secondary_unit' }),
		primaryUnit: useWatch({ control, name: 'primary_unit' }),
		secondaryUnitName: useWatch({ control, name: 'secondary_unit_name' }),
	};

	const handleAutoGenerateCode = () => {
		setValue('item_code', generateInventoryItemCode(), { shouldDirty: true });
	};

	useEffect(() => {
		if (!isEditing || !id) return;

		inventoryService
			.fetchItemById(id)
			.then((data) => {
				reset(buildInventoryAddFormValues(data));
				setLoading(false);
			})
			.catch(() => {
				Alert.alert(t('common.errorTitle'), t('inventory.loadError'), [
					{ text: t('common.ok') },
				]);
				router.back();
			});
	}, [id, isEditing, reset, router, t]);

	const onSubmit = async (data: InventoryAddFormData) => {
		setSubmitting(true);
		try {
			const payload = buildInventoryItemPayload(data);

			if (isEditing && id) {
				await updateItem(id, payload);
				Alert.alert(t('common.successTitle'), t('inventory.updateSuccess'));
			} else {
				await createItem(payload);
				Alert.alert(t('common.successTitle'), t('inventory.addSuccess'));
			}
			router.back();
		} catch (err: unknown) {
			Alert.alert(
				t('common.errorTitle'),
				err instanceof Error ? err.message : t('inventory.saveError'),
				[{ text: t('common.ok') }],
			);
		} finally {
			setSubmitting(false);
		}
	};

	return {
		form,
		watched,
		isEditing,
		loading,
		submitting,
		handleAutoGenerateCode,
		submitForm: handleSubmit(onSubmit),
	};
}
