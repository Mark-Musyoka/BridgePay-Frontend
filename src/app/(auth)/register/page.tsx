'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getCountries } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import type { Country } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch(() => {
        // Non-fatal — the dropdown just stays empty and registration
        // will fail server-side with a clear validation error if the
        // user submits without a country.
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await registerUser({ email, password, full_name: fullName, country });
      router.push('/verify-email');
    } catch {
      setError('Could not create your account. That email may already be registered.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card glass className="w-full max-w-sm">
      <CardContent className="flex flex-col gap-5 py-7">
        <div className="text-center">
          <h1 className="text-xl font-bold text-on-surface">Create your account</h1>
          <p className="text-sm text-on-surface-variant mt-1">Start sending and receiving money</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full name"
            type="text"
            autoComplete="name"
            leftIcon={<Icons.User className="w-4 h-4" />}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            leftIcon={<Icons.Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            leftIcon={<Icons.Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          <div className="w-full flex flex-col gap-1.5">
            <label htmlFor="country" className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Country
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary disabled:opacity-50"
            >
              <option value="" disabled>
                Select your country
              </option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <Button type="submit" isLoading={isLoading} className="w-full mt-1">
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:opacity-80 font-medium">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
