'use client';

import React, { useState } from 'react';
import { api, ApiRequestError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';

/**
 * Shown on /transfer and /payout — both are gated server-side by the
 * backend's get_current_verified_user dependency, which returns 403
 * ("Email verification required before sending money") for an
 * unverified user. Rendered proactively whenever `user.is_verified` is
 * false (so the visitor never has to submit the form just to discover
 * this), and can also be used to replace a caught 403's generic error
 * text with this same, clearer prompt.
 */
export function VerificationRequiredBanner() {
  const { showToast } = useToast();
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await api.resendVerification();
      showToast('Verification email sent — check your inbox.', 'success');
    } catch (err) {
      showToast(
        err instanceof ApiRequestError && err.status === 400
          ? 'Your email is already verified — try refreshing the page.'
          : 'Could not resend the email. Try again shortly.',
        'error',
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-tertiary-fixed border border-outline-variant">
      <Icons.AlertCircle className="w-5 h-5 text-on-tertiary-fixed shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-on-tertiary-fixed">Verify your email to send money</p>
        <p className="text-xs text-on-tertiary-fixed/80 mt-0.5">
          Sending funds is disabled until your email address is confirmed. Deposits and receiving transfers still
          work as normal.
        </p>
        <Button variant="outline" size="sm" className="mt-3" onClick={handleResend} isLoading={isResending}>
          Resend verification email
        </Button>
      </div>
    </div>
  );
}
