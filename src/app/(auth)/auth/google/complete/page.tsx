'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';

export default function GoogleOAuthCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, refreshAccount } = useAuth();

  const [status, setStatus] = useState<'exchanging' | 'error'>('exchanging');

  useEffect(() => {
    const code = searchParams.get('code');

    const exchange = code
      ? fetch('/api/auth/google/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        }).then((res) => {
          if (!res.ok) throw new Error('exchange failed');
        })
      : Promise.reject(new Error('missing code'));

    exchange
      .then(() => Promise.all([refreshUser(), refreshAccount()]))
      .then(() => router.push('/dashboard'))
      .catch(() => setStatus('error'));
    // Deliberately runs once on mount — the handoff code is single-use,
    // so re-running this on a dependency change would just fail the
    // second time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'error') {
    return (
      <Card glass className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-4 py-9 text-center">
          <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
            <Icons.AlertCircle className="w-6 h-6 text-on-error-container" />
          </div>
          <h1 className="text-lg font-bold text-on-surface">Sign-in failed</h1>
          <p className="text-sm text-on-surface-variant">
            That Google sign-in link is invalid or has expired. Try signing in again.
          </p>
          <Link href="/login" className="w-full">
            <Button className="w-full">Back to login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card glass className="w-full max-w-sm">
      <CardContent className="flex flex-col items-center gap-4 py-9 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center animate-pulse">
          <Icons.Wallet className="w-6 h-6 text-on-surface-variant" />
        </div>
        <p className="text-sm text-on-surface-variant">Finishing sign-in...</p>
      </CardContent>
    </Card>
  );
}
