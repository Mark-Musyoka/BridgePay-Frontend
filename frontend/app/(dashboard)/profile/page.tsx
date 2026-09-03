'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, truncateHash } from '@/lib/utils';

export default function ProfilePage() {
  const { user, account, logout } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || 'Zawadi Mwangi');
  const [copied, setCopied] = useState(false);

  const handleCopyAccountId = () => {
    if (account?.id) {
      navigator.clipboard.writeText(account.id);
      setCopied(true);
      showToast('Account ID copied', 'info');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Account & Profile</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Manage your personal verification and wallet
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-bold text-primary hover:text-primary-container flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Home</span>
        </Link>
      </div>

      {/* User Details Card */}
      <div className="rounded-3xl bg-surface-container-lowest p-6 sm:p-7 shadow-sm border border-surface-container space-y-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover ring-4 ring-primary-fixed"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZW7CSUdpux02BJk77M4tGZH0UbFhOEsfp1kL_raJB_iz_PsI9PxFE3JEemSfdOv-GKC3-YsjYzptXo7PBI35EcO81Xj5S77iDgOrG7dA66HMAQ6O8iZPVNT9klX-BJIMDgFVGMJDJdPInpTfNlfPO_J1pIDSnoUwgl6JfS08D3ZK6FCvczOekA6a3tH1m4ca0X_wy6q_OrSEEGM4yLJG-1AIglKu2ycikDJ4fp8cICaUbWqonSP_klg"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-secondary ring-2 ring-surface" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-on-surface">{fullName}</h2>
            <p className="text-xs text-on-surface-variant">{user?.email || 'zawadi@bridgepay.dev'}</p>
            <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container/50 text-on-secondary-fixed-variant text-[10px] font-bold">
              <span className="material-symbols-outlined text-[13px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <span>KES KYC Verified</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-surface-container text-xs pt-2">
          <div className="py-3 flex items-center justify-between">
            <span className="text-on-surface-variant">Account ID</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-on-surface font-semibold">
                {truncateHash(account?.id || 'acc_demo_882', 6, 4)}
              </span>
              <button
                onClick={handleCopyAccountId}
                className="text-primary hover:text-primary-container p-1"
                title="Copy Account ID"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
              </button>
              {copied && <span className="text-[10px] text-secondary font-bold">Copied</span>}
            </div>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="text-on-surface-variant">Current Balance</span>
            <span className="font-bold text-on-surface font-mono">
              {formatCurrency(account?.balance, account?.currency)}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <span className="text-on-surface-variant">Settlement Rail</span>
            <span className="text-primary font-bold">PesaLink / M-Pesa</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={logout}
            className="w-full py-3 rounded-full bg-surface-container-high text-error font-bold text-xs hover:bg-error-container hover:text-on-error-container transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
