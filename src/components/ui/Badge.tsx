import React from 'react';
import { cn } from '@/lib/utils';
import { TransactionStatus, TransactionType } from '@/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: TransactionStatus | string;
  type?: TransactionType | string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  dot?: boolean;
}

export function Badge({
  className,
  status,
  type,
  variant,
  dot = true,
  children,
  ...props
}: BadgeProps) {
  let resolvedVariant = variant || 'neutral';
  let label = children;

  if (status) {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
      case 'active':
        resolvedVariant = 'success';
        label = label || 'Completed';
        break;
      case 'pending':
      case 'processing':
        resolvedVariant = 'warning';
        label = label || 'Pending';
        break;
      case 'failed':
      case 'cancelled':
      case 'rejected':
        resolvedVariant = 'error';
        label = label || 'Failed';
        break;
      case 'flagged':
      case 'suspicious':
        resolvedVariant = 'error';
        label = label || 'Flagged';
        break;
      default:
        resolvedVariant = 'neutral';
        label = label || status;
    }
  } else if (type) {
    switch (type.toLowerCase()) {
      case 'topup':
      case 'deposit':
      case 'transfer_received':
        resolvedVariant = 'success';
        label = label || (type === 'transfer_received' ? 'Received' : 'Top Up');
        break;
      case 'transfer_sent':
      case 'withdrawal':
        resolvedVariant = 'info';
        label = label || (type === 'transfer_sent' ? 'Sent' : 'Withdrawal');
        break;
      default:
        resolvedVariant = 'neutral';
        label = label || type;
    }
  }

  // Each pairing below is a Material 3 "container"/"on-container" pair
  // from globals.css, chosen specifically for sufficient contrast on a
  // light surface — not an arbitrary color choice.
  const variants = {
    success: 'bg-secondary-container text-on-secondary-container border-transparent',
    warning: 'bg-tertiary-fixed text-on-tertiary-fixed border-transparent',
    error: 'bg-error-container text-on-error-container border-transparent',
    info: 'bg-primary-fixed text-on-primary-fixed border-transparent',
    neutral: 'bg-surface-container-high text-on-surface-variant border-transparent',
  };

  const dotColors = {
    success: 'bg-secondary',
    warning: 'bg-on-tertiary-container animate-pulse',
    error: 'bg-error',
    info: 'bg-primary',
    neutral: 'bg-outline',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-xs transition-colors',
        variants[resolvedVariant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[resolvedVariant])} />}
      {label}
    </span>
  );
}
