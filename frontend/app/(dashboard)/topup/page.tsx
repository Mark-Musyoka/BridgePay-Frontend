'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function TopUpPage() {
  const { account, token, refreshAccount } = useAuth();
  const { showToast } = useToast();

  const [amount, setAmount] = useState('2500');
  const [phoneNumber, setPhoneNumber] = useState('0712345678');
  const [method, setMethod] = useState<'mpesa' | 'pesalink' | 'card'>('mpesa');
  const [isLoading, setIsLoading] = useState(false);

  const presetAmounts = [500, 1000, 2500, 5000, 10000];

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter a valid deposit amount', 'error');
      return;
    }

    setIsLoading(true);
    const currentToken = token || 'mock_token';

    try {
      await api.topUpAccount(
        {
          amount: numAmount,
          currency: 'KES',
          payment_method: method,
        },
        currentToken
      );

      await refreshAccount();
      showToast(`Deposited ${formatCurrency(numAmount, 'KES')} into your wallet!`, 'success', 'Top Up Successful');
    } catch (err: any) {
      showToast(err.message || 'Deposit failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Top Up Wallet</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Add funds instantly via M-Pesa or PesaLink
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

      <div className="rounded-3xl bg-surface-container-lowest p-6 sm:p-7 shadow-sm border border-surface-container space-y-5">
        <form onSubmit={handleTopUp} className="space-y-5">
          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Select Amount (KES)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                    amount === String(preset)
                      ? 'bg-secondary text-on-secondary border-secondary shadow-xs'
                      : 'bg-surface-container-low border-surface-container text-on-surface hover:bg-surface-container'
                  }`}
                >
                  KES {preset.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="relative flex items-center mt-2">
              <span className="absolute left-4 font-bold text-on-surface-variant text-sm">KES</span>
              <input
                type="number"
                step="1"
                min="1"
                placeholder="Custom Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface-container-low border border-surface-container rounded-2xl pl-14 pr-4 py-3 text-base font-bold text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Payment Method
            </label>
            <div className="space-y-2">
              <div
                onClick={() => setMethod('mpesa')}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  method === 'mpesa'
                    ? 'bg-secondary-container/40 border-secondary text-on-surface'
                    : 'bg-surface-container-low border-surface-container text-on-surface-variant'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center font-bold text-xs">
                    M
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">M-Pesa Express</p>
                    <p className="text-[11px] text-on-surface-variant">Instant STK Push Prompt</p>
                  </div>
                </div>
                {method === 'mpesa' && (
                  <span className="material-symbols-outlined text-[20px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                )}
              </div>

              <div
                onClick={() => setMethod('pesalink')}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  method === 'pesalink'
                    ? 'bg-secondary-container/40 border-secondary text-on-surface'
                    : 'bg-surface-container-low border-surface-container text-on-surface-variant'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                    P
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">PesaLink Instant</p>
                    <p className="text-[11px] text-on-surface-variant">Bank to Wallet Transfer</p>
                  </div>
                </div>
                {method === 'pesalink' && (
                  <span className="material-symbols-outlined text-[20px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                )}
              </div>
            </div>
          </div>

          {method === 'mpesa' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                M-Pesa Mobile Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="07XXXXXXXX"
                className="w-full bg-surface-container-low border border-surface-container rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-full bg-secondary text-on-secondary font-bold text-sm shadow-md hover:bg-secondary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Processing Prompt...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Top Up KES {parseFloat(amount || '0').toLocaleString()}.00</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
