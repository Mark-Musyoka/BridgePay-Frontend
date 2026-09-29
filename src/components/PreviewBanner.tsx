'use client';

import React from 'react';
import type { PreviewRole } from '@/lib/preview/session';

/** Shown inside the dashboard while a preview session is active, so sample data can never be mistaken for real data. */
export function PreviewBanner({ role, onExit }: { role: PreviewRole; onExit: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-outline-variant bg-tertiary-fixed px-3.5 py-2.5 text-on-tertiary-fixed">
      <p className="text-xs leading-relaxed">
        <span className="font-bold">Preview mode</span> · signed in as a sample {role}. This is sample data — nothing is
        saved or sent.
      </p>
      <button type="button" onClick={onExit} className="shrink-0 text-xs font-semibold underline">
        Exit
      </button>
    </div>
  );
}
