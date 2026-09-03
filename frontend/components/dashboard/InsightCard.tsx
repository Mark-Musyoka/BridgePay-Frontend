'use client';

import React from 'react';

export function InsightCard() {
  return (
    <div className="rounded-2xl bg-surface-container-low p-4 sm:p-5 flex items-center justify-between shadow-xs border border-surface-container">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[20px]">insights</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
            Spending this month
          </span>
          <span className="text-base sm:text-lg text-on-surface font-extrabold truncate">
            KES 24,120.00
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container shrink-0">
        <span className="material-symbols-outlined text-[14px]">trending_down</span>
        <span className="text-[10px] font-bold">-12% vs last mo.</span>
      </div>
    </div>
  );
}
