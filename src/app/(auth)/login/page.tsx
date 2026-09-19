'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { API_URL } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch {
      setError('Incorrect email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card glass className="w-full max-w-sm">
      <CardContent className="flex flex-col gap-5 py-7">
        <div className="text-center">
          <h1 className="text-xl font-bold text-on-surface">Welcome back</h1>
          <p className="text-sm text-on-surface-variant mt-1">Log in to your BridgePay account</p>
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
          <div className="flex flex-col gap-1.5">
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              leftIcon={<Icons.Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error ?? undefined}
              required
            />
            <Link href="/forgot-password" className="self-end text-xs text-primary hover:opacity-80">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full mt-1">
            Log in
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px bg-outline-variant flex-1" />
          <span className="text-xs text-on-surface-variant">or</span>
          <div className="h-px bg-outline-variant flex-1" />
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            showToast('Redirecting to Google...', 'info');
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- this is a full-page redirect to the backend, an external origin, not an internal Next.js route
            window.location.href = `${API_URL}/api/v1/auth/google/login`;
          }}
        >
          Continue with Google
        </Button>

        <p className="text-center text-sm text-on-surface-variant">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:opacity-80 font-medium">
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
