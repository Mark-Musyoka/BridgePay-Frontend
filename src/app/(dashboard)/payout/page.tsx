'use client';

import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '@/context/AuthContext';
import { api, ApiRequestError, getCountries } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { formatCurrency } from '@/lib/utils';
import type { Country } from '@/types';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type Method = 'mpesa' | 'airtel' | 'card' | 'bank';

const METHODS: { id: Method; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'mpesa', label: 'M-Pesa', icon: Icons.Wallet },
  { id: 'airtel', label: 'Airtel Money', icon: Icons.Wallet },
  { id: 'card', label: 'Card', icon: Icons.CreditCard },
  { id: 'bank', label: 'Bank account', icon: Icons.ArrowUpRight },
];

function StripeCardPayoutForm({
  amount,
  recipientEmail,
  onSuccess,
  onError,
}: {
  amount: string;
  recipientEmail: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setIsSubmitting(true);
    const { token, error } = await stripe.createToken(cardElement);

    if (error || !token) {
      onError(error?.message ?? 'Could not process that card.');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.createStripeCardPayout({
        card_token: token.id,
        recipient_email: recipientEmail,
        amount: parseFloat(amount),
        currency: 'usd',
      });
      onSuccess();
    } catch (err) {
      onError(err instanceof ApiRequestError ? err.message : 'Could not complete this payout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="p-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest">
        <CardElement
          options={{ style: { base: { fontSize: '14px', color: '#131b2e', '::placeholder': { color: '#444651' } } } }}
        />
      </div>
      <Button type="submit" isLoading={isSubmitting} disabled={!stripe} className="w-full">
        Send {formatCurrency(amount || '0', 'USD')}
      </Button>
    </form>
  );
}

function StripeBankPayoutForm({
  amount,
  recipientEmail,
  country,
  onSuccess,
  onError,
}: {
  amount: string;
  recipientEmail: string;
  country: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe) return;

    setIsSubmitting(true);
    // Stripe's classic Token API for bank accounts — the exact fields
    // it actually requires vary by country; account_number +
    // routing_number covers the common case, per Stripe's own docs.
    const { token, error } = await stripe.createToken('bank_account', {
      country,
      currency: 'usd',
      account_holder_name: accountHolderName,
      account_holder_type: 'individual',
      account_number: accountNumber,
      routing_number: routingNumber || undefined,
    });

    if (error || !token) {
      onError(error?.message ?? 'Could not verify those bank details.');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.createBankAccountPayout({
        bank_account_token: token.id,
        country,
        recipient_email: recipientEmail,
        amount: parseFloat(amount),
        currency: 'usd',
      });
      onSuccess();
    } catch (err) {
      onError(err instanceof ApiRequestError ? err.message : 'Could not complete this payout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Account holder name"
        value={accountHolderName}
        onChange={(e) => setAccountHolderName(e.target.value)}
        required
      />
      <Input
        label="Account number"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
        required
      />
      <Input
        label={country === 'KE' ? 'Bank code' : 'Routing number'}
        value={routingNumber}
        onChange={(e) => setRoutingNumber(e.target.value)}
      />
      <Button type="submit" isLoading={isSubmitting} disabled={!stripe} className="w-full">
        Send {formatCurrency(amount || '0', 'USD')}
      </Button>
    </form>
  );
}

export default function PayoutPage() {
  const { account } = useAuth();
  const [method, setMethod] = useState<Method | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('KE');
  const [countries, setCountries] = useState<Country[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch(() => {
        // Non-fatal — the country field falls back to a plain text
        // input via the KE/routing-number heuristic already in place.
      });
  }, []);

  const numericAmount = parseFloat(amount);
  const isValidAmount = !isNaN(numericAmount) && numericAmount > 0;
  const canSubmitMobileMoney = isValidAmount && !!phone && !!recipientEmail;

  const handleMobileMoneyPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitMobileMoney) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (method === 'mpesa') {
        await api.createMpesaPayout({ phone_number: phone, recipient_email: recipientEmail, amount: numericAmount });
      } else {
        await api.createAirtelPayout({ phone_number: phone, recipient_email: recipientEmail, amount: numericAmount });
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not complete this payout.');
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
        <h1 className="text-lg font-bold text-on-surface">Payout sent</h1>
        <p className="text-sm text-on-surface-variant">
          {formatCurrency(amount || '0', account?.currency ?? 'KES')} is on its way to {recipientEmail}.
        </p>
        <Button
          className="w-full mt-2"
          onClick={() => {
            setMethod(null);
            setAmount('');
            setPhone('');
            setRecipientEmail('');
            setSuccess(false);
          }}
        >
          Make another payout
        </Button>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="flex flex-col gap-5 py-7">
        <div className="text-center">
          <h1 className="text-lg font-bold text-on-surface">Payout</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {account ? `Available balance: ${formatCurrency(account.balance, account.currency)}` : 'Send funds externally'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setMethod(m.id);
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-colors ${
                  method === m.id
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:border-outline'
                }`}
              >
                <Icon className="w-4 h-4" />
                {m.label}
              </button>
            );
          })}
        </div>

        {method && (
          <Input
            label="Recipient email"
            type="email"
            placeholder="name@example.com"
            leftIcon={<Icons.Mail className="w-4 h-4" />}
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            helperText="Required for confirmation, whatever the destination"
            required
          />
        )}

        {(method === 'mpesa' || method === 'airtel') && (
          <form onSubmit={handleMobileMoneyPayout} className="flex flex-col gap-4">
            <Input
              label="Recipient phone number"
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
            <Button type="submit" isLoading={isSubmitting} disabled={!canSubmitMobileMoney} className="w-full">
              Send payout
            </Button>
          </form>
        )}

        {method === 'card' && recipientEmail && stripePromise && (
          <div className="flex flex-col gap-4">
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
            {isValidAmount && (
              <Elements stripe={stripePromise}>
                <StripeCardPayoutForm
                  amount={amount}
                  recipientEmail={recipientEmail}
                  onSuccess={() => setSuccess(true)}
                  onError={setError}
                />
              </Elements>
            )}
          </div>
        )}

        {method === 'bank' && recipientEmail && stripePromise && (
          <div className="flex flex-col gap-4">
            <div className="w-full flex flex-col gap-1.5">
              <label htmlFor="payout-country" className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Country
              </label>
              <select
                id="payout-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary"
              >
                {countries.length === 0 ? (
                  <option value="KE">Kenya</option>
                ) : (
                  countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
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
            {isValidAmount && (
              <Elements stripe={stripePromise}>
                <StripeBankPayoutForm
                  amount={amount}
                  recipientEmail={recipientEmail}
                  country={country}
                  onSuccess={() => setSuccess(true)}
                  onError={setError}
                />
              </Elements>
            )}
          </div>
        )}

        {(method === 'card' || method === 'bank') && !stripePromise && (
          <p className="text-xs text-error">
            Stripe isn&apos;t configured — set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
