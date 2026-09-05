'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { registerUser } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await registerUser({
        full_name: fullName,
        email,
        password,
      });
      showToast('Karibu BridgePay! Your KES digital wallet is ready.', 'success');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-3xl bg-surface-container-lowest p-6 sm:p-8 shadow-sm border border-surface-container space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img
              alt="BridgePay Logo"
              className="h-9 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1UuYLrtNUQ9YxvXoxF5bu2PtJz2skRpoRmqVqM6CQ6JiWzdkZaT94902xTNXlFLXJoafGYHG1vKU7l1J_Bid-l0vQnpg7tgExHlzX1So54A15ePTWO9gMD447bCu8M5u0KiieCUOQvk_NaGUDBM6oeJWYSVEy61apHckg2rOao-SyX8Y4li0Z7sdPDaSjKXM4V90y1SUCb_nc3ne2yRnmlP9fvpQTwaxCo55NB875CrE-yaoANoHY_GfYCq"
            />
            <span className="font-extrabold text-2xl text-primary tracking-tight">BridgePay</span>
          </div>
          <h2 className="text-lg font-bold text-on-surface">Create your Account</h2>
          <p className="text-xs text-on-surface-variant">
            Instant KES peer-to-peer wallet and remittance
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Zawadi Mwangi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-container rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Email or Mobile
            </label>
            <input
              type="email"
              placeholder="e.g. zawadi@bridgepay.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-container rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-container rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-container rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-full bg-secondary text-on-secondary font-bold text-sm shadow-md hover:bg-secondary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? 'Creating Wallet...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-on-surface-variant pt-1 border-t border-surface-container">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
