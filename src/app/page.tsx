'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/ui/Icons';

export default function HomePage() {
  const { isAuthenticated, demoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Top Navbar */}
      <nav className="w-full border-b border-outline-variant">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Icons.Wallet className="w-5 h-5 text-on-primary" />
            </div>
            <span className="font-bold text-lg text-on-surface tracking-tight">BridgePay</span>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Open Wallet
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section — top-aligned with fixed padding, never vertically
          centered against the full viewport height, so it doesn't float
          in a sea of empty space on a tall desktop screen. */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface max-w-xl leading-tight text-balance">
            A wallet that works the way you already bank
          </h1>

          <p className="mt-5 text-base text-on-surface-variant max-w-xl leading-relaxed text-balance">
            Send money to other BridgePay users instantly. Deposit and withdraw by card, M-Pesa,
            Airtel Money, or bank account, no new habits required.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="px-7 py-3.5 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Create free account
            </Link>
            <button
              onClick={() => demoLogin('user')}
              className="px-7 py-3.5 rounded-xl bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-container-highest active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Icons.ExternalLink className="w-4 h-4" />
              <span>Try the live demo</span>
            </button>
          </div>

          {/* Balance preview — a dark accent card on the light theme,
              intentionally, for visual hierarchy. Only claims what's
              actually true: an instant, real-time wallet balance. */}
          <div className="w-full max-w-sm mt-12 p-5 rounded-2xl bg-primary text-on-primary text-left shadow-md">
            <span className="text-xs text-on-primary/70 font-medium">Available balance</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-base font-semibold text-on-primary/80">KES</span>
              <span className="text-3xl font-extrabold font-mono">48,250.00</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-on-surface-variant border-t border-outline-variant">
        <p>© {new Date().getFullYear()} BridgePay.</p>
      </footer>
    </div>
  );
}
