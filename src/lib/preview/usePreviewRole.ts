'use client';

import { useSyncExternalStore } from 'react';
import { getPreviewRole, subscribePreview, type PreviewRole } from './session';

/** Reactive read of the current preview role (null when not in preview). Server/hydration snapshot is always null. */
export function usePreviewRole(): PreviewRole | null {
  return useSyncExternalStore(subscribePreview, getPreviewRole, () => null);
}
