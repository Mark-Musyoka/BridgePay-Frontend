'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { api, ApiRequestError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TransactionFilters } from '@/components/TransactionFilters';
import { TransactionTable } from '@/components/TransactionTable';
import type { Transaction } from '@/types';

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  // isLoading covers only the very first mount (starts true, the effect
  // below turns it off once). A manual refresh uses isRefreshing instead,
  // set from the button's own click handler — never synchronously inside
  // the effect itself, which the project's lint rules disallow.
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');

  useEffect(() => {
    let cancelled = false;

    api
      .getTransactions({ page: 1, page_size: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
        setPage(1);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiRequestError ? err.message : 'Could not load transactions.');
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
        setIsRefreshing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const loadFirstPage = () => {
    setIsRefreshing(true);
    setReloadToken((t) => t + 1);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    api
      .getTransactions({ page: nextPage, page_size: PAGE_SIZE })
      .then((res) => {
        setItems((prev) => [...prev, ...res.items]);
        setTotal(res.total);
        setPage(nextPage);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : 'Could not load more transactions.'))
      .finally(() => setIsLoadingMore(false));
  };

  // The backend's GET /transactions has no search/status/type query
  // params (see api.ts) — so search and filtering happen client-side,
  // over whatever pages have been loaded so far. "Load more" fetches
  // further pages from the server; filters narrow what's on screen.
  const filtered = useMemo(() => {
    return items.filter((tx) => {
      if (status !== 'all' && tx.status !== status) return false;
      if (type !== 'all') {
        const isTopupType = tx.type === 'topup' || tx.type === 'deposit';
        if (type === 'topup' ? !isTopupType : tx.type !== type) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = [tx.id, tx.reference_note, tx.to_user_email, tx.from_user_email]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [items, search, status, type]);

  const hasMore = items.length < total;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-on-surface">Activity</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          Every transfer, deposit, and payout on your account.
        </p>
      </div>

      <TransactionFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        type={type}
        onTypeChange={setType}
        onRefresh={loadFirstPage}
        isLoading={isLoading || isRefreshing}
      />

      {error ? (
        <Card className="p-8 text-center">
          <p className="text-sm font-medium text-on-surface">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={loadFirstPage}>
            Try again
          </Button>
        </Card>
      ) : (
        <>
          <TransactionTable transactions={filtered} isLoading={isLoading || isRefreshing} />

          {!isLoading && !isRefreshing && hasMore && (
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={loadMore} isLoading={isLoadingMore}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
