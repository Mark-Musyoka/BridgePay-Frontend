'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/ui/Icons';

const FEATURES = [
  {
    icon: Icons.Wallet,
    title: 'One balance',
    body: 'M-Pesa, Airtel Money, card, and bank all land in the same place.',
  },
  {
    icon: Icons.Send,
    title: 'Instant transfers',
    body: 'Send to any BridgePay user in real time, no waiting on rails.',
  },
  {
    icon: Icons.Shield,
    title: 'Bank-grade security',
    body: 'Encrypted end to end, built and hosted for Kenyan rails.',
  },
];

export default function HomePage() {
  const { isAuthenticated, demoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#14151A] selection:bg-[#FF6B4A]/25">
      {/* Nav */}
      <nav className="w-full sticky top-0 z-20 bg-[#FAF9F6]/85 backdrop-blur-sm border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#14151A] flex items-center justify-center">
              <Icons.Wallet className="w-3.5 h-3.5 text-[#FAF9F6]" />
            </div>
            <span className="font-bold text-[15px] tracking-tight">BridgePay</span>
          </div>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-full bg-[#14151A] text-[#FAF9F6] font-semibold text-sm hover:bg-[#14151A]/85 transition-colors"
            >
              Open wallet
            </Link>
          ) : (
            <div className="flex items-center gap-1">
              <Link href="/login" className="px-3.5 py-2 text-sm font-medium text-[#14151A]/65 hover:text-[#14151A] transition-colors">
                Sign in
              </Link>
              <Link
                href="/register"
                className="ml-1 px-4 py-2 rounded-full bg-[#14151A] text-[#FAF9F6] font-semibold text-sm hover:bg-[#14151A]/85 transition-colors"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main>
        {/* Hero — centered, editorial */}
        <section className="max-w-2xl mx-auto px-6 pt-20 sm:pt-28 pb-16 text-center flex flex-col items-center">
          <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#FF6B4A]">
            Built for how Kenya actually pays
          </span>
          <h1 className="mt-4 text-[2.75rem] sm:text-[3.25rem] font-extrabold tracking-tight leading-[1.05]">
            Every rail you use.
            <br />
            One wallet that holds it.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#14151A]/60 leading-relaxed max-w-md">
            M-Pesa, Airtel Money, card, or bank — deposit from any of them, send to
            anyone on BridgePay instantly, and see it all in one balance.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="px-7 py-3.5 rounded-full bg-[#14151A] text-[#FAF9F6] font-semibold text-sm hover:bg-[#14151A]/85 active:scale-[0.98] transition-all"
            >
              Create free account
            </Link>
            <button
              onClick={() => demoLogin('user')}
              className="px-7 py-3.5 rounded-full border border-[#14151A]/15 font-semibold text-sm hover:bg-black/[0.03] active:scale-[0.98] transition-all"
            >
              Try the live demo
            </button>
          </div>
        </section>

        {/* Floating product card mockup */}
        <section className="max-w-2xl mx-auto px-6 pb-20 sm:pb-28" aria-hidden="true">
          <div className="rounded-[28px] bg-white border border-black/[0.06] shadow-[0_20px_60px_-15px_rgba(20,21,26,0.18)] p-6 sm:p-8 fade-in-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#14151A]/45 uppercase tracking-wider">Available balance</span>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#14151A]/[0.05] text-[#14151A]/60">KES</span>
            </div>
            <p className="mt-2 text-4xl sm:text-5xl font-extrabold font-mono tabular-nums tracking-tight">48,250.00</p>

            <div className="mt-6 h-px bg-black/[0.06]" />

            <div className="mt-5 flex flex-col gap-4">
              {[
                { label: 'M-Pesa deposit', sub: 'Just now', amount: '+ 12,000.00' },
                { label: 'Sent to Wanjiru K.', sub: 'Yesterday', amount: '- 3,500.00' },
                { label: 'Airtel Money deposit', sub: '2 days ago', amount: '+ 8,000.00' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{row.label}</p>
                    <p className="text-xs text-[#14151A]/45 mt-0.5">{row.sub}</p>
                  </div>
                  <span className={`text-sm font-semibold font-mono ${row.amount.startsWith('+') ? 'text-[#1A7A4C]' : 'text-[#14151A]/80'}`}>
                    {row.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-black/[0.06] bg-white">
          <div className="max-w-4xl mx-auto px-6 py-16 sm:py-20 grid sm:grid-cols-3 gap-10 sm:gap-8">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6B4A]/12 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#FF6B4A]" />
                  </div>
                  <h3 className="mt-4 font-semibold text-base">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-[#14151A]/55 leading-relaxed max-w-[24ch]">{f.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Trust strip */}
        <section className="max-w-4xl mx-auto px-6 py-12 sm:py-14 text-center">
          <p className="text-xs font-semibold text-[#14151A]/35 mb-5">Works with</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {['M-Pesa', 'Airtel Money', 'Visa', 'Mastercard', 'Bank transfer'].map((rail) => (
              <span key={rail} className="px-3.5 py-1.5 rounded-full bg-black/[0.04] text-sm font-medium text-[#14151A]/70">
                {rail}
              </span>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-black/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#14151A]/40">
          <p>&copy; {new Date().getFullYear()} BridgePay.</p>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-[#14151A]/70 transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-[#14151A]/70 transition-colors">Create account</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .fade-in-card {
          opacity: 0;
          transform: translateY(12px);
          animation: card-in 0.55s ease-out 0.1s forwards;
        }
        @keyframes card-in {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .fade-in-card {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
