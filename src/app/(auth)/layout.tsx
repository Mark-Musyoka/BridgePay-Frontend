import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { WEB_URL } from '@/lib/api';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface text-on-surface">
      {/* Top Navbar */}
      <header className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href={WEB_URL} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Icons.Wallet className="w-5 h-5 text-on-primary" />
          </div>
          <span className="font-bold text-lg text-on-surface tracking-tight">BridgePay</span>
        </Link>
        <Link
          href={WEB_URL}
          className="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1 transition-colors"
        >
          <span>Back to home</span>
          <Icons.ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Center Auth Content */}
      <main className="flex-1 flex items-center justify-center p-4">{children}</main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-on-surface-variant">
        <p>© {new Date().getFullYear()} BridgePay. Built for reliable peer-to-peer payments.</p>
      </footer>
    </div>
  );
}
