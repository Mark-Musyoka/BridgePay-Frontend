'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await requestPasswordReset({ email });
    } finally {
      // Always show the same success state, whether or not the email is
      // registered — the backend itself returns an identical response
      // either way, specifically to avoid confirming which emails exist.
      setIsLoading(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <Card glass className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-4 py-9 text-center">
          <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
            <Icons.Mail className="w-6 h-6 text-on-secondary-container" />
          </div>
          <h1 className="text-lg font-bold text-on-surface">Check your inbox</h1>
          <p className="text-sm text-on-surface-variant">
            If an account exists for {email}, a password reset link has been sent to it.
          </p>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Back to login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card glass className="w-full max-w-sm">
      <CardContent className="flex flex-col gap-5 py-7">
        <div className="text-center">
          <h1 className="text-xl font-bold text-on-surface">Forgot your password?</h1>
          <p className="text-sm text-on-surface-variant mt-1">We&apos;ll email you a link to reset it.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            leftIcon={<Icons.Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" isLoading={isLoading} className="w-full mt-1">
            Send reset link
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
