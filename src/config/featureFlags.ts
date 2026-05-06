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
	LIVE_FINANCE_BANKING_SURFACES: false,
	LIVE_FINANCE_OTHER_INCOME: false,
	LIVE_DATA_VERIFICATION: false,
	LIVE_CLOSE_FINANCIAL_YEAR: false,
	LIVE_TALLY_EXPORT: false,
	LIVE_EXPENSE_SUMMARY_REPORT: false,
	LIVE_DAY_BOOK_REPORT: false,
	LIVE_BALANCE_SHEET_REPORT: false,
	LIVE_PARTY_PROFIT_REPORT: false,
	LIVE_STATUTORY_REPORTS: false,
	LIVE_TRANSACTION_DOCUMENTS: false,
	LIVE_REPORT_EXPORTS: false,
} as const;

export type FeatureFlagName = keyof typeof Features;

export function isFeatureEnabled(flag: FeatureFlagName): boolean {
	return Features[flag];
}
