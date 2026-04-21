import React from 'react';
import { Badge } from '@easydesign/design-system';
import type { BadgeVariant } from '@easydesign/design-system';
import { useLocale } from '@/src/hooks/useLocale';

export type InvoiceStatus = 'paid' | 'partial' | 'unpaid';

interface InvoiceStatusBadgeProps {
	status: InvoiceStatus;
	size?: 'sm' | 'md';
}

const STATUS_VARIANTS: Record<InvoiceStatus, BadgeVariant> = {
	paid: 'paid',
	partial: 'partial',
	unpaid: 'unpaid',
};

export function InvoiceStatusBadge({ status, size = 'sm' }: InvoiceStatusBadgeProps) {
	const { t } = useLocale();
	const variant = STATUS_VARIANTS[status];
	const label = t(`invoice.${status}`);

	return <Badge label={label} variant={variant} size={size} />;
}
