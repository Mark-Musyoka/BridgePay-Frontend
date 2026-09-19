'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, ApiRequestError } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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

  return (
    <div className="flex flex-col gap-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
