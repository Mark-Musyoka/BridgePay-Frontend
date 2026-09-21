'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '@/context/AuthContext';
import { api, ApiRequestError } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { formatCurrency } from '@/lib/utils';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type Method = 'card' | 'mpesa' | 'airtel';

const METHODS: { id: Method; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'card', label: 'Card', icon: Icons.CreditCard },
  { id: 'mpesa', label: 'M-Pesa', icon: Icons.Wallet },
  { id: 'airtel', label: 'Airtel Money', icon: Icons.Wallet },
];

function StripeCardForm({
  clientSecret,
  amount,
  onSuccess,
}: {
  clientSecret: string;
  amount: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const result = await stripe
      .confirmCardPayment(clientSecret, { payment_method: { card: cardElement } })
      .catch((err) => ({ error: err }));

    if ('error' in result && result.error) {
      setError(result.error.message ?? 'Your card was declined.');
      setIsSubmitting(false);
      return;
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="p-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest">
        <CardElement
          options={{
            style: {
              base: { fontSize: '14px', color: '#131b2e', '::placeholder': { color: '#444651' } },
            },
          }}
        />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      <Button type="submit" isLoading={isSubmitting} disabled={!stripe} className="w-full">
        Deposit {formatCurrency(amount || '0', 'USD')}
      </Button>
    </form>
  );
}

export default function DepositPage() {
  const { account, refreshAccount } = useAuth();
  const [method, setMethod] = useState<Method | null>(null);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitingMessage, setWaitingMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const numericAmount = parseFloat(amount);
  const isValidAmount = !isNaN(numericAmount) && numericAmount > 0;

  const handleStartCardDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAmount) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.createStripeDeposit({ amount: numericAmount, currency: 'usd' });
      setClientSecret(res.client_secret);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not start this deposit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMobileMoneyDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAmount || !phone) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res =
        method === 'mpesa'
          ? await api.createMpesaDeposit({ phone_number: phone, amount: numericAmount })
          : await api.createAirtelDeposit({ phone_number: phone, amount: numericAmount });
      setWaitingMessage(res.message);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not start this deposit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-md mx-auto p-8 flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center">
          <Icons.CheckCircle className="w-7 h-7 text-on-secondary-container" />
        </div>
        <h1 className="text-lg font-bold text-on-surface">Deposit successful</h1>
        <p className="text-sm text-on-surface-variant">Your balance has been updated.</p>
        <Button
          className="w-full mt-2"
          onClick={() => {
            setMethod(null);
            setAmount('');
            setClientSecret(null);
            setSuccess(false);
          }}
        >
          Make another deposit
        </Button>
      </Card>
    );
  }

  if (waitingMessage) {
    return (
      <Card className="max-w-md mx-auto p-8 flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center animate-pulse">
          <Icons.Wallet className="w-7 h-7 text-on-primary-fixed" />
        </div>
        <h1 className="text-lg font-bold text-on-surface">Check your phone</h1>
        <p className="text-sm text-on-surface-variant">{waitingMessage}</p>
        <p className="text-xs text-on-surface-variant">
          Your balance will update automatically once the payment is confirmed — check{' '}
          <a href="/notifications" className="text-primary hover:opacity-80">
            Notifications
          </a>{' '}
          or your recent activity.
        </p>
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => {
            setMethod(null);
            setAmount('');
            setPhone('');
            setWaitingMessage(null);
            refreshAccount();
          }}
        >
          Done
        </Button>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="flex flex-col gap-5 py-7">
        <div className="text-center">
          <h1 className="text-lg font-bold text-on-surface">Deposit</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {account ? `Current balance: ${formatCurrency(account.balance, account.currency)}` : 'Add money to your wallet'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setMethod(m.id);
                  setError(null);
                }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-colors ${
                  method === m.id
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:border-outline'
                }`}
              >
                <Icon className="w-5 h-5" />
                {m.label}
              </button>
            );
          })}
        </div>

        {method === 'card' && !clientSecret && (
          <form onSubmit={handleStartCardDeposit} className="flex flex-col gap-4">
            <Input
              label="Amount (USD)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {error && <p className="text-xs text-error">{error}</p>}
            <Button type="submit" isLoading={isSubmitting} disabled={!isValidAmount} className="w-full">
              Continue
            </Button>
          </form>
        )}

        {method === 'card' && clientSecret && stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripeCardForm clientSecret={clientSecret} amount={amount} onSuccess={() => setSuccess(true)} />
          </Elements>
        )}

        {method === 'card' && clientSecret && !stripePromise && (
          <p className="text-xs text-error">
            Stripe isn&apos;t configured — set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local.
          </p>
        )}

        {(method === 'mpesa' || method === 'airtel') && (
          <form onSubmit={handleMobileMoneyDeposit} className="flex flex-col gap-4">
            <Input
              label="Phone number"
              type="tel"
              placeholder="0712345678"
              leftIcon={<Icons.Send className="w-4 h-4" />}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Amount (KES)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {error && <p className="text-xs text-error">{error}</p>}
            <Button type="submit" isLoading={isSubmitting} disabled={!isValidAmount || !phone} className="w-full">
              Send payment request
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
