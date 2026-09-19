'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { verifyEmail, api, ApiRequestError } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';

type State = 'checking-inbox' | 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<State>(token ? 'verifying' : 'checking-inbox');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    verifyEmail({ token })
      .then(() => setState('success'))
      .catch((err) => {
        setErrorMessage(
          err instanceof ApiRequestError ? err.message : 'This verification link is invalid or has expired.',
        );
        setState('error');
      });
  }, [token]);

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage('');
    try {
      await api.resendVerification();
      setResendMessage('A new verification email has been sent.');
    } catch (err) {
      setResendMessage(
        err instanceof ApiRequestError && err.status === 400
          ? 'Your email is already verified.'
          : 'Could not resend the email. Try again shortly.',
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card glass className="w-full max-w-sm">
      <CardContent className="flex flex-col items-center gap-4 py-9 text-center">
        {state === 'verifying' && (
          <>
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center animate-pulse">
              <Icons.Mail className="w-6 h-6 text-on-surface-variant" />
            </div>
            <p className="text-sm text-on-surface-variant">Verifying your email...</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
              <Icons.CheckCircle className="w-6 h-6 text-on-secondary-container" />
            </div>
            <h1 className="text-lg font-bold text-on-surface">Email verified</h1>
            <p className="text-sm text-on-surface-variant">You&apos;re all set. You can now send money.</p>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">Go to dashboard</Button>
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
              <Icons.AlertCircle className="w-6 h-6 text-on-error-container" />
            </div>
            <h1 className="text-lg font-bold text-on-surface">Verification failed</h1>
            <p className="text-sm text-on-surface-variant">{errorMessage}</p>
            <Button variant="outline" className="w-full" onClick={handleResend} isLoading={isResending}>
              Resend verification email
            </Button>
            {resendMessage && <p className="text-xs text-on-surface-variant">{resendMessage}</p>}
          </>
        )}

        {state === 'checking-inbox' && (
          <>
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
              <Icons.Mail className="w-6 h-6 text-on-surface-variant" />
            </div>
            <h1 className="text-lg font-bold text-on-surface">Check your inbox</h1>
            <p className="text-sm text-on-surface-variant">
              We&apos;ve sent a verification link to your email. Click it to verify your account.
            </p>
            <Button variant="outline" className="w-full" onClick={handleResend} isLoading={isResending}>
              Resend email
            </Button>
            {resendMessage && <p className="text-xs text-on-surface-variant">{resendMessage}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
