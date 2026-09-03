'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const navLinks = [
    {
      label: 'Home',
      href: '/dashboard',
      icon: 'account_balance_wallet',
      active: pathname === '/dashboard',
    },
    {
      label: 'Pay & Send',
      href: '/transfer',
      icon: 'send_money',
      active: pathname === '/transfer',
    },
    {
      label: 'Activity',
      href: '/transactions',
      icon: 'receipt_long',
      active: pathname?.startsWith('/transactions'),
    },
    {
      label: 'Cards',
      href: '/topup',
      icon: 'credit_card',
      active: pathname === '/topup' || pathname === '/profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe bg-surface/85 backdrop-blur-xl shadow-[0_-4px_24px_rgba(15,23,42,0.06)] border-t border-surface-container">
      <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto h-20 px-2 flex items-center justify-around">
        {navLinks.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'min-w-[64px] min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors select-none',
              item.active
                ? 'text-primary font-bold'
                : 'text-on-surface-variant hover:text-primary'
            )}
          >
            <span
              className={cn(
                'material-symbols-outlined text-[24px]',
                item.active ? 'font-bold' : ''
              )}
              style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="text-[10px] tracking-wide font-semibold">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
