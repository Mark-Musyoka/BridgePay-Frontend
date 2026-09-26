'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/ui/Icons';

const RAILS = [
  { label: 'M-Pesa', sub: 'Deposit & withdraw' },
  { label: 'Airtel Money', sub: 'Deposit & withdraw' },
  { label: 'Card', sub: 'Visa & Mastercard' },
  { label: 'Bank', sub: 'Local & international' },
];

const STEPS = [
  {
    n: '1',
    title: 'Connect your rails',
    body: 'Link M-Pesa, Airtel Money, a card, or a bank account. Takes under a minute, no branch visit.',
  },
  {
    n: '2',
    title: 'Move money instantly',
    body: 'Send to any BridgePay user in real time, or deposit and withdraw through whichever rail is open.',
  },
  {
    n: '3',
    title: 'See it all in one place',
    body: 'One balance, one history, multiple currencies. No switching apps to check where your money is.',
  },
];

export default function HomePage() {
  const { isAuthenticated, demoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-[#F6F7FB] text-[#0B1220] selection:bg-[#F2A93B]/30 selection:text-[#0B1220]">
      {/* Top Navbar */}
      <nav className="w-full border-b border-black/5 bg-[#F6F7FB]/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto w-full px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1B2A6B] flex items-center justify-center">
              <Icons.Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[15px] tracking-tight">BridgePay</span>
          </div>

          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg bg-[#1B2A6B] text-white font-semibold text-sm hover:bg-[#15215490] transition-colors"
              >
                Open wallet
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-sm font-medium text-[#0B1220]/70 hover:text-[#0B1220] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="ml-1 px-4 py-2 rounded-lg bg-[#1B2A6B] text-white font-semibold text-sm hover:bg-[#15215490] transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24 grid md:grid-cols-2 gap-12 md:gap-8 items-center">
          {/* Left: copy */}
          <div className="max-w-md">
            <h1 className="text-[2.5rem] sm:text-5xl font-extrabold tracking-tight leading-[1.08] text-balance">
              One wallet. Every way you already pay.
            </h1>
            <p className="mt-5 text-base text-[#0B1220]/65 leading-relaxed max-w-sm">
              Deposit and withdraw through M-Pesa, Airtel Money, card, or bank account,
              then send to any BridgePay user instantly. No new habits, no waiting on rails to talk to each other.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl bg-[#1B2A6B] text-white font-semibold text-sm hover:bg-[#141f4f] active:scale-[0.98] transition-all"
              >
                Create free account
              </Link>
              <button
                onClick={() => demoLogin('user')}
                className="px-6 py-3 rounded-xl border border-[#0B1220]/15 text-[#0B1220] font-semibold text-sm hover:bg-black/[0.03] active:scale-[0.98] transition-all"
              >
                Try the live demo
              </button>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm text-[#0B1220]/55">
              <Icons.Shield className="w-4 h-4 shrink-0" />
              <span>Encrypted end to end. Built and hosted for Kenyan rails.</span>
            </div>
          </div>

          {/* Right: rails converging into wallet */}
          <div className="relative w-full max-w-sm mx-auto md:mx-0 md:ml-auto" aria-hidden="true">
            <div className="grid grid-cols-2 gap-3">
              {RAILS.map((rail, i) => (
                <div
                  key={rail.label}
                  className="rail-chip rounded-xl border border-black/5 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(11,18,32,0.06)]"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <p className="text-sm font-semibold">{rail.label}</p>
                  <p className="text-xs text-[#0B1220]/50 mt-0.5">{rail.sub}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center my-3">
              <svg width="2" height="28" viewBox="0 0 2 28" className="rail-line">
                <line x1="1" y1="0" x2="1" y2="28" stroke="#1B2A6B" strokeWidth="2" strokeDasharray="28" strokeDashoffset="28" />
              </svg>
            </div>

            <div className="rail-chip wallet-card rounded-2xl bg-[#1B2A6B] text-white p-5 shadow-[0_8px_24px_rgba(27,42,107,0.25)]" style={{ animationDelay: '380ms' }}>
              <span className="text-xs text-white/60 font-medium">Available balance</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-sm font-semibold text-white/70">KES</span>
                <span className="text-3xl font-extrabold font-mono tabular-nums">48,250.00</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-[#F2A93B] font-medium">
                <Icons.CheckCircle className="w-3.5 h-3.5" />
                <span>All rails connected</span>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-black/5 bg-white">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight max-w-md">
              From any rail to your wallet, in three steps
            </h2>

            <div className="mt-10 grid sm:grid-cols-3 gap-8 sm:gap-6">
              {STEPS.map((step) => (
                <div key={step.n} className="flex flex-col">
                  <span className="text-sm font-bold text-[#F2A93B] tabular-nums">{step.n}</span>
                  <h3 className="mt-2 font-semibold text-base">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-[#0B1220]/60 leading-relaxed max-w-[26ch]">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust / rails strip */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-14">
          <p className="text-xs font-semibold text-[#0B1220]/40 mb-5">Supported everywhere you already move money</p>
          <div className="flex flex-wrap gap-3">
            {['M-Pesa', 'Airtel Money', 'Visa', 'Mastercard', 'Local bank transfer', 'International bank transfer'].map((rail) => (
              <span
                key={rail}
                className="px-3.5 py-2 rounded-lg bg-white border border-black/5 text-sm font-medium text-[#0B1220]/70"
              >
                {rail}
              </span>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#0B1220]/45">
          <p>&copy; {new Date().getFullYear()} BridgePay.</p>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-[#0B1220]/70 transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-[#0B1220]/70 transition-colors">Create account</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .rail-chip {
          opacity: 0;
          animation: rail-in 0.5s ease-out forwards;
        }
        .rail-line {
          animation: rail-line-draw 0.4s 0.32s ease-out forwards;
        }
        @keyframes rail-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes rail-line-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .rail-chip,
          .rail-line line {
            animation: none !important;
            opacity: 1 !important;
            stroke-dashoffset: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
