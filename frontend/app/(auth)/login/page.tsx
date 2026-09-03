'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      showToast('Karibu tena! Welcome back to BridgePay.', 'success');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'user' | 'admin') => {
    setError('');
    setIsLoading(true);
    try {
      await demoLogin(role);
      showToast(`Logged in as demo ${role}`, 'success');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-3xl bg-surface-container-lowest p-6 sm:p-8 shadow-sm border border-surface-container space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img
              alt="BridgePay Logo"
              className="h-9 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1UuYLrtNUQ9YxvXoxF5bu2PtJz2skRpoRmqVqM6CQ6JiWzdkZaT94902xTNXlFLXJoafGYHG1vKU7l1J_Bid-l0vQnpg7tgExHlzX1So54A15ePTWO9gMD447bCu8M5u0KiieCUOQvk_NaGUDBM6oeJWYSVEy61apHckg2rOao-SyX8Y4li0Z7sdPDaSjKXM4V90y1SUCb_nc3ne2yRnmlP9fvpQTwaxCo55NB875CrE-yaoANoHY_GfYCq"
            />
            <span className="font-extrabold text-2xl text-primary tracking-tight">BridgePay</span>
          </div>
          <h2 className="text-lg font-bold text-on-surface">Sign in to your Wallet</h2>
          <p className="text-xs text-on-surface-variant">
            Seamless P2P payments, Lipa na Till, and Paybill
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
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-container rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo */}
        <div className="pt-2 border-t border-surface-container space-y-2.5">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span>Fast Testing:</span>
            <span className="text-[10px] text-secondary font-bold uppercase">1-Click Login</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('user')}
              disabled={isLoading}
              className="py-2 px-3 rounded-xl bg-surface-container text-primary font-bold text-xs hover:bg-surface-container-high transition-colors"
            >
              Demo (Zawadi)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={isLoading}
              className="py-2 px-3 rounded-xl bg-surface-container text-primary font-bold text-xs hover:bg-surface-container-high transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-on-surface-variant pt-1">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold text-primary hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
