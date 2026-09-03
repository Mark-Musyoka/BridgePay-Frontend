'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import { Transaction } from '@/types';
import { formatCurrency, formatRelativeDate, formatDate } from '@/lib/utils';

export default function TransactionsPage() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    const currentToken = token || 'mock_token';

    try {
      const res = await api.getTransactions(currentToken, {
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        type: filterType !== 'all' ? filterType : undefined,
      });

      setTransactions(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || Math.ceil((res.total || 0) / pageSize) || 1);
    } catch (err: any) {
      console.warn('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, page, pageSize, search, filterType]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showToast('No transactions to export', 'warning');
      return;
    }

    const headers = ['ID', 'Type', 'Amount', 'Currency', 'Status', 'Date', 'Note'];
    const rows = transactions.map((t) => [
      t.id,
      t.type,
      t.amount,
      t.currency,
      t.status,
      t.created_at,
      `"${(t.reference_note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bridgepay_statement_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Transaction statement downloaded', 'success');
  };

  return (
    <div className="flex flex-col space-y-5 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Activity Ledger</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Full transaction history and payment receipts
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-3.5 py-1.5 rounded-full bg-surface-container text-primary font-bold text-xs hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span>Statement</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs">
        <div className="relative flex-1 flex items-center">
          <span className="absolute left-3.5 material-symbols-outlined text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder="Search activity, notes, recipients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low border border-surface-container rounded-xl pl-10 pr-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'transfer_received', 'transfer_sent', 'topup'].map((t) => (
            <button
              key={t}
              onClick={() => {
                setFilterType(t);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === t
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t === 'all'
                ? 'All'
                : t === 'transfer_received'
                ? 'Received'
                : t === 'transfer_sent'
                ? 'Sent'
                : 'Top Up'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex flex-col space-y-2">
        {isLoading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-surface-container-low rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-3xl bg-surface-container-lowest border border-surface-container">
            <span className="material-symbols-outlined text-[36px] text-on-surface-variant mb-2">
              receipt_long
            </span>
            <p className="text-sm font-bold text-on-surface">No transactions found</p>
            <p className="text-xs text-on-surface-variant mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          transactions.map((tx) => {
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
                        {formatDate(tx.created_at)}
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
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest border border-surface-container text-xs">
        <span className="text-on-surface-variant">
          Page <strong className="text-on-surface">{page}</strong> of{' '}
          <strong className="text-on-surface">{totalPages}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="px-3 py-1.5 rounded-xl bg-surface-container text-on-surface disabled:opacity-40 font-bold"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="px-3 py-1.5 rounded-xl bg-surface-container text-on-surface disabled:opacity-40 font-bold"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
