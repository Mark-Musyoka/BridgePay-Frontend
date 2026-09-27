'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // While auth state is resolving, or once we know the visitor isn't
  // logged in and a redirect to /login is about to happen, don't
  // render the dashboard shell (sidebar/header/content) at all — every
  // page under this layout assumes a real session, so showing it even
  // briefly to a logged-out visitor is exactly the gap this guard
  // closes.
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-sm text-on-surface-variant">Loading...</p>
      </div>
    );
  }

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
