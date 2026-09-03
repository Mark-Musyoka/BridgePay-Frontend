'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, demoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Top Navbar */}
      <nav className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            alt="BridgePay Logo"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1UuYLrtNUQ9YxvXoxF5bu2PtJz2skRpoRmqVqM6CQ6JiWzdkZaT94902xTNXlFLXJoafGYHG1vKU7l1J_Bid-l0vQnpg7tgExHlzX1So54A15ePTWO9gMD447bCu8M5u0KiieCUOQvk_NaGUDBM6oeJWYSVEy61apHckg2rOao-SyX8Y4li0Z7sdPDaSjKXM4V90y1SUCb_nc3ne2yRnmlP9fvpQTwaxCo55NB875CrE-yaoANoHY_GfYCq"
          />
          <span className="font-extrabold text-xl text-primary tracking-tight">BridgePay</span>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary/90 transition-all"
            >
              Open Wallet →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-full bg-secondary text-on-secondary font-bold text-xs shadow-xs hover:bg-secondary/90 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-container/50 text-on-secondary-fixed-variant text-xs font-bold shadow-xs">
          <span className="material-symbols-outlined text-[15px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified
          </span>
          <span>Fast P2P, Lipa na Till & Paybill Rails in Kenya</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface max-w-2xl leading-tight">
          Move Money Seamlessly with{' '}
          <span className="text-primary">BridgePay</span>
        </h1>

        <p className="text-sm sm:text-base text-on-surface-variant max-w-xl leading-relaxed">
          The next-generation digital wallet for instant peer-to-peer transfers, M-Pesa clearance,
          and merchant till payments with zero settlement delays.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="px-7 py-3.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            Create Free Account
          </Link>
          <button
            onClick={() => demoLogin('user')}
            className="px-7 py-3.5 rounded-full bg-surface-container-high text-primary font-bold text-sm hover:bg-surface-container-highest active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
            <span>Launch Live Demo</span>
          </button>
        </div>

        {/* Mini Preview Box */}
        <div className="w-full max-w-md mt-8 p-5 rounded-3xl bg-gradient-to-br from-primary via-primary-container to-[#0c1b4d] text-on-primary text-left shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-primary-container font-medium">Available Balance</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white">
              PesaLink Active
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-secondary-container">KES</span>
            <span className="text-3xl font-extrabold text-white font-mono">48,250.00</span>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
            <span className="text-on-primary-container text-[11px]">Pending: KES 1,800.00</span>
            <span className="text-secondary-container font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              Instant Settlement
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-on-surface-variant border-t border-surface-container">
        <p>© {new Date().getFullYear()} BridgePay — Engineered by Mark Musyoka & Abednego Ndimu.</p>
      </footer>
    </div>
  );
}
