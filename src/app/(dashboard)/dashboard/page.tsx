'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api, ApiRequestError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Icons } from '@/components/ui/Icons';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Transaction } from '@/types';

const QUICK_ACTIONS = [
  { href: '/transfer', label: 'Send', sub: 'Instant transfer', icon: Icons.Send },
  { href: '/deposit', label: 'Deposit', sub: 'Add money', icon: Icons.ArrowDownLeft },
  { href: '/payout', label: 'Payout', sub: 'Withdraw funds', icon: Icons.ArrowUpRight },
] as const;

export default function DashboardPage() {
  const { user, account } = useAuth();
  const [recent, setRecent] = useState<Transaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getTransactions({ page: 1, page_size: 5 })
      .then((res) => setRecent(res.items))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : 'Could not load recent activity.'));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Balance card */}
      <Card className="p-6 bg-primary text-on-primary border-none">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-on-primary/70 uppercase tracking-wider">
            {user ? `${user.full_name}'s balance` : 'Your balance'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 text-on-primary/90">
            {account?.currency ?? '...'}
          </span>
        </div>
        <div className="mt-3 text-4xl font-extrabold font-mono tracking-tight">
          {account ? formatCurrency(account.balance, account.currency) : <Skeleton className="h-10 w-40 bg-white/20" />}
        </div>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant transition-colors text-center"
            >
              <div className="w-11 h-11 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-on-surface">{action.label}</span>
              <span className="text-[11px] text-on-surface-variant">{action.sub}</span>
            </Link>
          );
        })}
      </div>

      {/* Recent activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-on-surface">Recent activity</h2>
          <Link href="/transactions" className="text-sm text-primary hover:opacity-80 flex items-center gap-1">
            See all
            <Icons.ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        {!recent && !error && (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {recent && recent.length === 0 && (
          <Card className="p-8 text-center">
            <Icons.History className="w-8 h-8 text-on-surface-variant/50 mx-auto mb-3" />
            <p className="text-sm text-on-surface-variant">No transactions yet.</p>
          </Card>
        )}

        {recent && recent.length > 0 && (
          <Card className="overflow-hidden">
            {recent.map((tx, i) => {
              const isSend = tx.type === 'transfer_sent';
              const isReceived = tx.type === 'transfer_received';
              const counterparty = isSend ? tx.to_user_email : isReceived ? tx.from_user_email : tx.type;

              return (
                <Link
                  key={tx.id}
                  href={`/transactions/${tx.id}`}
                  className={`flex items-center justify-between p-4 hover:bg-surface-container transition-colors ${
                    i > 0 ? 'border-t border-outline-variant' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                      {isSend ? (
                        <Icons.ArrowUpRight className="w-4 h-4 text-on-surface-variant" />
                      ) : (
                        <Icons.ArrowDownLeft className="w-4 h-4 text-on-surface-variant" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">
                        {counterparty || tx.type.replace(/_/g, ' ')}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-on-surface-variant">{formatDate(tx.created_at)}</span>
                        <Badge status={tx.status} />
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold shrink-0 ${isSend ? 'text-on-surface' : 'text-secondary'}`}>
                    {isSend ? '-' : '+'}
                    {formatCurrency(tx.amount, tx.currency)}
                  </span>
                </Link>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
}
