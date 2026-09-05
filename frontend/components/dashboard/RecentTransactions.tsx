'use client';

import React from 'react';
import Link from 'next/link';
import { Transaction } from '@/types';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function RecentTransactions({ transactions, isLoading = false }: RecentTransactionsProps) {
  // Default sample items matching Stitch screen if list is empty
  const defaultItems = [
    {
      id: 'tx_wanjiku_01',
      name: 'Wanjiku Kamau',
      time: 'Today, 2:45 PM',
      tag: 'M-Pesa',
      amount: 4500,
      isCredit: true,
      statusLabel: 'Received',
      icon: 'arrow_downward_alt',
      iconBg: 'bg-secondary-container/50 text-secondary',
    },
    {
      id: 'tx_java_02',
      name: 'Java House Nairobi',
      time: 'Yesterday, 10:15 AM',
      tag: 'Till 342110',
      amount: 1250,
      isCredit: false,
      statusLabel: 'Lipa na Till',
      icon: 'local_cafe',
      iconBg: 'bg-surface-container text-primary',
    },
    {
      id: 'tx_brian_03',
      name: 'Brian Otieno',
      time: '22 Oct',
      tag: 'Rent contribution',
      amount: 15000,
      isCredit: false,
      statusLabel: 'Sent',
      icon: 'arrow_upward_alt',
      iconBg: 'bg-surface-container text-on-surface-variant',
    },
    {
      id: 'tx_amina_04',
      name: 'Amina Mohamed',
      time: '20 Oct',
      tag: 'Split lunch bill',
      amount: 850,
      isCredit: true,
      statusLabel: 'Received',
      icon: 'arrow_downward_alt',
      iconBg: 'bg-secondary-container/50 text-secondary',
    },
  ];

  return (
    <div className="flex flex-col space-y-3 pt-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-on-surface">Recent Transactions</h2>
        <Link
          href="/transactions"
          className="text-xs font-bold text-primary hover:text-primary-container transition-colors"
        >
          See All
        </Link>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col space-y-2">
        {isLoading ? (
          <div className="space-y-2 py-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-surface-container-low rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : transactions && transactions.length > 0 ? (
          transactions.slice(0, 4).map((tx) => {
            const isReceived = tx.type === 'transfer_received' || tx.type === 'topup';
            const isTill = tx.reference_note?.toLowerCase().includes('till');

            return (
              <Link
                key={tx.id}
                href={`/transactions/${tx.id}`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-lowest shadow-xs hover:shadow-md transition-all active:scale-[0.99] border border-surface-container/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                      isReceived
                        ? 'bg-secondary-container/50 text-secondary'
                        : isTill
                        ? 'bg-surface-container text-primary'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {isReceived
                        ? 'arrow_downward_alt'
                        : isTill
                        ? 'storefront'
                        : 'arrow_upward_alt'}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-on-surface truncate">
                      {isReceived
                        ? tx.from_user_email?.split('@')[0] || 'Sender'
                        : tx.to_user_email?.split('@')[0] || 'Recipient'}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-on-surface-variant">
                        {formatRelativeDate(tx.created_at)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant" />
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium truncate max-w-[120px]">
                        {tx.reference_note || (isReceived ? 'P2P Transfer' : 'Payment')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span
                    className={`text-sm font-extrabold tabular-nums ${
                      isReceived ? 'text-secondary' : 'text-on-surface'
                    }`}
                  >
                    {isReceived ? '+' : '-'}
                    {formatCurrency(tx.amount, tx.currency)}
                  </span>
                  <span
                    className={`text-[10px] font-medium ${
                      isReceived ? 'text-secondary' : 'text-on-surface-variant'
                    }`}
                  >
                    {isReceived ? 'Received' : 'Sent'}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          defaultItems.map((item) => (
            <Link
              key={item.id}
              href="/transactions"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-container-lowest shadow-xs hover:shadow-md transition-all active:scale-[0.99] border border-surface-container/60"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-11 h-11 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}
                >
                  <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-on-surface truncate">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-on-surface-variant">{item.time}</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant" />
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                      {item.tag}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 pl-2">
                <span
                  className={`text-sm font-extrabold tabular-nums ${
                    item.isCredit ? 'text-secondary' : 'text-on-surface'
                  }`}
                >
                  {item.isCredit ? '+' : '-'}KES {item.amount.toLocaleString()}.00
                </span>
                <span
                  className={`text-[10px] font-medium ${
                    item.isCredit ? 'text-secondary' : 'text-on-surface-variant'
                  }`}
                >
                  {item.statusLabel}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
