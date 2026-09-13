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

  const variants = {
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-500/30',
    error: 'bg-rose-950/80 text-rose-300 border-rose-500/30',
    info: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30',
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
  };

  const dotColors = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400 animate-pulse',
    error: 'bg-rose-400',
    info: 'bg-indigo-400',
    neutral: 'bg-slate-400',
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
