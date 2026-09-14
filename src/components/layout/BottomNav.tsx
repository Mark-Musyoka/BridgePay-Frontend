'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';
import { MAIN_NAV_ITEMS, isNavItemActive } from '@/lib/navigation';

/** Mobile only — Sidebar takes over on tablet/desktop (md and up). */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe bg-surface/85 backdrop-blur-xl shadow-[0_-4px_24px_rgba(15,23,42,0.06)] border-t border-surface-container">
      <div className="max-w-md sm:max-w-xl mx-auto h-20 px-2 flex items-center justify-around">
        {MAIN_NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item);
          const Icon = Icons[item.icon];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'min-w-[56px] min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors select-none',
                active ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] tracking-wide font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
