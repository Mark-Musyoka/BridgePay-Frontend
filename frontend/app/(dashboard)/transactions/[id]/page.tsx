'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function TransactionDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { token } = useAuth();
  const { showToast } = useToast();

  const [tx, setTx] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchTx = async () => {
      setIsLoading(true);
      const currentToken = token || 'mock_token';
      try {
        const data = await api.getTransactionById(id, currentToken);
        setTx(data);
      } catch (err: any) {
        showToast('Transaction not found', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTx();
  }, [id, token, showToast]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-on-surface-variant">
        Loading receipt...
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-bold text-on-surface">Receipt not found</p>
        <Link href="/transactions" className="text-xs font-bold text-primary underline">
          Return to Activity
        </Link>
      </div>
    );
  }

  const isReceived = tx.type === 'transfer_received' || tx.type === 'topup';

  return (
    <div className="max-w-md mx-auto space-y-5 pt-2">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/transactions"
          className="text-xs font-bold text-primary hover:text-primary-container flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Activity</span>
        </Link>
        <button
          onClick={handlePrint}
          className="text-xs font-bold text-on-surface-variant hover:text-on-surface flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">print</span>
          <span>Print</span>
        </button>
      </div>

      {/* Main Receipt Card */}
      <div className="rounded-3xl bg-surface-container-lowest p-6 sm:p-7 shadow-sm border border-surface-container space-y-5 text-center">
        <div
          className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${
            isReceived ? 'bg-secondary-container/50 text-secondary' : 'bg-surface-container text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[28px]">
            {isReceived ? 'arrow_downward_alt' : 'arrow_upward_alt'}
          </span>
        </div>

        <div>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            {isReceived ? 'Payment Received' : 'Payment Sent'}
          </span>
          <h2
            className={`text-3xl font-extrabold font-mono mt-1 ${
              isReceived ? 'text-secondary' : 'text-on-surface'
            }`}
          >
            {isReceived ? '+' : '-'}
            {formatCurrency(tx.amount, tx.currency)}
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">{formatDate(tx.created_at)}</p>
        </div>

        <div className="divide-y divide-surface-container text-xs text-left pt-2">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-on-surface-variant">Transaction ID</span>
            <span className="font-mono text-on-surface">{tx.id}</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-on-surface-variant">Sender</span>
            <span className="font-semibold text-on-surface">
              {tx.from_user_email || 'zawadi@bridgepay.dev'}
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-on-surface-variant">Recipient</span>
            <span className="font-semibold text-on-surface">{tx.to_user_email || 'Recipient'}</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-on-surface-variant">Reference / Memo</span>
            <span className="text-on-surface">{tx.reference_note || 'None'}</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-on-surface-variant">Channel</span>
            <span className="text-primary font-bold">PesaLink / BridgePay</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-on-surface-variant">Status</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-fixed-variant font-bold text-[10px] uppercase">
              Completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
