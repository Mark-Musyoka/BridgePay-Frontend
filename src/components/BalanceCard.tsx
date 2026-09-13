'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function BalanceCard() {
  const { account } = useAuth();
  const { showToast } = useToast();
  const [isMasked, setIsMasked] = useState(false);

  const rawBalance = parseFloat(String(account?.balance || '48250')).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const pendingAmount = '1,800.00';

  const toggleVisibility = () => {
    setIsMasked(!isMasked);
    showToast(isMasked ? 'Balance unhidden' : 'Balance hidden', 'info');
  };

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-primary via-primary-container to-[#0c1b4d] p-6 sm:p-7 text-on-primary shadow-xl">
      {/* Subtle Ambient Graphic Backdrop */}
      <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-surface-tint/20 blur-2xl pointer-events-none" />
      <div className="absolute right-4 bottom-2 opacity-15 pointer-events-none">
        <svg fill="none" height="80" viewBox="0 0 100 60" width="120" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 50C25 20 45 40 60 15C75 -10 95 30 110 5" stroke="#ffffff" strokeLinecap="round" strokeWidth="6" />
          <circle cx="60" cy="15" fill="#86f2e4" r="7" />
        </svg>
      </div>

      {/* Balance Header Row */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-on-primary-container tracking-wide font-medium">
            Available Balance
          </span>
          <button
            aria-label="Toggle balance visibility"
            className="text-on-primary-container hover:text-white transition-colors flex items-center p-0.5 rounded focus:outline-none"
            onClick={toggleVisibility}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isMasked ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/15 text-white backdrop-blur-md">
          PesaLink Active
        </span>
      </div>

      {/* Primary Balance Display */}
      <div className="relative z-10 mt-2 flex items-baseline gap-1.5">
        <span className="text-lg sm:text-xl text-secondary-container font-bold">
          {account?.currency || 'KES'}
        </span>
        <span className="text-3xl sm:text-4xl text-white tracking-tight tabular-nums font-extrabold transition-all">
          {isMasked ? '••••••••' : rawBalance}
        </span>
      </div>

      {/* Pending Balance + Top Up Quick Pill */}
      <div className="relative z-10 mt-5 pt-3 flex items-center justify-between border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-ping shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-on-primary-container uppercase tracking-wider font-medium">
              Pending Clearance
            </span>
            <span className="text-xs text-white font-semibold tabular-nums">
              {account?.currency || 'KES'} {isMasked ? '••••' : pendingAmount}
            </span>
          </div>
        </div>

        <Link
          href="/topup"
          className="px-4 py-2 rounded-full bg-secondary text-on-secondary text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-[0.97] transition-all hover:bg-secondary/90 hover:shadow-lg"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          <span>Top Up</span>
        </Link>
      </div>
    </div>
  );
}
