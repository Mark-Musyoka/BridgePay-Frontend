'use client';

import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api, ApiRequestError, getCountries } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Icons } from '@/components/ui/Icons';
import { formatDate, getInitials, truncateHash } from '@/lib/utils';
import type { Country, PaymentMethod } from '@/types';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function StripeCardLinkForm({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: (pmId: string) => void }) {
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

    let result;
    try {
      result = await stripe.confirmCardSetup(clientSecret, { payment_method: { card: cardElement } });
    } catch {
      setError('Something went wrong verifying that card.');
      setIsSubmitting(false);
      return;
    }

    if (result.error) {
      setError(result.error.message ?? 'Could not verify that card.');
      setIsSubmitting(false);
      return;
    }

    const pmId = result.setupIntent?.payment_method;
    if (typeof pmId !== 'string') {
      setError('Something went wrong confirming the card.');
      setIsSubmitting(false);
      return;
    }
    onSuccess(pmId);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="p-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest">
        <CardElement
          options={{ style: { base: { fontSize: '14px', color: '#131b2e', '::placeholder': { color: '#444651' } } } }}
        />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      <Button type="submit" isLoading={isSubmitting} disabled={!stripe} className="w-full">
        Link card
      </Button>
    </form>
  );
}

export default function ProfilePage() {
  const { user, account, logout, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [countries, setCountries] = useState<Country[]>([]);
  const [isResending, setIsResending] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Payment methods
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);
  const [addModalTab, setAddModalTab] = useState<'mpesa' | 'card' | null>(null);
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [isLinkingMpesa, setIsLinkingMpesa] = useState(false);
  const [cardClientSecret, setCardClientSecret] = useState<string | null>(null);
  const [isStartingCardLink, setIsStartingCardLink] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch(() => {});
  }, []);

  const countryName = user?.country
    ? countries.find((c) => c.code === user.country)?.name ?? user.country
    : null;

  const fetchMethods = () =>
    api
      .getPaymentMethods()
      .then(setMethods)
      .catch(() => showToast('Could not load your linked payment methods.', 'error'))
      .finally(() => setIsLoadingMethods(false));

  const loadMethods = () => {
    setIsLoadingMethods(true);
    fetchMethods();
  };

  useEffect(() => {
    fetchMethods();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startEditing = () => {
    if (!user) return;
    setEditName(user.full_name);
    setEditEmail(user.email);
    setEditCountry(user.country ?? '');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await api.updateProfile({ full_name: editName, email: editEmail, country: editCountry || undefined });
      await refreshUser();
      showToast('Profile updated.', 'success');
      setIsEditing(false);
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : 'Could not update your profile.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await api.resendVerification();
      showToast('Verification email sent — check your inbox.', 'success');
    } catch (err) {
      showToast(
        err instanceof ApiRequestError && err.status === 400
          ? 'Your email is already verified.'
          : 'Could not resend the email. Try again shortly.',
        'error',
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    try {
      await api.changePassword({ current_password: currentPassword, new_password: newPassword });
      showToast('Password updated.', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showToast(
        err instanceof ApiRequestError && err.status === 400
          ? 'Your current password is incorrect.'
          : 'Could not update your password.',
        'error',
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const closeAddModal = () => {
    setAddModalTab(null);
    setMpesaNumber('');
    setCardClientSecret(null);
  };

  const handleLinkMpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLinkingMpesa(true);
    try {
      await api.linkMpesa({ phone_number: mpesaNumber });
      showToast('M-Pesa number linked.', 'success');
      closeAddModal();
      loadMethods();
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : 'Could not link that number.', 'error');
    } finally {
      setIsLinkingMpesa(false);
    }
  };

  const openCardTab = async () => {
    setAddModalTab('card');
    setIsStartingCardLink(true);
    try {
      const { client_secret } = await api.createStripeSetupIntent();
      setCardClientSecret(client_secret);
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : 'Could not start card setup.', 'error');
      setAddModalTab(null);
    } finally {
      setIsStartingCardLink(false);
    }
  };

  const handleCardLinked = async (paymentMethodId: string) => {
    try {
      await api.confirmStripeCard({ payment_method_id: paymentMethodId });
      showToast('Card linked.', 'success');
      closeAddModal();
      loadMethods();
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : 'Could not save that card.', 'error');
    }
  };

  const handleRemoveMethod = async (id: string) => {
    setRemovingId(id);
    try {
      await api.deletePaymentMethod(id);
      setMethods((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : 'Could not remove that method.', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-on-surface-variant">Loading your profile...</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div>
        <h1 className="text-lg font-bold text-on-surface">Profile</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">Your account details and security settings.</p>
      </div>

      {/* Overview / edit */}
      <Card>
        {isEditing ? (
          <form onSubmit={handleSaveProfile}>
            <CardContent className="flex flex-col gap-4">
              <Input label="Full name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              <Input label="Email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Country</label>
                <select
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Not set</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSavingProfile}>
                Save
              </Button>
            </CardFooter>
          </form>
        ) : (
          <>
            <CardContent className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-lg shrink-0">
                {getInitials(user.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-on-surface truncate">{user.full_name}</h2>
                  <Badge variant={user.is_verified ? 'success' : 'warning'}>
                    {user.is_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
                <p className="text-sm text-on-surface-variant mt-0.5 truncate">{user.email}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {!user.is_verified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      isLoading={isResending}
                      leftIcon={<Icons.Mail className="w-3.5 h-3.5" />}
                    >
                      Resend verification email
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={startEditing}>
                    Edit profile
                  </Button>
                </div>
              </div>
            </CardContent>

            <div className="border-t border-outline-variant grid grid-cols-2 sm:grid-cols-4 divide-x divide-outline-variant">
              <div className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Country</p>
                <p className="text-sm font-medium text-on-surface mt-1 truncate">{countryName ?? 'Not set'}</p>
              </div>
              <div className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Currency</p>
                <p className="text-sm font-medium text-on-surface mt-1">{account?.currency ?? '—'}</p>
              </div>
              <div className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Member since</p>
                <p className="text-sm font-medium text-on-surface mt-1">{formatDate(user.created_at)}</p>
              </div>
              <div className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Account ID</p>
                <p className="text-sm font-medium text-on-surface mt-1 font-mono" title={account?.id}>
                  {account ? truncateHash(account.id, 6, 4) : '—'}
                </p>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Linked payment methods — now real */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Linked payment methods</CardTitle>
            <CardDescription>The rails you can deposit and withdraw with.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setAddModalTab('mpesa')} leftIcon={<Icons.Plus className="w-3.5 h-3.5" />}>
            Add method
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {isLoadingMethods ? (
            <p className="text-sm text-on-surface-variant py-2">Loading...</p>
          ) : methods.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-2">No payment methods linked yet.</p>
          ) : (
            methods.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
                    <Icons.CreditCard className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{m.masked_details}</p>
                    <p className="text-xs text-on-surface-variant">{m.provider === 'stripe' ? 'Card' : 'M-Pesa'}</p>
                  </div>
                  {m.is_default && <Badge variant="info" dot={false}>Default</Badge>}
                </div>
                <button
                  onClick={() => handleRemoveMethod(m.id)}
                  disabled={removingId === m.id}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors shrink-0 disabled:opacity-50"
                  aria-label={`Remove ${m.masked_details}`}
                >
                  <Icons.Close className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Change password</CardTitle>
            <CardDescription>Update the password you use to sign in.</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleChangePassword}>
          <CardContent className="flex flex-col gap-4">
            <Input
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" size="sm" isLoading={isChangingPassword}>
              Update password
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Sign out */}
      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-on-surface">Sign out</p>
            <p className="text-xs text-on-surface-variant mt-0.5">End your session on this device.</p>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout} isLoading={isLoggingOut} leftIcon={<Icons.LogOut className="w-3.5 h-3.5" />}>
            Sign out
          </Button>
        </CardContent>
      </Card>

      {/* Add payment method modal */}
      <Modal isOpen={addModalTab !== null} onClose={closeAddModal} title="Add payment method">
        <div className="flex gap-2 mb-5">
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              addModalTab === 'mpesa' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant'
            }`}
            onClick={() => setAddModalTab('mpesa')}
          >
            M-Pesa
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              addModalTab === 'card' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant'
            }`}
            onClick={openCardTab}
          >
            Card
          </button>
        </div>

        {addModalTab === 'mpesa' && (
          <form onSubmit={handleLinkMpesa} className="flex flex-col gap-4">
            <Input
              label="M-Pesa number"
              placeholder="07XX XXX XXX"
              value={mpesaNumber}
              onChange={(e) => setMpesaNumber(e.target.value)}
              required
            />
            <Button type="submit" isLoading={isLinkingMpesa} className="w-full">
              Link number
            </Button>
          </form>
        )}

        {addModalTab === 'card' &&
          (isStartingCardLink ? (
            <p className="text-sm text-on-surface-variant text-center py-6">Setting up...</p>
          ) : cardClientSecret && stripePromise ? (
            <Elements stripe={stripePromise} options={{ clientSecret: cardClientSecret }}>
              <StripeCardLinkForm clientSecret={cardClientSecret} onSuccess={handleCardLinked} />
            </Elements>
          ) : cardClientSecret && !stripePromise ? (
            <p className="text-sm text-error text-center py-6">
              Stripe isn&apos;t configured — set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local.
            </p>
          ) : null)}
      </Modal>
    </div>
  );
}
