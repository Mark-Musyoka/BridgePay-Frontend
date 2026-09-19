'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPasswordReset, ApiRequestError } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('This reset link is missing its token. Request a new one.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset({ token, new_password: newPassword });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? 'This reset link is invalid or has expired.'
          : 'Something went wrong. Try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card glass className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-4 py-9 text-center">
          <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
            <Icons.CheckCircle className="w-6 h-6 text-on-secondary-container" />
          </div>
          <h1 className="text-lg font-bold text-on-surface">Password reset</h1>
          <p className="text-sm text-on-surface-variant">
            Your password has been changed. Any other devices you were logged in on have been signed out.
          </p>
          <Button className="w-full" onClick={() => router.push('/login')}>
            Log in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card glass className="w-full max-w-sm">
      <CardContent className="flex flex-col gap-5 py-7">
        <div className="text-center">
          <h1 className="text-xl font-bold text-on-surface">Reset your password</h1>
          <p className="text-sm text-on-surface-variant mt-1">Choose a new password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            leftIcon={<Icons.Lock className="w-4 h-4" />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            leftIcon={<Icons.Lock className="w-4 h-4" />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={error ?? undefined}
            minLength={8}
            required
          />

          <Button type="submit" isLoading={isLoading} className="w-full mt-1">
            Reset password
          </Button>
        </form>

        <p className="text-center text-sm text-on-surface-variant">
          <Link href="/login" className="text-primary hover:opacity-80 font-medium">
            Back to login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
