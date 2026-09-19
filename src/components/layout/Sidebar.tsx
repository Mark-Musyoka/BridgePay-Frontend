'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';
import { MAIN_NAV_ITEMS, isNavItemActive } from '@/lib/navigation';

/** Tablet/desktop only (md and up) — BottomNav takes over on mobile. */
export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex w-64 shrink-0 bg-surface border-r border-outline-variant flex-col justify-between p-4 min-h-screen">
      <div>
        {/* Brand Header */}
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-4 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Icons.Wallet className="w-5 h-5 text-on-primary" />
          </div>
          <div>
            <span className="font-bold text-lg text-on-surface tracking-tight">BridgePay</span>
            <p className="text-[11px] text-on-surface-variant">Payments & Remittance</p>
          </div>
        </Link>

        {/* Navigation items */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Main Menu
          </div>
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive = isNavItemActive(pathname, item);
            const Icon = Icons[item.icon];

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-transparent'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive ? 'text-on-primary' : 'text-on-surface-variant group-hover:text-on-surface'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Section & Logout */}
      <div className="pt-4 border-t border-outline-variant space-y-3">
        {user && (
          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs shrink-0">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-on-surface truncate">{user.full_name || 'Demo User'}</p>
                <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error-container border border-transparent transition-all duration-200"
        >
          <Icons.LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
