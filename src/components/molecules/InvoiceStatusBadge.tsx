import React from 'react';
import { Badge } from '@/src/components/atoms/Badge';
import type { BadgeVariant } from '@/src/components/atoms/Badge';

export type InvoiceStatus = 'paid' | 'partial' | 'unpaid';

interface InvoiceStatusBadgeProps {
	status: InvoiceStatus;
	size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<InvoiceStatus, { variant: BadgeVariant; label: string }> = {
	paid: { variant: 'paid', label: 'Paid' },
	partial: { variant: 'partial', label: 'Partial' },
	unpaid: { variant: 'unpaid', label: 'Unpaid' },
};

export function InvoiceStatusBadge({ status, size = 'sm' }: InvoiceStatusBadgeProps) {
	const { variant, label } = STATUS_CONFIG[status];
	return <Badge label={label} variant={variant} size={size} />;
}
