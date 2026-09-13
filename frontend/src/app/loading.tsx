import React from 'react';
import { Icons } from '@/components/ui/Icons';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-6">
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center animate-pulse">
        <Icons.Wallet className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-white">Loading BridgePay...</p>
        <p className="text-xs text-slate-400">Synchronizing ledger & account details</p>
      </div>
    </div>
  );
}
