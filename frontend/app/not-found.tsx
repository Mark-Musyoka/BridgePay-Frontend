import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
        <Icons.Wallet className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white font-mono">404</h1>
      <h2 className="text-xl font-bold text-white">Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm">
        The requested page does not exist or may have been moved.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
      >
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
