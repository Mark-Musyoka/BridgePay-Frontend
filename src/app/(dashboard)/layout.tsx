'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-surface text-on-surface antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Side rail — tablet/desktop only (md and up); BottomNav takes over on mobile */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Fixed at top on every breakpoint — offsets past the sidebar's
            width on desktop (see Header's own md:left-64) rather than
            duplicating the notification bell / profile link inside
            Sidebar too */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative w-full pt-16 pb-28 px-4 sm:px-6 md:pb-8 max-w-2xl lg:max-w-4xl mx-auto">
          {children}
        </main>

        {/* Fixed Bottom Navigation — mobile only (md:hidden is inside BottomNav itself) */}
        <BottomNav />
      </div>
    </div>
  );
}
