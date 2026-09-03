'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface antialiased relative selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-28 px-4 sm:px-6 max-w-2xl lg:max-w-4xl mx-auto">
        {children}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
