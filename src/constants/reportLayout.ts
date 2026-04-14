/** Minimum width for right-aligned amount columns in report tables */
const REPORT_NUM_COLUMN_MIN_WIDTH = 110;
export const REPORT_NUM_COLUMN_MIN_WIDTH_PX = REPORT_NUM_COLUMN_MIN_WIDTH;

/** Max party rows shown in statement search results */
const PARTY_PICKER_PREVIEW = 15;
export const PARTY_PICKER_PREVIEW_LIMIT = PARTY_PICKER_PREVIEW;

/** GST detail report — fixed column widths (px) */
const GST_COL_DATE = 72;
const GST_COL_TYPE = 62;
const GST_COL_PARTY = 120;
const GST_COL_INVOICE = 72;
const GST_COL_NUM = 76;
const GST_COL_RATE = 44;

export const GST_DETAIL_COL_WIDTH_PX = {
	date: GST_COL_DATE,
	type: GST_COL_TYPE,
	party: GST_COL_PARTY,
	invoice: GST_COL_INVOICE,
	num: GST_COL_NUM,
	rate: GST_COL_RATE,
} as const;

/** GSTR-1 B2B table — flex weight for amount column vs invoice/GSTIN */
const GSTR1_AMT_FLEX = 1.5;
export const GSTR1_COL_AMT_FLEX = GSTR1_AMT_FLEX;

/** GSTR-3B — IGST/CGST/SGST column width */
const GSTR3B_NUM_CELL_W = 68;
export const GSTR3B_NUM_CELL_WIDTH_PX = GSTR3B_NUM_CELL_W;

/** Party statement — date and amount column widths */
const PARTY_STMT_DATE_W = 42;
const PARTY_STMT_AMT_W = 68;

export const PARTY_STMT_COL_WIDTH_PX = {
	date: PARTY_STMT_DATE_W,
	amount: PARTY_STMT_AMT_W,
} as const;
