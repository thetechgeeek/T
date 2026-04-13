/**
 * Shared UI dimension and opacity constants.
 * Use these instead of bare numbers in StyleSheet.create and inline styles.
 *
 * Naming conventions:
 *   SIZE_*       — pixel dimensions (width/height/border-radius)
 *   OPACITY_*    — alpha/opacity fractions (0–1)
 *   FLEX_*       — flex weight values
 *   LETTER_*     — letter-spacing values
 *   MS_*         — duration / interval in milliseconds
 */

// ─── Sizes ────────────────────────────────────────────────────────────────────

/** Standard avatar / list-item icon diameter */
export const SIZE_AVATAR_MD = 60;

/** Standard touch-input / button height (slightly above the 48 minimum) */
export const SIZE_INPUT_HEIGHT = 52;

/** Square icon-container (e.g. quick-action grid cells) */
export const SIZE_ICON_CONTAINER = 34;

/** Small tile image in TileSetCard */
export const SIZE_TILE_IMAGE = 112;

/** Import / large modal row height */
export const SIZE_IMPORT_ROW = 350;

/** Empty-state illustration diameter */
export const SIZE_EMPTY_STATE_ICON = 150;

/** Close-FY confirmation modal height */
export const SIZE_CLOSE_FY_MODAL = 700;

/** Language-picker flag/logo size */
export const SIZE_LANGUAGE_FLAG = 120;

/** iOS tab-bar total height (safe-area included) */
export const SIZE_TAB_BAR_IOS = 88;

/** Maximum value shown on sync badge before "99+" overflow */
export const SYNC_BADGE_MAX = 99;

/** Badge offset so it peeks outside its parent icon */
export const SIZE_BADGE_OFFSET = -4;

/** Offline banner slide-in from bottom (negative = above screen) */
export const SIZE_OFFLINE_BANNER_OFFSET = -44;

// ─── Opacities ────────────────────────────────────────────────────────────────

/** Lightly tinted card / icon background (e.g. category chip) */
export const OPACITY_TINT_LIGHT = 0.12;

/** Medium tint for section backgrounds */
export const OPACITY_TINT_MEDIUM = 0.2;

/** Stronger surface tint */
export const OPACITY_TINT_STRONG = 0.3;

/** Dark surface wash (e.g. profit/loss background) */
export const OPACITY_SURFACE_DARK = 0.6;

/** Inactive / disabled control */
export const OPACITY_INACTIVE = 0.8;

/** Pressed opacity for touchable cards (slightly less than 1) */
export const OPACITY_PRESSED = 0.85;

/** Subtle hover / focus ring */
export const OPACITY_HOVER = 0.9;

/** Skeleton shimmer base opacity */
export const OPACITY_SKELETON_BASE = 0.08;

/** Skeleton shimmer peak opacity */
export const OPACITY_SKELETON_PEAK = 0.5;

/** Toast translation limit */
export const OPACITY_TOAST = 0.15;

/** Glow effect (scan-button shadow) */
export const OPACITY_GLOW = 0.4;

/** Business-profile logo placeholder */
export const OPACITY_LOGO_PLACEHOLDER = 0.7;

/** Day-book row divider opacity */
export const OPACITY_ROW_DIVIDER = 0.1;

// ─── Flex weights (when 1 is taken) ──────────────────────────────────────────

/** Wider amount column in tables */
export const FLEX_AMT_WIDE = 1.5;

// ─── Letter spacing ───────────────────────────────────────────────────────────

/** Monospace account-number spacing */
export const LETTER_SPACING_ACCOUNT = 1.5;

/** Section-label all-caps tracking (used in card/list headers) */
export const LETTER_SPACING_SECTION = 0.8;

// ─── Durations (ms) ──────────────────────────────────────────────────────────

/** Sync-indicator polling interval */
export const MS_SYNC_POLL = 1500;

/** ScreenHeader relative-time refresh (1 minute) */
export const MS_HEADER_SYNC_REFRESH = 60_000;

/** Network-reachability timeout */
export const MS_NETWORK_TIMEOUT = 5_000;

// ─── HTTP status codes ────────────────────────────────────────────────────────

/** 204 No Content — returned by connectivity probe URL */
export const HTTP_NO_CONTENT = 204;

// ─── Limits ───────────────────────────────────────────────────────────────────

/** Default page-size for search auto-complete queries */
export const DB_SEARCH_LIMIT = 50;

/** Maximum characters for free-text fields (notes, terms) */
export const MAX_LONG_TEXT_CHARS = 2000;

/** Max mount to display a scan-result QR code */
export const MAX_PAYMENT_QRCODE_AMOUNT = 1_000_000;
