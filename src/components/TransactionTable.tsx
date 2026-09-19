'use client';

import React from 'react';
import Link from 'next/link';
import { Transaction } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icons';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate, truncateHash } from '@/lib/utils';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function TransactionTable({ transactions, isLoading = false }: TransactionTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-outline-variant bg-surface-container-low shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-lowest text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
            <th className="py-3.5 px-4">Type / Counterparty</th>
            <th className="py-3.5 px-4">Transaction ID</th>
            <th className="py-3.5 px-4">Reference / Note</th>
            <th className="py-3.5 px-4">Date & Time</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">Amount</th>
            <th className="py-3.5 px-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant text-sm">
          {isLoading ? (
            <>
              <TableRowSkeleton cols={7} />
              <TableRowSkeleton cols={7} />
              <TableRowSkeleton cols={7} />
              <TableRowSkeleton cols={7} />
              <TableRowSkeleton cols={7} />
            </>
          ) : transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-3 text-on-surface-variant">
                  <Icons.Search className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-on-surface">No transactions match your search</p>
                <p className="text-xs text-on-surface-variant mt-1">Try clearing or adjusting your search filters</p>
              </td>
            </tr>
          ) : (
            transactions.map((tx) => {
              const isSend = tx.type === 'transfer_sent';
              const isTopup = tx.type === 'topup' || tx.type === 'deposit';

              return (
                <tr key={tx.id} className="hover:bg-surface-container transition-colors group">
                  {/* Type / Counterparty */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                          isSend
                            ? 'bg-error-container border-error/30 text-on-error-container'
                            : isTopup
                            ? 'bg-secondary-container border-secondary/30 text-on-secondary-container'
                            : 'bg-primary-fixed border-primary/30 text-on-primary-fixed'
                        }`}
                      >
                        {isSend ? (
                          <Icons.ArrowUpRight className="w-4 h-4" />
                        ) : isTopup ? (
                          <Icons.Plus className="w-4 h-4" />
                        ) : (
                          <Icons.ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface text-xs truncate max-w-[170px]">
                          {isSend
                            ? tx.to_user_email || 'Recipient'
                            : isTopup
                            ? 'Sandbox Deposit'
                            : tx.from_user_email || 'Sender'}
                        </p>
                        <p className="text-[11px] text-on-surface-variant">
                          {isSend ? 'Sent P2P' : isTopup ? 'Wallet Credit' : 'Received P2P'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Transaction ID */}
                  <td className="py-4 px-4 font-mono text-xs text-on-surface-variant">
                    <span title={tx.id}>{truncateHash(tx.id, 6, 4)}</span>
                  </td>

                  {/* Note */}
                  <td className="py-4 px-4 text-xs text-on-surface-variant max-w-[200px] truncate">
                    {tx.reference_note || <span className="italic opacity-70">None</span>}
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-xs text-on-surface-variant whitespace-nowrap">
                    {formatDate(tx.created_at)}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <Badge status={tx.status} />
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-4 text-right font-mono font-bold whitespace-nowrap">
                    <span className={isSend ? 'text-on-surface' : 'text-secondary'}>
                      {isSend ? '-' : '+'}
                      {formatCurrency(tx.amount, tx.currency)}
                    </span>
                  </td>

                  {/* Action Link */}
                  <td className="py-4 px-4 text-center">
                    <Link
                      href={`/transactions/${tx.id}`}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
                      title="View Receipt"
                    >
                      <Icons.ExternalLink className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
