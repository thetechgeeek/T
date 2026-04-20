import {
	buildInProgressLabel,
	ERROR_STATE_COPY,
	FEEDBACK_TONE_LABELS,
	formatOptionalCopy,
	PAGINATED_LIST_COPY,
} from '../microcopy';

describe('design-system microcopy helpers', () => {
	it('builds calm in-progress labels from verb-led actions', () => {
		expect(buildInProgressLabel('Save changes')).toBe('Saving changes...');
		expect(buildInProgressLabel('Retry sync')).toBe('Retrying sync...');
		expect(buildInProgressLabel('Delete record')).toBe('Deleting record...');
		expect(buildInProgressLabel('Saving')).toBe('Saving...');
		expect(buildInProgressLabel()).toBe('Working...');
	});

	it('normalizes optional values to the shared placeholder', () => {
		expect(formatOptionalCopy(undefined)).toBe('—');
		expect(formatOptionalCopy(null)).toBe('—');
		expect(formatOptionalCopy('')).toBe('—');
		expect(formatOptionalCopy('  Assigned  ')).toBe('Assigned');
		expect(formatOptionalCopy(0)).toBe('0');
	});

	it('keeps shared fallback copy calm and action-framed', () => {
		expect(ERROR_STATE_COPY.server.title).toContain('Unable');
		expect(ERROR_STATE_COPY.offline.description).toContain('Reconnect');
		expect(PAGINATED_LIST_COPY.retryLabel).toBe('Retry');
		expect(FEEDBACK_TONE_LABELS.warning).toBe('Warning');
	});
});
