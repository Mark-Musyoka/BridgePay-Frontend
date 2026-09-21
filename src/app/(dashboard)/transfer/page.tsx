'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api, ApiRequestError } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { formatCurrency } from '@/lib/utils';

type Step = 'form' | 'review' | 'success';

export default function TransferPage() {
  const { account, user } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [toEmail, setToEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericAmount = parseFloat(amount);
  const isValidAmount = !isNaN(numericAmount) && numericAmount > 0;

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toEmail || !isValidAmount) return;
    setStep('review');
  };

  const handleConfirm = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await api.createTransfer({ to_email: toEmail, amount: numericAmount, reference_note: note || undefined });
      setStep('success');
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : 'Could not complete this transfer. Check the recipient email and try again.',
      );
      setStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <Card className="p-8 flex flex-col items-center text-center gap-3 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center">
          <Icons.CheckCircle className="w-7 h-7 text-on-secondary-container" />
        </div>
        <h1 className="text-lg font-bold text-on-surface">Transfer sent</h1>
        <p className="text-sm text-on-surface-variant">
          {formatCurrency(numericAmount, account?.currency ?? 'KES')} sent to {toEmail}.
        </p>
        <div className="flex gap-2 w-full mt-2">
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              Dashboard
            </Button>
          </Link>
          <Button
            className="flex-1"
            onClick={() => {
              setStep('form');
              setToEmail('');
              setAmount('');
              setNote('');
            }}
          >
            Send again
          </Button>
        </div>
      </Card>
    );
  }

  if (step === 'review') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col gap-5 py-7">
          <div className="text-center">
            <h1 className="text-lg font-bold text-on-surface">Review transfer</h1>
            <p className="text-sm text-on-surface-variant mt-1">Double check before sending</p>
          </div>

          <div className="flex flex-col items-center gap-1 py-4">
            <span className="text-3xl font-extrabold font-mono text-on-surface">
              {formatCurrency(numericAmount, account?.currency ?? 'KES')}
            </span>
            <span className="text-sm text-on-surface-variant">to {toEmail}</span>
          </div>

          <div className="flex flex-col divide-y divide-outline-variant border border-outline-variant rounded-xl overflow-hidden">
            <div className="flex justify-between p-3 text-sm">
              <span className="text-on-surface-variant">From</span>
              <span className="text-on-surface font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between p-3 text-sm">
              <span className="text-on-surface-variant">Fee</span>
              <span className="text-on-surface font-medium">Free</span>
            </div>
            {note && (
              <div className="flex justify-between p-3 text-sm gap-4">
                <span className="text-on-surface-variant shrink-0">Note</span>
                <span className="text-on-surface font-medium text-right truncate">{note}</span>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-error text-center">{error}</p>}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep('form')}>
              Back
            </Button>
            <Button className="flex-1" onClick={handleConfirm} isLoading={isSubmitting}>
              Confirm & send
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="flex flex-col gap-5 py-7">
        <div className="text-center">
          <h1 className="text-lg font-bold text-on-surface">Send money</h1>
          <p className="text-sm text-on-surface-variant mt-1">Instant, free transfers to any BridgePay user</p>
        </div>

        <form onSubmit={handleReview} className="flex flex-col gap-4">
          <Input
            label="Recipient email"
            type="email"
            placeholder="name@example.com"
            leftIcon={<Icons.Mail className="w-4 h-4" />}
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            helperText="Must be a registered BridgePay user"
            required
          />

          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            leftIcon={<span className="text-sm">{account?.currency ?? 'KES'}</span>}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            helperText={account ? `Available balance: ${formatCurrency(account.balance, account.currency)}` : undefined}
            required
          />

          <Input
            label="Note (optional)"
            type="text"
            placeholder="What's this for?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {error && <p className="text-xs text-error">{error}</p>}

          <Button type="submit" className="w-full mt-1" disabled={!toEmail || !isValidAmount}>
            Review transfer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
