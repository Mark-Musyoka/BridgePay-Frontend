'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Icons } from '@/components/ui/Icons';
import { API_URL } from '@/lib/api';

// Local field styling matches the home page's editorial palette
// (charcoal / warm white / coral) rather than the app's Material
// tokens — this page and /register are public-facing, same as "/",
// while the authenticated dashboard keeps its existing Material style.
const fieldClass =
  'w-full bg-white border border-black/10 text-[#14151A] placeholder:text-[#14151A]/35 rounded-xl px-4 py-2.5 pl-10 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/40 focus:border-[#FF6B4A]';

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
    <div className="w-full max-w-sm rounded-[28px] bg-[#FAF9F6] border border-black/[0.06] shadow-[0_20px_60px_-15px_rgba(20,21,26,0.15)] p-7 sm:p-8">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#14151A]">Welcome back</h1>
        <p className="text-sm text-[#14151A]/55 mt-1.5">Log in to your BridgePay account</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-7">
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
              autoComplete="current-password"
              className={fieldClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-xs text-[#D64545] mt-0.5">{error}</p>}
          <Link href="/forgot-password" className="self-end text-xs text-[#14151A]/55 hover:text-[#FF6B4A] transition-colors">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-1 py-3 rounded-full bg-[#14151A] text-[#FAF9F6] font-semibold text-sm hover:bg-[#14151A]/85 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {isLoading ? 'Logging in...' : 'Log in'}
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
        Continue with Google
      </button>

      <p className="text-center text-sm text-[#14151A]/55 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[#FF6B4A] hover:opacity-80 font-semibold">
          Register
        </Link>
      </p>
    </div>
  );
}
