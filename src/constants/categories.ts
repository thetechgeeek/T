import type { TileCategory } from '@/src/types/inventory';

export const TILE_CATEGORIES: {
	value: TileCategory;
	labelEn: string;
	labelHi: string;
	icon: string;
}[] = [
	{ value: 'GLOSSY', labelEn: 'Glossy', labelHi: 'ग्लॉसी', icon: '✨' },
	{ value: 'FLOOR', labelEn: 'Floor', labelHi: 'फर्श', icon: '🟫' },
	{ value: 'MATT', labelEn: 'Matt', labelHi: 'मैट', icon: '🔲' },
	{ value: 'SATIN', labelEn: 'Satin', labelHi: 'साटन', icon: '💎' },
	{ value: 'WOODEN', labelEn: 'Wooden', labelHi: 'वुडन', icon: '🪵' },
	{ value: 'ELEVATION', labelEn: 'Elevation', labelHi: 'एलिवेशन', icon: '🏛️' },
	{ value: 'OTHER', labelEn: 'Other', labelHi: 'अन्य', icon: '📦' },
];

export const ALL_CATEGORY_OPTION = {
	value: 'ALL',
	labelEn: 'All',
	labelHi: 'सभी',
	icon: '🔹',
} as const;
