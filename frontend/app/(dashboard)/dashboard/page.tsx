'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Transaction } from '@/types';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { QuickSendContacts } from '@/components/dashboard/QuickSendContacts';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      const currentToken = token || 'mock_token';

      try {
        const txRes = await api.getTransactions(currentToken, { page: 1, page_size: 5 });
        setTransactions(txRes.items || []);
      } catch (err) {
        console.warn('Dashboard data fetch warning:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [token]);

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Zawadi';

  return (
    <div className="flex flex-col w-full space-y-5 select-none pt-2">
      {/* Top Greeting & Verification Badge */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
              Habari, {firstName}
            </h1>
            <span className="text-[20px] animate-pulse">👋</span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Ready to move money seamlessly
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container/40 text-on-secondary-fixed-variant shadow-xs">
          <span
            className="material-symbols-outlined text-[15px] text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
          <span className="text-[10px] uppercase tracking-wider font-bold">
            KES Verified
          </span>
        </div>
      </div>

      {/* Main Balance Card with Indigo Gradient & Pattern */}
      <BalanceCard />

      {/* Primary Kenyan Rails & Actions (4-Column Thumb Grid) */}
      <QuickActions />

      {/* Favorite Quick Send Contacts */}
      <QuickSendContacts />

      {/* Smart Financial Insight Card */}
      <InsightCard />

      {/* Recent Activity Section */}
      <RecentTransactions transactions={transactions} isLoading={isLoading} />
    </div>
  );
}
