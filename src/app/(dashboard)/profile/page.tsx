'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api, ApiRequestError, getCountries } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icons';
import { formatDate, getInitials, truncateHash } from '@/lib/utils';
import type { Country } from '@/types';

// Rails a linked-payment-methods section would eventually manage. Kept
// as a plain list here (not fetched) since there's no backend endpoint
// for a user's linked methods yet — see the note on that section below.
const RAILS = ['M-Pesa', 'Airtel Money', 'Visa / Mastercard', 'Bank account'];

export default function ProfilePage() {
  const { user, account, logout } = useAuth();
  const { showToast } = useToast();

  const [countryName, setCountryName] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!user?.country) return;
    let cancelled = false;
    getCountries()
      .then((countries: Country[]) => {
        if (cancelled) return;
        setCountryName(countries.find((c) => c.code === user.country)?.name ?? user.country);
      })
      .catch(() => {
        if (!cancelled) setCountryName(user.country);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.country]);

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

  // No POST /users/me/change-password endpoint exists on the backend yet
  // (see PLAN.md's /profile row) — this form is real UI, wired to a
  // clear "not connected yet" message rather than either doing nothing
  // silently or pretending to succeed, matching this codebase's existing
  // convention (see api.ts's note on getTransactionById/flagTransaction).
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Password changes need a backend endpoint that does not exist yet.', 'info');
  };

  const handleAddPaymentMethod = () => {
    showToast('Linked payment methods need a backend endpoint that does not exist yet.', 'info');
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

      {/* Overview */}
      <Card>
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

            {!user.is_verified && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleResendVerification}
                isLoading={isResending}
                leftIcon={<Icons.Mail className="w-3.5 h-3.5" />}
              >
                Resend verification email
              </Button>
            )}
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
      </Card>

      {/* Linked payment methods — UI-ready, not yet wired to a backend */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Linked payment methods</CardTitle>
            <CardDescription>The rails you can deposit and withdraw with.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddPaymentMethod} leftIcon={<Icons.Plus className="w-3.5 h-3.5" />}>
            Add method
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {RAILS.map((rail) => (
            <div
              key={rail}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <Icons.CreditCard className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-on-surface">{rail}</span>
              </div>
              <span className="text-xs text-on-surface-variant">Not linked</span>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-on-surface-variant">
            Deposits and payouts already work per-transaction on the Deposit and Payout pages — this section is for
            saving a method for reuse, once a backend endpoint exists for it.
          </p>
        </CardFooter>
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
            />
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" size="sm">
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
    </div>
  );
}
