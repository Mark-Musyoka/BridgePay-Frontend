'use client';

import React from 'react';
import { Icons } from '@/components/ui/Icons';
import { formatCurrency } from '@/lib/utils';
import { DashboardStats } from '@/types';

interface StatCardsProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

export function StatCards({ stats, isLoading = false }: StatCardsProps) {
  const items = [
    {
      title: 'Total Received (Inflow)',
      amount: stats?.total_received ?? 2180,
      currency: stats?.currency ?? 'USD',
      change: '+14.2% vs last month',
      icon: Icons.ArrowDownLeft,
      iconColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
      textColor: 'text-emerald-400',
    },
    {
      title: 'Total Sent (Outflow)',
      amount: stats?.total_sent ?? 370,
      currency: stats?.currency ?? 'USD',
      change: '4 transfers settled',
      icon: Icons.ArrowUpRight,
      iconColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-500/30',
      textColor: 'text-indigo-400',
    },
    {
      title: 'Network Activity',
      amount: stats?.transaction_count ?? 5,
      isCount: true,
      currency: '',
      change: '100% On-Time Settlement',
      icon: Icons.Shield,
      iconColor: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
      textColor: 'text-slate-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-md hover:border-slate-700/80 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">{item.title}</span>
              <div className={`p-2 rounded-xl border ${item.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white tracking-tight font-mono">
                {isLoading ? (
                  <span className="inline-block w-24 h-7 bg-slate-800 rounded animate-pulse" />
                ) : item.isCount ? (
                  `${item.amount} Transfers`
                ) : (
                  formatCurrency(item.amount, item.currency)
                )}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              <span>{item.change}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
