'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getCountries, API_URL } from '@/lib/api';
import { Icons } from '@/components/ui/Icons';
import type { Country } from '@/types';

// Same local field styling as /login — see the note there.
const fieldClass =
  'w-full bg-white border border-black/10 text-[#14151A] placeholder:text-[#14151A]/35 rounded-xl px-4 py-2.5 pl-10 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/40 focus:border-[#FF6B4A] disabled:opacity-50';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesError, setCountriesError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = () => {
    getCountries()
      .then(setCountries)
      .catch(() => {
        // Most likely cause: the backend isn't running locally, or
        // NEXT_PUBLIC_API_URL in .env.local doesn't point at it. See
        // README's Setup section.
        setCountriesError(true);
      });
  };

  const retryCountries = () => {
    setCountriesError(false);
    fetchCountries();
  };

  useEffect(fetchCountries, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

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
    <div className="w-full max-w-sm rounded-[28px] bg-[#FAF9F6] border border-black/[0.06] shadow-[0_20px_60px_-15px_rgba(20,21,26,0.15)] p-7 sm:p-8">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#14151A]">Create your account</h1>
        <p className="text-sm text-[#14151A]/55 mt-1.5">Start sending and receiving money</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-7">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-[#14151A]/50">
            Full name
          </label>
          <div className="relative flex items-center">
            <Icons.User className="w-4 h-4 absolute left-3.5 text-[#14151A]/40 pointer-events-none" />
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              className={fieldClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#14151A]/50">
            Email
          </label>
          <div className="relative flex items-center">
            <Icons.Mail className="w-4 h-4 absolute left-3.5 text-[#14151A]/40 pointer-events-none" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={fieldClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#14151A]/50">
            Password
          </label>
          <div className="relative flex items-center">
            <Icons.Lock className="w-4 h-4 absolute left-3.5 text-[#14151A]/40 pointer-events-none" />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-[#14151A]/50">
            Confirm password
          </label>
          <div className="relative flex items-center">
            <Icons.Lock className="w-4 h-4 absolute left-3.5 text-[#14151A]/40 pointer-events-none" />
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
        </div>

        <div className="w-full flex flex-col gap-1.5">
          <label htmlFor="country" className="text-xs font-semibold uppercase tracking-wider text-[#14151A]/50">
            Country
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            disabled={countries.length === 0}
            className="w-full bg-white border border-black/10 text-[#14151A] rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/40 focus:border-[#FF6B4A] disabled:opacity-50"
          >
            <option value="" disabled>
              {countries.length === 0 ? 'Loading countries...' : 'Select your country'}
            </option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          {countriesError && (
            <p className="text-xs text-[#D64545] flex items-center gap-1.5">
              Couldn&apos;t load the country list — is the backend running?
              <button type="button" onClick={retryCountries} className="underline font-medium">
                Retry
              </button>
            </p>
          )}
        </div>

        {error && <p className="text-xs text-[#D64545]">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-1 py-3 rounded-full bg-[#14151A] text-[#FAF9F6] font-semibold text-sm hover:bg-[#14151A]/85 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-black/[0.08] flex-1" />
        <span className="text-xs text-[#14151A]/40">or</span>
        <div className="h-px bg-black/[0.08] flex-1" />
      </div>

      <button
        type="button"
        className="w-full py-3 rounded-full border border-black/10 text-[#14151A] font-semibold text-sm hover:bg-black/[0.03] active:scale-[0.98] transition-all"
        onClick={() => {
          showToast('Redirecting to Google...', 'info');
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full-page redirect to the backend, an external origin, not an internal Next.js route
          window.location.href = `${API_URL}/api/v1/auth/google/login`;
        }}
      >
        Sign up with Google
      </button>

      <p className="text-center text-sm text-[#14151A]/55 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-[#FF6B4A] hover:opacity-80 font-semibold">
          Log in
        </Link>
      </p>
    </div>
  );
}
