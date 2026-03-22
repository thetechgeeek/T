// GST rate slabs used in India for ceramic tiles
export const GST_SLABS = [5, 12, 18, 28] as const;
export type GstSlab = (typeof GST_SLABS)[number];

// HSN codes for tiles/ceramics
export const HSN_CODES = [
  { code: '6908', description: 'Glazed ceramic tiles' },
  { code: '6907', description: 'Unglazed ceramic tiles' },
  { code: '6914', description: 'Other ceramic articles' },
  { code: '3922', description: 'Bathroom fittings (plastic)' },
] as const;

export const DEFAULT_GST_RATE = 18;
export const DEFAULT_HSN_CODE = '6908';
