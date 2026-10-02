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
    body: 'Encrypted end to end, wherever you send it.',
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
            Built for how you actually pay
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
          <p className="text-xs font-semibold text-[#14151A]/35 mb-5 tracking-wider uppercase">Works with</p>
          <div className="flex flex-wrap justify-center items-center gap-3">
            {[
              { name: 'M-Pesa', icon: Icons.MPesa },
              { name: 'Airtel Money', icon: Icons.Airtel },
              { name: 'Visa', icon: Icons.Visa },
              { name: 'Mastercard', icon: Icons.Mastercard },
              { name: 'Bank transfer', icon: Icons.Bank },
            ].map((rail) => {
              const Icon = rail.icon;
              return (
                <div
                  key={rail.name}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-black/[0.08] shadow-xs hover:shadow-sm transition-all"
                >
                  <Icon className="w-6 h-6 shrink-0" />
                  <span className="text-sm font-semibold text-[#14151A]/80">{rail.name}</span>
                </div>
              );
            })}
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
    </div>
  );
}
