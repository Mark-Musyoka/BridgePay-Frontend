'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, ApiRequestError } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Icons } from '@/components/ui/Icons';
import { formatCurrency, formatDate, truncateHash } from '@/lib/utils';
import type { Transaction } from '@/types';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-outline-variant last:border-0">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <span className="text-sm font-medium text-on-surface">{value}</span>
    </div>
  );
}

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getTransactionById(params.id)
      .then(setTransaction)
      .catch((err) =>
        setError(err instanceof ApiRequestError ? err.message : 'Could not load this transaction.'),
      );
  }, [params.id]);

  if (error) {
    return (
      <Card className="p-8 text-center">
        <Icons.AlertCircle className="w-8 h-8 text-error mx-auto mb-3" />
        <p className="text-sm text-on-surface-variant">{error}</p>
        <Link href="/transactions" className="text-sm text-primary hover:opacity-80 mt-3 inline-block">
          Back to transactions
        </Link>
      </Card>
    );
  }

  if (!transaction) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isCompleted = transaction.status.toLowerCase() === 'completed';

  return (
    <div className="flex flex-col gap-4">
      {/* ─── On-screen content (hidden when printing) ─── */}
      <div className="print-hide flex flex-col gap-4">
        <Link href="/transactions" className="text-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1 w-fit">
          <Icons.ChevronRight className="w-4 h-4 rotate-180" />
          Back to transactions
        </Link>

        <Card glass className="p-6 flex flex-col items-center text-center gap-2">
          <Badge status={transaction.status} />
          <p className="text-3xl font-bold text-on-surface mt-2">
            {formatCurrency(transaction.amount, transaction.currency)}
          </p>
          <p className="text-sm text-on-surface-variant capitalize">{transaction.type.replace(/_/g, ' ')}</p>
        </Card>

        <Card>
          <CardContent className="py-2">
            <Row label="Transaction ID" value={truncateHash(transaction.id, 8, 6)} />
            <Row label="Date" value={formatDate(transaction.created_at)} />
            <Row label="Amount" value={formatCurrency(transaction.amount, transaction.currency)} />
            <Row label="Currency" value={transaction.currency} />
            <Row label="Status" value={<Badge status={transaction.status} />} />
            {transaction.reference_note && <Row label="Note" value={transaction.reference_note} />}
            {transaction.from_user_email && <Row label="From" value={transaction.from_user_email} />}
            {transaction.to_user_email && <Row label="To" value={transaction.to_user_email} />}
          </CardContent>
        </Card>

        {isCompleted && (
          <Button
            variant="outline"
            onClick={() => window.print()}
            leftIcon={<Icons.Download className="w-4 h-4" />}
          >
            Download receipt
          </Button>
        )}
      </div>

      {/* ─── Print-only receipt (hidden on screen) ─── */}
      <div className="print-only" style={{ color: '#000', background: '#fff', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif", padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>BridgePay</h1>
          <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>Receipt</p>
        </div>

        {/* Amount */}
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <p style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>
            {formatCurrency(transaction.amount, transaction.currency)}
          </p>
          <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0', textTransform: 'capitalize' }}>
            {transaction.type.replace(/_/g, ' ')}
          </p>
        </div>

        {/* Details table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '10px 0', color: '#666' }}>Transaction ID</td>
              <td style={{ padding: '10px 0', textAlign: 'right', fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}>{transaction.id}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '10px 0', color: '#666' }}>Date</td>
              <td style={{ padding: '10px 0', textAlign: 'right' }}>{formatDate(transaction.created_at)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '10px 0', color: '#666' }}>Amount</td>
              <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(transaction.amount, transaction.currency)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '10px 0', color: '#666' }}>Currency</td>
              <td style={{ padding: '10px 0', textAlign: 'right' }}>{transaction.currency}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '10px 0', color: '#666' }}>Status</td>
              <td style={{ padding: '10px 0', textAlign: 'right', textTransform: 'capitalize' }}>{transaction.status}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '10px 0', color: '#666' }}>Type</td>
              <td style={{ padding: '10px 0', textAlign: 'right', textTransform: 'capitalize' }}>{transaction.type.replace(/_/g, ' ')}</td>
            </tr>
            {transaction.reference_note && (
              <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                <td style={{ padding: '10px 0', color: '#666' }}>Reference / Note</td>
                <td style={{ padding: '10px 0', textAlign: 'right' }}>{transaction.reference_note}</td>
              </tr>
            )}
            {transaction.from_user_email && (
              <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                <td style={{ padding: '10px 0', color: '#666' }}>From</td>
                <td style={{ padding: '10px 0', textAlign: 'right' }}>{transaction.from_user_email}</td>
              </tr>
            )}
            {transaction.to_user_email && (
              <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                <td style={{ padding: '10px 0', color: '#666' }}>To</td>
                <td style={{ padding: '10px 0', textAlign: 'right' }}>{transaction.to_user_email}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <p style={{ fontSize: '11px', color: '#999', textAlign: 'center', marginTop: '40px', borderTop: '1px solid #e5e5e5', paddingTop: '16px' }}>
          This is an automatically generated receipt.
        </p>
      </div>
    </div>
  );
}
