'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function Header() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleNotifications = () => {
    showToast('You have 1 unread notice: KES 4,500.00 received from Wanjiku Kamau.', 'info', 'Notifications');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <img
            alt="BridgePay Logo"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida/AEtjO1UuYLrtNUQ9YxvXoxF5bu2PtJz2skRpoRmqVqM6CQ6JiWzdkZaT94902xTNXlFLXJoafGYHG1vKU7l1J_Bid-l0vQnpg7tgExHlzX1So54A15ePTWO9gMD447bCu8M5u0KiieCUOQvk_NaGUDBM6oeJWYSVEy61apHckg2rOao-SyX8Y4li0Z7sdPDaSjKXM4V90y1SUCb_nc3ne2yRnmlP9fvpQTwaxCo55NB875CrE-yaoANoHY_GfYCq"
          />
          <span className="font-title-lg text-lg sm:text-xl text-primary tracking-tight font-extrabold">
            BridgePay
          </span>
          <span className="hidden sm:inline-block ml-2 font-label-md text-xs text-on-surface-variant font-medium">
            Home
          </span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Button */}
          <button
            onClick={handleNotifications}
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-surface animate-pulse" />
          </button>

          {/* Profile Button */}
          <Link
            href="/profile"
            aria-label="Profile"
            className="w-10 h-10 rounded-full flex items-center justify-center group"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-fixed group-hover:ring-primary transition-all"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZW7CSUdpux02BJk77M4tGZH0UbFhOEsfp1kL_raJB_iz_PsI9PxFE3JEemSfdOv-GKC3-YsjYzptXo7PBI35EcO81Xj5S77iDgOrG7dA66HMAQ6O8iZPVNT9klX-BJIMDgFVGMJDJdPInpTfNlfPO_J1pIDSnoUwgl6JfS08D3ZK6FCvczOekA6a3tH1m4ca0X_wy6q_OrSEEGM4yLJG-1AIglKu2ycikDJ4fp8cICaUbWqonSP_klg"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
