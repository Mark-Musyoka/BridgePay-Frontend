import React from 'react';
import { Icons } from '@/components/ui/Icons';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-6">
      <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center animate-pulse">
        <Icons.Wallet className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-on-surface">Loading BridgePay...</p>
        <p className="text-xs text-on-surface-variant">Synchronizing ledger & account details</p>
      </div>
    </div>
  );
}
