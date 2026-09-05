import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#090d16] text-slate-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-emerald-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Top Navbar */}
      <header className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full relative z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Icons.Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">BridgePay</span>
        </Link>
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          <span>Back to home</span>
          <Icons.ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Center Auth Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 relative z-10">
        <p>© {new Date().getFullYear()} BridgePay. Built for reliable peer-to-peer payments.</p>
      </footer>
    </div>
  );
}
