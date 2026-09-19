'use client';

import React, { useEffect, useState } from 'react';
import { api, ApiRequestError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { Icons } from '@/components/ui/Icons';
import { formatCurrency, formatDate, truncateHash } from '@/lib/utils';
import type { PaginatedTransactions } from '@/types';

interface AuditLogItem {
  id: string;
  user_id: string | null;
  action: string;
  detail: string | null;
  ip_address: string | null;
  created_at: string;
}

function Forbidden() {
  return (
    <Card className="p-10 text-center">
      <Icons.Shield className="w-8 h-8 text-on-surface-variant/50 mx-auto mb-3" />
      <h1 className="text-base font-semibold text-on-surface">Admin access only</h1>
      <p className="text-sm text-on-surface-variant mt-1">Your account doesn&apos;t have access to this page.</p>
    </Card>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<'transactions' | 'audit'>('transactions');
  const [forbidden, setForbidden] = useState(false);

  const [transactions, setTransactions] = useState<PaginatedTransactions | null>(null);
  const [emailFilter, setEmailFilter] = useState('');

  const [auditLogs, setAuditLogs] = useState<{ items: AuditLogItem[] } | null>(null);
  const [actionFilter, setActionFilter] = useState('');

  const loadTransactions = (email?: string) => {
    api
      .getAdminTransactions({ page: 1, page_size: 50, user_email: email || undefined })
      .then(setTransactions)
      .catch((err) => {
        if (err instanceof ApiRequestError && err.status === 403) setForbidden(true);
      });
  };

  const loadAuditLogs = (action?: string) => {
    api
      .getAuditLogs({ page: 1, page_size: 50, action: action || undefined })
      .then(setAuditLogs)
      .catch((err) => {
        if (err instanceof ApiRequestError && err.status === 403) setForbidden(true);
      });
  };

  useEffect(() => {
    loadTransactions();
    loadAuditLogs();
    // Only ever needs to run once on mount — filtered reloads happen via
    // the two form submit handlers below, not this effect.
  }, []);

  if (forbidden) return <Forbidden />;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-on-surface">Admin</h1>

      <div className="flex gap-1 border-b border-outline-variant">
        {(['transactions', 'audit'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t === 'transactions' ? 'Transactions' : 'Audit Log'}
          </button>
        ))}
      </div>

      {tab === 'transactions' && (
        <div className="flex flex-col gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadTransactions(emailFilter);
            }}
            className="flex gap-2 max-w-sm"
          >
            <Input
              placeholder="Filter by user email"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              leftIcon={<Icons.Mail className="w-4 h-4" />}
            />
          </form>

          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-left text-xs text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {!transactions && Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)}
                {transactions?.items.map((t) => (
                  <tr key={t.id} className="border-b border-outline-variant last:border-0">
                    <td className="py-3 px-4 text-on-surface-variant">{truncateHash(t.id, 6, 4)}</td>
                    <td className="py-3 px-4 capitalize text-on-surface">{t.type.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-on-surface">{formatCurrency(t.amount, t.currency)}</td>
                    <td className="py-3 px-4">
                      <Badge status={t.status} />
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">{formatDate(t.created_at)}</td>
                  </tr>
                ))}
                {transactions && transactions.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === 'audit' && (
        <div className="flex flex-col gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadAuditLogs(actionFilter);
            }}
            className="flex gap-2 max-w-sm"
          >
            <Input
              placeholder="Filter by action, e.g. login_failed"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              leftIcon={<Icons.Shield className="w-4 h-4" />}
            />
          </form>

          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-left text-xs text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Detail</th>
                  <th className="py-3 px-4">IP</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {!auditLogs && Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)}
                {auditLogs?.items.map((log) => (
                  <tr key={log.id} className="border-b border-outline-variant last:border-0">
                    <td className="py-3 px-4 text-on-surface capitalize">{log.action.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{log.detail ?? '—'}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{log.ip_address ?? '—'}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{formatDate(log.created_at)}</td>
                  </tr>
                ))}
                {auditLogs && auditLogs.items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-on-surface-variant">
                      No audit log entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}
