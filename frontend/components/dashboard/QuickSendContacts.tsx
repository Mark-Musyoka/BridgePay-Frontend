'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export interface Contact {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials?: string;
  gradient: string;
}

export const FREQUENT_CONTACTS: Contact[] = [
  {
    id: 'c1',
    name: 'Wanjiku K.',
    email: 'wanjiku.k@bridgepay.dev',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAQfjTAeMPMyZh1Wn8d42DPSngtukC_TOC9_SNrTgUIzPBpKIHal9-36dTGqJbuHF1lrHncbYYyBpoxuFr0g65CzqikcYyZvma8fSE_DUfEfat_XCSYHqQDM0Zek_KM3UqcON9S-Lu6PMHR7oxzlhLbJh5OKPlINL7SFKvvkIvtxyjYtqtCFZxcBWwQ7zTlkwD4-EAt6Tut0E3azHY3ZJa-d9k_7Zxs-EYSl8GtDFEe5KE5HOKIjAuntA',
    gradient: 'from-secondary to-primary',
  },
  {
    id: 'c2',
    name: 'Brian O.',
    email: 'brian.o@bridgepay.dev',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB7zexBCqYFh0JZpIqZpiG1TmFyX6t6QXyQpt-xh_Zx4nh95h4JF_NZMUAJzg58AZEdmuYPy3dhmNQfrpqADWH2WWze3VarXlmh5CyLbwZs1jc14C-EGca9uj83IFmeiAAmwpl-K6Xlr-zEWqC2e2QUmE884Am9KCIj4NRgIff_ru9iyCj0HGIYRRxZ9Ozls1UThcfzeAjWeYlhygM6xuRSMmkm_n0bu9cXd6KbxGbMMiemWxnr_boxFQ',
    gradient: 'from-primary to-surface-variant',
  },
  {
    id: 'c3',
    name: 'Amina M.',
    email: 'amina.m@bridgepay.dev',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAhV11wZPn7XjU7gEzpS6ZWNivxEGeitXdnVRw8pZqI51EZeXfH5iTv37pMLWmHBBrLu_kd2gVukoILlCrvFp9TJus524dOlzP2SeVZIJCx2OO6s-j6az_8C2TowrZZ7Pmb4HGo3bG9NBnV7NHCZ2UgIn27kqgbQOZwzYQ2DLWbyw89xU8LmOeC6Oi8lSJ02p07CtRZvcIOu1mK2QZoXdL5FUVTj0Qht3NGSaqBYjhw36ydEJ32WelXXg',
    gradient: 'from-tertiary-fixed-dim to-secondary',
  },
  {
    id: 'c4',
    name: 'David N.',
    email: 'david.n@bridgepay.dev',
    initials: 'DN',
    gradient: 'from-secondary-container to-primary',
  },
];

interface QuickSendContactsProps {
  onSelectContact?: (contact: Contact) => void;
}

export function QuickSendContacts({ onSelectContact }: QuickSendContactsProps) {
  const router = useRouter();

  const handleContactClick = (contact: Contact) => {
    if (onSelectContact) {
      onSelectContact(contact);
    } else {
      router.push(`/transfer?email=${encodeURIComponent(contact.email)}`);
    }
  };

  return (
    <div className="flex flex-col space-y-2 pt-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-base text-on-surface">Quick Send</span>
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
          Frequent
        </span>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* Add New Quick Contact Button */}
        <button
          onClick={() => router.push('/transfer')}
          className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
          type="button"
        >
          <div className="w-[52px] h-[52px] rounded-full bg-surface-container-high text-primary flex items-center justify-center shadow-xs group-active:scale-95 group-hover:bg-surface-container-highest transition-all">
            <span className="material-symbols-outlined text-[22px]">person_add</span>
          </div>
          <span className="text-[10px] text-on-surface-variant font-semibold">New</span>
        </button>

        {/* Contacts */}
        {FREQUENT_CONTACTS.map((contact) => (
          <button
            key={contact.id}
            onClick={() => handleContactClick(contact)}
            className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition-transform focus:outline-none"
            type="button"
          >
            <div
              className={`relative w-[52px] h-[52px] rounded-full p-0.5 bg-gradient-to-tr ${contact.gradient} shadow-xs group-hover:shadow-md transition-shadow`}
            >
              {contact.avatar ? (
                <img
                  className="w-full h-full rounded-full object-cover"
                  src={contact.avatar}
                  alt={contact.name}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold text-sm">
                  {contact.initials || 'DN'}
                </div>
              )}
              {/* Online Indicator Dot */}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-secondary ring-2 ring-surface" />
            </div>
            <span className="text-[10px] text-on-surface font-medium max-w-[62px] truncate text-center">
              {contact.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
