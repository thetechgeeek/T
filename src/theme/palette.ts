import type { ThemeColors } from './index';
import {
	BASE_THEME_COLOR_RECIPES,
	HIGH_CONTRAST_THEME_COLOR_RECIPES,
	MEDIA_OVERLAY_TOKENS,
	PRIMITIVE_COLOR_PALETTES,
	QUALITATIVE_DATA_PALETTE_TOKENS,
	SURFACE_TIER_TOKENS,
} from './designTokens';

/**
 * Single source for #hex literals. App code should use theme colors, `palette.*`,
 * or named exports from this file — not inline hex strings.
 */
export const primitiveColorPalettes = PRIMITIVE_COLOR_PALETTES;
export const surfaceTierTokens = SURFACE_TIER_TOKENS;
export const mediaOverlayTokens = MEDIA_OVERLAY_TOKENS;

export const lightColors: ThemeColors = {
	...BASE_THEME_COLOR_RECIPES.light,
};

export const darkColors: ThemeColors = {
	...BASE_THEME_COLOR_RECIPES.dark,
};

export const highContrastLightColors: ThemeColors = {
	...HIGH_CONTRAST_THEME_COLOR_RECIPES.light,
};

export const highContrastDarkColors: ThemeColors = {
	...HIGH_CONTRAST_THEME_COLOR_RECIPES.dark,
};

/** Shared tokens (shadows, brand chrome, integrations) — use from theme where possible. */
export const palette = {
	white: '#FFFFFF',
	black: '#000000',
	shadow: '#000000',
	shadowWarm: '#4A3828',
	whatsapp: '#25D366',
	white50alpha: '#ffffff80',
	grayCCC: '#CCCCCC',
	gray888: '#888888',
	grayF0: '#F0F0F0',
	grayE0: '#E0E0E0',
	grayB0: '#B0B0B0',
	grayF5: '#F5F5F5',
	gray666: '#666666',
	gray555: '#555555',
	gray777: '#777777',
	gray333: '#333333',
	grayDDD: '#DDDDDD',
	grayEEE: '#EEEEEE',
	borderCCC: '#CCCCCC',
	/** PDF / print HTML */
	pdfPrimary: '#C1440E',
	pdfBodyText: '#333333',
	pdfMutedUppercase: '#666666',
	pdfBillToHeading: '#555555',
	pdfTableHeaderBg: '#F5F5F5',
	pdfGrandTotalBg: '#FFFCF8',
	pdfFooterMuted: '#777777',
	/** Error boundary (may render outside theme) */
	errorBoundaryText: '#666666',
	errorBoundaryButton: '#2563EB',
	/** Invoice create segmented control (disabled look) */
	segmentTrack: '#E0E0E0',
	segmentBorder: '#B0B0B0',
	segmentThumbOff: '#B0B0B0',
	/** Verify / warning banner */
	verifyBannerBg: '#FFF3CD',
	verifyBannerBorder: '#FFC107',
	verifyBannerText: '#856404',
	/** Misc */
	loanAccent: '#C0643A',
	/** Material Design accents (loans, icons) */
	materialPurple: '#9C27B0',
	materialBlue: '#2196F3',
	materialOrange: '#FF9800',
	materialGreen: '#4CAF50',
	materialBrown: '#795548',
	/** E-wallet brand approximations */
	ewalletPhonePe: '#5F259F',
	ewalletGPay: '#4285F4',
	ewalletPaytm: '#00BAF2',
	ewalletOther: '#607D8B',
	/** Report chart (demo / static) */
	chartPurchase: '#4A90E2',
	chartSalaries: '#E67E22',
	chartTransport: '#2ECC71',
	chartUtilities: '#9B59B6',
	chartMisc: '#E74C3C',
	/** Tailwind-like transaction chips (reports) */
	txSale: '#22c55e',
	txPurchase: '#ef4444',
	txPaymentIn: '#14b8a6',
	txPaymentOut: '#f97316',
	txExpense: '#a855f7',
	/** Status rows (estimates / credit notes) */
	statusInfoFg: '#1E40AF',
	/** Backup / destructive */
	backupDangerBg: '#FEF2F2',
	backupDangerBorder: '#FCA5A5',
	backupDangerBorderStrong: '#EF4444',
	/** Inventory fallback tints when theme optional */
	inventoryGainTint: '#e6f4ea',
	inventoryLossTint: '#fce8e6',
	inventoryGainText: '#1e8e3e',
	/** Purchase status fallbacks */
	purchasePaidTint: '#e8f5e9',
	purchasePartialTint: '#fff8e1',
	purchaseUnpaidTint: '#fdecea',
	purchasePartialText: '#f57f17',
} as const;

/** Avatar background options (customers / suppliers). */
export const partyAvatarColors = [
	'#E57373',
	'#F06292',
	'#BA68C8',
	'#7986CB',
	'#4FC3F7',
	'#4DB6AC',
	'#81C784',
	'#FFB74D',
] as const;

/** Pickers: expense categories, item categories, party filters (same sequence). */
export const expenseCategoryPickColors = [
	'#C1440E',
	'#1A8754',
	'#1D4ED8',
	'#B45309',
	'#7C3AED',
	'#0E7490',
	'#BE185D',
	'#047857',
	'#92400E',
	'#065F46',
	'#1E40AF',
	'#581C87',
] as const;

/** Charts and analytics surfaces: qualitative palette tuned for color-blind-safe separation. */
export const chartQualitativeColors = [...QUALITATIVE_DATA_PALETTE_TOKENS] as const;

export const printThemeSwatches = [
	{ key: 'classic', label: 'Classic', color: '#2D2D2D' },
	{ key: 'professional', label: 'Professional', color: '#1D4ED8' },
	{ key: 'modern', label: 'Modern', color: '#C1440E' },
	{ key: 'minimal', label: 'Minimal', color: '#6B5E52' },
	{ key: 'traditional', label: 'Traditional', color: '#047857' },
	{ key: 'colourful', label: 'Colourful', color: '#7C3AED' },
] as const;

/** Demo chart data (major units); not tied to a live currency */
const DEMO_EXPENSE_PURCHASE = 820_000;
const DEMO_EXPENSE_SALARIES = 185_000;
const DEMO_EXPENSE_TRANSPORT = 42_000;
const DEMO_EXPENSE_UTILITIES = 18_500;
const DEMO_EXPENSE_MISC = 11_200;

export const expenseReportDemoSlices = [
	{ id: '1', name: 'Purchase', amount: DEMO_EXPENSE_PURCHASE, color: '#4A90E2' },
	{ id: '2', name: 'Salaries', amount: DEMO_EXPENSE_SALARIES, color: '#E67E22' },
	{ id: '3', name: 'Transport', amount: DEMO_EXPENSE_TRANSPORT, color: '#2ECC71' },
	{ id: '4', name: 'Utilities', amount: DEMO_EXPENSE_UTILITIES, color: '#9B59B6' },
	{ id: '5', name: 'Misc', amount: DEMO_EXPENSE_MISC, color: '#E74C3C' },
] as const;

export const allTransactionsTypeColors = {
	all: '#888888',
	sale: '#22c55e',
	purchase: '#ef4444',
	payment_in: '#14b8a6',
	payment_out: '#f97316',
	expense: '#a855f7',
} as const;

export const themePresetColorOverrides = {
	executive: {
		light: {
			background: '#F4F7FB',
			surfaceVariant: '#E6ECF5',
			primary: '#1F4B99',
			primaryLight: '#4373C9',
			primaryDark: '#12356D',
			primaryGradientStart: '#2858AA',
			primaryGradientEnd: '#12356D',
			primaryContainer: '#DEE8FB',
			onPrimaryContainer: '#0D1B35',
			secondary: '#475569',
			onSurfaceVariant: '#556579',
			placeholder: '#8391A5',
			border: '#D6DFEB',
			borderStrong: '#A8B6C8',
			tabActive: '#1F4B99',
			badge: '#1F4B99',
			shadow: '#243244',
			info: '#2563EB',
		},
		dark: {
			background: '#0D1420',
			surface: '#131C2B',
			card: '#131C2B',
			surfaceVariant: '#1C2635',
			primary: '#7EA6FF',
			primaryLight: '#A8C0FF',
			primaryDark: '#4F79D1',
			primaryGradientStart: '#7EA6FF',
			primaryGradientEnd: '#4F79D1',
			primaryContainer: '#1C2F55',
			onPrimaryContainer: '#D7E5FF',
			secondary: '#A8B6C8',
			onSurfaceVariant: '#93A3B8',
			placeholder: '#6E7D92',
			border: '#253146',
			borderStrong: '#3A4A63',
			tabBar: '#131C2B',
			tabActive: '#7EA6FF',
			badge: '#7EA6FF',
			shadow: '#000000',
			info: '#93C5FD',
		},
	},
	studio: {
		light: {
			background: '#FFF7F2',
			surfaceVariant: '#F5E7DA',
			primary: '#006C67',
			primaryLight: '#14948E',
			primaryDark: '#004845',
			primaryGradientStart: '#14948E',
			primaryGradientEnd: '#006C67',
			primaryContainer: '#DDF7F5',
			onPrimaryContainer: '#032624',
			secondary: '#9A3412',
			success: '#0F8B6D',
			warning: '#C67C00',
			error: '#C2410C',
			info: '#0EA5E9',
			tabActive: '#006C67',
			badge: '#006C67',
			shadow: '#615347',
		},
		dark: {
			background: '#101312',
			surface: '#161B1A',
			card: '#161B1A',
			surfaceVariant: '#1F2826',
			primary: '#52D6CF',
			primaryLight: '#80E4DF',
			primaryDark: '#14948E',
			primaryGradientStart: '#52D6CF',
			primaryGradientEnd: '#14948E',
			primaryContainer: '#0B3C39',
			onPrimaryContainer: '#D9FFFB',
			secondary: '#F59E0B',
			success: '#34D399',
			warning: '#FBBF24',
			error: '#FB923C',
			info: '#38BDF8',
			tabBar: '#161B1A',
			tabActive: '#52D6CF',
			badge: '#52D6CF',
			border: '#27302F',
			borderStrong: '#3D4A48',
			shadow: '#000000',
		},
	},
	mono: {
		light: {
			background: '#F7F7F6',
			surfaceVariant: '#ECECEA',
			primary: '#111827',
			primaryLight: '#374151',
			primaryDark: '#030712',
			primaryGradientStart: '#374151',
			primaryGradientEnd: '#111827',
			primaryContainer: '#E5E7EB',
			onPrimaryContainer: '#111827',
			secondary: '#4B5563',
			success: '#047857',
			warning: '#B45309',
			error: '#B91C1C',
			info: '#1D4ED8',
			border: '#DDDDD9',
			borderStrong: '#A8A8A1',
			tabActive: '#111827',
			badge: '#111827',
			shadow: '#2E2E2B',
		},
		dark: {
			background: '#0B0B0A',
			surface: '#111111',
			card: '#111111',
			surfaceVariant: '#1D1D1B',
			onSurfaceVariant: '#A6A6A1',
			placeholder: '#73736E',
			primary: '#F3F4F6',
			primaryLight: '#FFFFFF',
			primaryDark: '#D1D5DB',
			primaryGradientStart: '#F9FAFB',
			primaryGradientEnd: '#D1D5DB',
			primaryContainer: '#2A2A27',
			onPrimaryContainer: '#F9FAFB',
			secondary: '#D4D4D0',
			border: '#2A2A27',
			borderStrong: '#454540',
			tabBar: '#111111',
			tabActive: '#F3F4F6',
			badge: '#F3F4F6',
			shadow: '#000000',
		},
	},
} as const satisfies Record<string, { light: Partial<ThemeColors>; dark: Partial<ThemeColors> }>;

export const loanTypeColors: Record<string, string> = {
	'Term Loan': '#4CAF50',
	OD: '#2196F3',
	Personal: '#9C27B0',
	Vehicle: '#FF9800',
	Mortgage: '#795548',
};
