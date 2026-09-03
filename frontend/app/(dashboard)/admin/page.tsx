'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import { Transaction } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatDate, truncateHash } from '@/lib/utils';

export default function AdminPage() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    const currentToken = token || 'mock_token';
    try {
      const res = await api.getAdminTransactions(currentToken, { page: 1, page_size: 50 });
      setTransactions(res.items || []);
    } catch (err: any) {
      console.warn('Admin fetch warning:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleToggleFlag = async (id: string, currentFlagged: boolean) => {
    setFlaggingId(id);
    const currentToken = token || 'mock_token';
    try {
      const updated = await api.flagTransaction(id, !currentFlagged, currentToken);
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_flagged: !currentFlagged, status: !currentFlagged ? 'flagged' : 'completed' } : t))
      );
      showToast(
        !currentFlagged ? 'Transaction flagged for fraud review' : 'Flag removed from transaction',
        !currentFlagged ? 'warning' : 'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setFlaggingId(null);
    }
  };

  const totalVolume = transactions.reduce((sum, t) => sum + parseFloat(String(t.amount || 0)), 0);
  const flaggedCount = transactions.filter((t) => t.is_flagged || t.status === 'flagged').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Admin Audit Console</h2>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold uppercase">
              Staff / Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time compliance monitoring, platform ledger auditing, and suspicious transaction flagging.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAdminData}
          isLoading={isLoading}
          leftIcon={<Icons.Refresh className="w-3.5 h-3.5" />}
        >
          Refresh Ledger
        </Button>
      </div>

      {/* Admin KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Audited Volume</span>
          <p className="text-2xl font-bold text-white font-mono mt-1">{formatCurrency(totalVolume, 'USD')}</p>
          <p className="text-[11px] text-slate-500 mt-1">Across all registered user accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Transactions</span>
          <p className="text-2xl font-bold text-white font-mono mt-1">{transactions.length} Records</p>
          <p className="text-[11px] text-slate-500 mt-1">Settled via FastAPI backend</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-rose-500/20">
          <span className="text-xs text-rose-400 uppercase font-semibold">Flagged / Suspicious</span>
          <p className="text-2xl font-bold text-rose-400 font-mono mt-1">{flaggedCount} Flagged</p>
          <p className="text-[11px] text-slate-500 mt-1">Requiring AML / compliance review</p>
        </div>
      </div>

      {/* Admin Transactions Table */}
      <Card glass className="border-slate-800 shadow-xl overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>Global Transaction Stream</CardTitle>
            <CardDescription>Click Flag to quarantine suspicious or high-risk transfers</CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Tx ID</th>
                <th className="py-3 px-4">Sender</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Compliance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 animate-pulse">
                    Loading global audit ledger...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No transactions recorded on the platform.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isFlagged = tx.is_flagged || tx.status === 'flagged';

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-850/40 transition-colors ${
                        isFlagged ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                        {truncateHash(tx.id, 6, 4)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-200">
                        {tx.from_user_email || truncateHash(tx.from_account_id, 6, 4)}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-white">
                        {tx.to_user_email || truncateHash(tx.to_account_id, 6, 4)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white text-xs">
                        {formatCurrency(tx.amount, tx.currency)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={tx.status} />
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          variant={isFlagged ? 'danger' : 'outline'}
                          size="sm"
                          isLoading={flaggingId === tx.id}
                          onClick={() => handleToggleFlag(tx.id, isFlagged)}
                          leftIcon={<Icons.Flag className="w-3.5 h-3.5" />}
                        >
                          {isFlagged ? 'Unflag' : 'Flag Risk'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
