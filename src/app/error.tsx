'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-400 flex items-center justify-center">
        <Icons.AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-white tracking-tight">Something went wrong</h2>
      <p className="text-xs text-slate-400 leading-relaxed">
        {error.message || 'An unexpected application error occurred while processing your request.'}
      </p>
      <Button
        variant="primary"
        onClick={() => reset()}
        leftIcon={<Icons.Refresh className="w-4 h-4" />}
      >
        Try Again
      </Button>
    </div>
  );
}
