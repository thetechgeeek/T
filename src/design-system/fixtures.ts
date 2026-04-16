export const DESIGN_SYSTEM_RELAXED_FIXTURE = {
	metricValue: '94%',
	metricContext: 'across flagship mobile flows',
	filters: ['Showcase', 'Branded', 'Localized'],
} as const;

export const DESIGN_SYSTEM_OPERATIONAL_FIXTURE = {
	metricValue: '17',
	metricContext: '3 are permission blocked',
	filters: ['Operational', 'Blocked', 'No media'],
} as const;

export const DESIGN_SYSTEM_READ_ONLY_FIELDS = [
	{ label: 'Policy owner', value: 'Operations Council', meta: 'Read only' },
	{ label: 'Surface bias', value: 'Neutral enterprise default', meta: 'Inherited from preset' },
	{ label: 'Accent budget', value: '1 hot accent', meta: 'Primary CTA only' },
] as const;

export const DESIGN_SYSTEM_STATE_FIXTURES = {
	noMedia: {
		title: 'Northwest Regional Logistics Cooperative',
		monogram: 'NR',
		meta: 'Logo unavailable',
	},
	uglyData: {
		title: 'International Spare Parts Consortium for Heavy Mobility and Municipal Recovery',
		detail: 'Missing tax id, null owner, 0-day terms',
		metricValue: '₹ 12,58,40,991.42',
		metricContext: 'Stale by 4 days',
	},
} as const;
