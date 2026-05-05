import { useState } from 'react';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { businessProfileService } from '@/src/services/businessProfileService';
import {
	buildBusinessProfileSetupPayload,
	canAdvanceSetupStep,
	createInitialWizardData,
	TOTAL_SETUP_STEPS,
	type BusinessType,
	type WizardData,
} from './setupFlowModel';

export function useSetupFlow() {
	const router = useRouter();
	const { user } = useAuthStore();
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [data, setData] = useState<WizardData>(() =>
		createInitialWizardData((user as { phone?: string } | null)?.phone),
	);

	const update = (key: keyof WizardData, value: string | boolean | null | BusinessType) =>
		setData((prev) => ({ ...prev, [key]: value }));

	const canGoNext = canAdvanceSetupStep(step, data);

	const handleNext = () => {
		setError('');
		if (step < TOTAL_SETUP_STEPS) {
			setStep((current) => current + 1);
		}
	};

	const handleBack = () => {
		setError('');
		if (step > 1) {
			setStep((current) => current - 1);
		}
	};

	const handleFinish = async () => {
		setLoading(true);
		setError('');
		try {
			await businessProfileService.upsert(buildBusinessProfileSetupPayload(data));
			router.replace('/(app)/(tabs)' as Href);
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : 'Setup में समस्या हुई। फिर से try करें।');
		} finally {
			setLoading(false);
		}
	};

	return {
		step,
		loading,
		error,
		data,
		update,
		canGoNext,
		handleNext,
		handleBack,
		handleFinish,
		progressFraction: step / TOTAL_SETUP_STEPS,
	};
}
