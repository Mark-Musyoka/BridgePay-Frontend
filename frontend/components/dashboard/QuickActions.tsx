'use client';

import React from 'react';
import Link from 'next/link';

interface QuickActionsProps {
  onSelectAction?: (action: 'send' | 'request' | 'till' | 'paybill') => void;
}

export function QuickActions({ onSelectAction }: QuickActionsProps) {
  const actions = [
    {
      id: 'send',
      label: 'Send',
      icon: 'send_money',
      bgColor: 'bg-secondary-container/60 text-secondary',
      href: '/transfer?mode=send',
    },
    {
      id: 'request',
      label: 'Request',
      icon: 'call_received',
      bgColor: 'bg-primary-fixed text-primary',
      href: '/transfer?mode=request',
    },
    {
      id: 'till',
      label: 'Till No.',
      icon: 'storefront',
      bgColor: 'bg-secondary text-on-secondary',
      href: '/transfer?mode=till',
    },
    {
      id: 'paybill',
      label: 'Paybill',
      icon: 'receipt_long',
      bgColor: 'bg-tertiary-fixed text-on-tertiary-fixed',
      href: '/transfer?mode=paybill',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4 pt-1">
      {actions.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          onClick={() => onSelectAction?.(action.id as any)}
          className="flex flex-col items-center gap-2 group active:scale-95 transition-transform select-none"
        >
          <div
            className={`w-14 h-14 rounded-2xl ${action.bgColor} flex items-center justify-center shadow-xs group-hover:shadow-md transition-all`}
          >
            <span className="material-symbols-outlined text-[26px]">{action.icon}</span>
          </div>
          <span className="text-xs text-on-surface text-center leading-tight font-semibold">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
