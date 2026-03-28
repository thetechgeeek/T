/**
 * Feature flags — control which features are enabled at compile time.
 * Change these to enable/disable features without touching feature code.
 */
export const Features = {
	PURCHASE_RETURNS: false,
	AI_ORDER_PARSING: true,
	MULTI_WAREHOUSE: false,
	GST_E_INVOICE: false,
	NOTIFICATIONS: true,
} as const;
