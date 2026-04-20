import type { ErrorStateVariant } from '@/src/design-system/components/molecules/ErrorState';
import type { AlertBannerVariant } from '@/src/design-system/components/molecules/AlertBanner';
import type { ToastVariant } from '@/src/design-system/components/molecules/Toast';

export const MISSING_VALUE_PLACEHOLDER = '—';
export const DEFAULT_ACTION_LABEL = 'Action';
export const DEFAULT_RETRY_LABEL = 'Retry';
export const DEFAULT_DISMISS_LABEL = 'Dismiss';
const IE_SUFFIX_LENGTH = 2;

const IRREGULAR_PROGRESS_VERBS: Readonly<Record<string, string>> = {
	add: 'Adding',
	archive: 'Archiving',
	assign: 'Assigning',
	cancel: 'Cancelling',
	close: 'Closing',
	create: 'Creating',
	delete: 'Deleting',
	dismiss: 'Dismissing',
	export: 'Exporting',
	filter: 'Filtering',
	hide: 'Hiding',
	load: 'Loading',
	open: 'Opening',
	publish: 'Publishing',
	refresh: 'Refreshing',
	remove: 'Removing',
	request: 'Requesting',
	resolve: 'Resolving',
	retry: 'Retrying',
	save: 'Saving',
	search: 'Searching',
	send: 'Sending',
	share: 'Sharing',
	show: 'Showing',
	sign: 'Signing',
	submit: 'Submitting',
	sync: 'Syncing',
	update: 'Updating',
	upload: 'Uploading',
	view: 'Viewing',
};

export const FEEDBACK_TONE_LABELS: Readonly<Record<AlertBannerVariant | ToastVariant, string>> = {
	info: 'Info',
	success: 'Success',
	warning: 'Warning',
	error: 'Error',
};

export const ERROR_STATE_COPY: Readonly<
	Record<ErrorStateVariant, { title: string; description: string }>
> = {
	server: {
		title: 'Unable to load this section',
		description: 'Try again. If the problem keeps happening, contact support.',
	},
	'not-found': {
		title: 'Record not found',
		description: 'This item is no longer available here. Go back or refresh the list.',
	},
	offline: {
		title: 'You are offline',
		description: 'Reconnect and retry when you are ready.',
	},
};

export const PAGINATED_LIST_COPY = {
	emptyTitle: 'No records yet',
	errorTitle: ERROR_STATE_COPY.server.title,
	errorDescription: ERROR_STATE_COPY.server.description,
	retryLabel: DEFAULT_RETRY_LABEL,
} as const;

function toProgressVerb(firstWord: string) {
	const normalized = firstWord.trim().toLowerCase();
	if (!normalized) {
		return 'Working';
	}

	const irregular = IRREGULAR_PROGRESS_VERBS[normalized];
	if (irregular) {
		return irregular;
	}

	if (normalized.endsWith('ing')) {
		return firstWord;
	}

	if (normalized.endsWith('ie')) {
		return `${firstWord.slice(0, -IE_SUFFIX_LENGTH)}ying`;
	}

	if (
		normalized.endsWith('e') &&
		!normalized.endsWith('ee') &&
		!normalized.endsWith('ye') &&
		!normalized.endsWith('oe')
	) {
		return `${firstWord.slice(0, -1)}ing`;
	}

	return `${firstWord}ing`;
}

export function buildInProgressLabel(label?: string) {
	const trimmed = label?.trim();
	if (!trimmed) {
		return 'Working...';
	}

	const [firstWord, ...rest] = trimmed.split(/\s+/);
	const progressVerb = toProgressVerb(firstWord);

	return `${progressVerb}${rest.length > 0 ? ` ${rest.join(' ')}` : ''}...`;
}

export function formatOptionalCopy(
	value: string | number | null | undefined,
	placeholder = MISSING_VALUE_PLACEHOLDER,
) {
	if (value == null) {
		return placeholder;
	}

	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed || placeholder;
	}

	return String(value);
}
