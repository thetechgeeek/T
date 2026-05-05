import type { BusinessProfileInput } from '@/src/services/businessProfileService';

export const TOTAL_SETUP_STEPS = 4;

export type BusinessType = 'retail' | 'wholesale' | 'manufacturing' | 'service' | 'other';

export interface WizardData {
	businessName: string;
	ownerName: string;
	phone: string;
	businessType: BusinessType | null;
	address: string;
	city: string;
	state: string;
	pincode: string;
	gstRegistered: boolean | null;
	gstin: string;
	pan: string;
	invoicePrefix: string;
	invoiceStartNumber: string;
	logoUrl?: string;
}

export const BUSINESS_TYPES: { key: BusinessType; label: string; subLabel: string }[] = [
	{ key: 'retail', label: 'Retail Shop', subLabel: 'दुकान' },
	{ key: 'wholesale', label: 'Wholesale', subLabel: 'थोक' },
	{ key: 'manufacturing', label: 'Manufacturing', subLabel: 'उत्पादन' },
	{ key: 'service', label: 'Service', subLabel: 'सेवा' },
	{ key: 'other', label: 'Other', subLabel: 'अन्य' },
];

export function createInitialWizardData(userPhone?: string): WizardData {
	return {
		businessName: '',
		ownerName: '',
		phone: userPhone?.replace('+91', '') ?? '',
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
	};
}

export function isSetupStepOneValid(data: WizardData): boolean {
	return data.businessName.trim().length >= 2 && data.ownerName.trim().length >= 1;
}

export function canAdvanceSetupStep(step: number, data: WizardData): boolean {
	if (step === 1) return isSetupStepOneValid(data);
	return true;
}

export function buildBusinessProfileSetupPayload(data: WizardData): BusinessProfileInput {
	return {
		business_name: data.businessName,
		phone: data.phone ? `+91${data.phone}` : undefined,
		gstin: data.gstin || undefined,
		address: data.address || undefined,
		city: data.city || undefined,
		state: data.state || undefined,
		invoice_prefix: data.invoicePrefix || 'INV-',
		invoice_sequence: parseInt(data.invoiceStartNumber, 10) || 1,
		logo_url: data.logoUrl || undefined,
	};
}
