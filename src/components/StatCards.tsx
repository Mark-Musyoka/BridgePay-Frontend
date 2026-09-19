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
      iconColor: 'text-on-secondary-container bg-secondary-container border-secondary/30',
      textColor: 'text-secondary',
    },
    {
      title: 'Total Sent (Outflow)',
      amount: stats?.total_sent ?? 370,
      currency: stats?.currency ?? 'USD',
      change: '4 transfers settled',
      icon: Icons.ArrowUpRight,
      iconColor: 'text-on-primary-fixed bg-primary-fixed border-primary/30',
      textColor: 'text-primary',
    },
    {
      title: 'Network Activity',
      amount: stats?.transaction_count ?? 5,
      isCount: true,
      currency: '',
      change: '100% On-Time Settlement',
      icon: Icons.Shield,
      iconColor: 'text-on-tertiary-fixed bg-tertiary-fixed border-tertiary/30',
      textColor: 'text-on-surface',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-surface-container-low backdrop-blur-md border border-outline-variant shadow-sm hover:border-outline transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-on-surface-variant">{item.title}</span>
              <div className={`p-2 rounded-xl border ${item.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-on-surface tracking-tight font-mono">
                {isLoading ? (
                  <span className="inline-block w-24 h-7 bg-surface-container-high rounded animate-pulse" />
                ) : item.isCount ? (
                  `${item.amount} Transfers`
                ) : (
                  formatCurrency(item.amount, item.currency)
                )}
              </span>
            </div>

            <p className="text-[11px] text-on-surface-variant mt-2 flex items-center gap-1">
              <span>{item.change}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
