'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { FREQUENT_CONTACTS } from '@/components/dashboard/QuickSendContacts';

function TransferContent() {
  const searchParams = useSearchParams();
  const { account, refreshAccount } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'send' | 'till' | 'paybill' | 'request'>('send');
  const [toEmail, setToEmail] = useState('');
  const [tillNumber, setTillNumber] = useState('');
  const [paybillNumber, setPaybillNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [referenceNote, setReferenceNote] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Confirmation modal & Completed Tx state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const urlMode = searchParams.get('mode') as any;

    if (urlEmail) setToEmail(urlEmail);
    if (urlMode && ['send', 'till', 'paybill', 'request'].includes(urlMode)) {
      setMode(urlMode);
    }
  }, [searchParams]);

  const currentBalance = parseFloat(String(account?.balance || '48250'));
  const numAmount = parseFloat(amount) || 0;

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'send' && !toEmail) {
      setError('Please provide a recipient email or phone.');
      return;
    }
    if (mode === 'till' && !tillNumber) {
      setError('Please provide a valid Buy Goods Till Number.');
      return;
    }
    if (mode === 'paybill' && (!paybillNumber || !accountNumber)) {
      setError('Please provide Paybill Business No. and Account No.');
      return;
    }

    if (numAmount <= 0) {
      setError('Amount must be greater than KES 0.00.');
      return;
    }

    if (mode !== 'request' && numAmount > currentBalance) {
      setError(`Insufficient funds. Your available balance is ${formatCurrency(currentBalance, 'KES')}.`);
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleExecuteTransfer = async () => {
    setIsLoading(true);

    const targetRecipient =
      mode === 'send'
        ? toEmail.trim()
        : mode === 'till'
        ? `till.${tillNumber.trim()}@bridgepay.ke`
        : mode === 'paybill'
        ? `paybill.${paybillNumber.trim()}.${accountNumber.trim()}@bridgepay.ke`
        : toEmail.trim();

    const targetNote =
      mode === 'till'
        ? `Lipa na Till ${tillNumber}${referenceNote ? ` • ${referenceNote}` : ''}`
        : mode === 'paybill'
        ? `Paybill ${paybillNumber} (Acc: ${accountNumber})${referenceNote ? ` • ${referenceNote}` : ''}`
        : referenceNote.trim() || 'P2P Transfer';

    try {
      const tx = await api.createTransfer({
        to_email: targetRecipient,
        amount: numAmount,
        reference_note: targetNote,
      });

      setCompletedTx(tx);
      setIsConfirmOpen(false);
      await refreshAccount();
      showToast('Payment settled instantly!', 'success', 'Transaction Complete');
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please verify recipient details.');
      showToast(err.message || 'Payment failed', 'error');
      setIsConfirmOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setToEmail('');
    setTillNumber('');
    setPaybillNumber('');
    setAccountNumber('');
    setAmount('');
    setReferenceNote('');
    setError('');
    setCompletedTx(null);
  };

  return (
    <div className="flex flex-col space-y-5 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Pay & Transfer</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Send money, Lipa na Till, or Paybill instantly
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-primary hover:text-primary-container flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Home</span>
        </Link>
      </div>

      {completedTx ? (
        /* Instant Success Receipt Screen */
        <div className="rounded-3xl bg-surface-container-lowest p-6 sm:p-8 shadow-md border border-surface-container text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-secondary-container/50 text-secondary flex items-center justify-center mx-auto shadow-xs">
            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-on-surface">Payment Successful!</h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Funds transferred and confirmed via BridgePay rails.
            </p>
            <div className="mt-4 inline-block px-5 py-2.5 rounded-2xl bg-secondary-container/30 border border-secondary-container text-secondary text-3xl font-extrabold font-mono">
              {formatCurrency(completedTx.amount, completedTx.currency)}
            </div>
          </div>

          <div className="divide-y divide-surface-container text-xs text-left max-w-md mx-auto pt-2">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-on-surface-variant">Recipient / Target</span>
              <span className="font-semibold text-on-surface">{completedTx.to_user_email}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-on-surface-variant">Transaction ID</span>
              <span className="font-mono text-on-surface">{completedTx.id}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-on-surface-variant">Reference</span>
              <span className="text-on-surface">{completedTx.reference_note || 'P2P Transfer'}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-on-surface-variant">Processing Fee</span>
              <span className="font-bold text-secondary">KES 0.00 (Zero Fee)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-on-surface-variant">Remaining Balance</span>
              <span className="font-extrabold text-on-surface font-mono">
                {formatCurrency(account?.balance, account?.currency)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
            <button
              onClick={handleResetForm}
              className="flex-1 py-3 px-4 rounded-full bg-secondary text-on-secondary font-bold text-xs shadow-sm hover:bg-secondary/90 transition-all"
              type="button"
            >
              Make Another Transfer
            </button>
            <Link
              href="/transactions"
              className="flex-1 py-3 px-4 rounded-full bg-surface-container text-primary font-bold text-xs hover:bg-surface-container-high transition-all flex items-center justify-center"
            >
              View Activity
            </Link>
          </div>
        </div>
      ) : (
        /* Transfer Form Container */
        <div className="rounded-3xl bg-surface-container-lowest p-6 sm:p-7 shadow-sm border border-surface-container space-y-5">
          {/* Rail Mode Switcher */}
          <div className="grid grid-cols-4 p-1 rounded-2xl bg-surface-container gap-1">
            {[
              { id: 'send', label: 'Send P2P', icon: 'send_money' },
              { id: 'till', label: 'Till No.', icon: 'storefront' },
              { id: 'paybill', label: 'Paybill', icon: 'receipt_long' },
              { id: 'request', label: 'Request', icon: 'call_received' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMode(tab.id as any);
                  setError('');
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                  mode === tab.id
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span className="text-[11px] truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Frequent Contacts Quick Selection for P2P Send */}
          {mode === 'send' && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Select Frequent Contact
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {FREQUENT_CONTACTS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setToEmail(c.email);
                      setError('');
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold shrink-0 transition-all ${
                      toEmail === c.email
                        ? 'bg-secondary-container text-on-secondary-container border-secondary'
                        : 'bg-surface-container-low text-on-surface border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleReview} className="space-y-4">
            {/* Conditional Input depending on mode */}
            {mode === 'send' || mode === 'request' ? (
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Recipient Email or Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. wanjiku.k@bridgepay.dev or 0712345678"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  className="w-full bg-surface-container-low border border-surface-container rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            ) : mode === 'till' ? (
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Buy Goods Till Number
                </label>
                <input
                  type="number"
                  placeholder="e.g. 342110 (Java House)"
                  value={tillNumber}
                  onChange={(e) => setTillNumber(e.target.value)}
                  className="w-full bg-surface-container-low border border-surface-container rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Paybill Business No.
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 888888"
                    value={paybillNumber}
                    onChange={(e) => setPaybillNumber(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Account No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ACC-49102"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            )}

            {/* Amount input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Amount (KES)
                </label>
                <span className="text-[11px] text-on-surface-variant">
                  Available: <strong className="text-secondary">{formatCurrency(currentBalance, 'KES')}</strong>
                </span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-bold text-on-surface-variant text-sm">KES</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-surface-container-low border border-surface-container rounded-2xl pl-14 pr-4 py-3 text-base font-bold text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 pt-1">
                {[500, 1000, 2500, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setAmount(String(val));
                      setError('');
                    }}
                    className="px-3 py-1 rounded-xl bg-surface-container text-on-surface-variant hover:text-primary text-xs font-bold transition-colors"
                  >
                    KES {val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Note */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Note / Reason (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Lunch split, Rent, Coffee"
                value={referenceNote}
                onChange={(e) => setReferenceNote(e.target.value)}
                className="w-full bg-surface-container-low border border-surface-container rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-3 py-3.5 px-6 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Review Payment</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-surface-container-lowest p-6 shadow-2xl border border-surface-container space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <h3 className="font-bold text-base text-on-surface">Confirm Payment</h3>
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="text-center py-2">
              <span className="text-xs text-on-surface-variant uppercase font-semibold">
                Transfer Amount
              </span>
              <p className="text-3xl font-extrabold text-primary font-mono mt-1">
                KES {numAmount.toLocaleString()}.00
              </p>
            </div>

            <div className="divide-y divide-surface-container text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-on-surface-variant">Method</span>
                <span className="font-bold text-on-surface uppercase">
                  {mode === 'send'
                    ? 'P2P Transfer'
                    : mode === 'till'
                    ? 'Lipa na Till'
                    : mode === 'paybill'
                    ? 'Paybill'
                    : 'Request'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-on-surface-variant">Recipient / Target</span>
                <span className="font-semibold text-on-surface">
                  {mode === 'send'
                    ? toEmail
                    : mode === 'till'
                    ? `Till: ${tillNumber}`
                    : mode === 'paybill'
                    ? `Paybill: ${paybillNumber} (Acc: ${accountNumber})`
                    : toEmail}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-on-surface-variant">Fee</span>
                <span className="font-bold text-secondary">KES 0.00 (Free)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isLoading}
                className="flex-1 py-3 rounded-full bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                disabled={isLoading}
                className="flex-1 py-3 rounded-full bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Authorize & Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransferPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-on-surface-variant">Loading Pay & Transfer...</div>}>
      <TransferContent />
    </Suspense>
  );
}
