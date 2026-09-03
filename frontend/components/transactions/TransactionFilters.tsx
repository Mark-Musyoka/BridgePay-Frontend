'use client';

import React from 'react';
import { Icons } from '@/components/ui/Icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface TransactionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function TransactionFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  type,
  onTypeChange,
  onRefresh,
  isLoading = false,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <Input
          placeholder="Search by email, note, or transaction ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Icons.Search className="w-4 h-4 text-slate-400" />}
          className="bg-slate-950/60"
        />
      </div>

      {/* Select Filters & Refresh */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-slate-950/60 border border-slate-700/70 text-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="flagged">Flagged</option>
        </select>

        {/* Type Filter */}
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="bg-slate-950/60 border border-slate-700/70 text-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Types</option>
          <option value="transfer_sent">Sent Transfers</option>
          <option value="transfer_received">Received</option>
          <option value="topup">Top Up / Deposits</option>
        </select>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          isLoading={isLoading}
          leftIcon={<Icons.Refresh className="w-3.5 h-3.5" />}
          title="Reload transactions"
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}
