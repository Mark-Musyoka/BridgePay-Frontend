'use client';

import React, { useEffect, useState } from 'react';
import { api, ApiRequestError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Icons } from '@/components/ui/Icons';
import { formatDate } from '@/lib/utils';
import type { Notification, NotificationType } from '@/types';

const TYPE_ICON: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  transfer_sent: Icons.Send,
  transfer_received: Icons.ArrowDownLeft,
  deposit_completed: Icons.ArrowDownLeft,
  deposit_failed: Icons.AlertCircle,
  payout_sent: Icons.ArrowUpRight,
  payout_failed: Icons.AlertCircle,
  payout_reversed: Icons.AlertCircle,
  security_alert: Icons.Shield,
  account_update: Icons.User,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const load = () => {
    api
      .getNotifications({ page: 1, page_size: 50 })
      .then((res) => setNotifications(res.items))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : 'Could not load notifications.'));
  };

  useEffect(load, []);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev?.map((n) => (n.id === id ? { ...n, is_read: true } : n)) ?? null);
    try {
      await api.markNotificationRead(id);
    } catch {
      load(); // out of sync with the server — just refetch
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev?.map((n) => ({ ...n, is_read: true })) ?? null);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const hasUnread = notifications?.some((n) => !n.is_read) ?? false;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold text-on-surface">Notifications</h1>
        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="text-xs font-medium text-primary hover:opacity-80 disabled:opacity-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      {!notifications && !error && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {notifications && notifications.length === 0 && (
        <Card className="p-8 text-center">
          <Icons.Shield className="w-8 h-8 text-on-surface-variant/50 mx-auto mb-3" />
          <p className="text-sm text-on-surface-variant">You have no notifications yet.</p>
        </Card>
      )}

      {notifications && notifications.length > 0 && (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => {
            const Icon = TYPE_ICON[n.type] ?? Icons.Shield;
            return (
              <button
                key={n.id}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border transition-colors ${
                  n.is_read
                    ? 'bg-surface-container-lowest border-outline-variant/60'
                    : 'bg-surface-container-low border-outline-variant hover:border-outline'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-on-surface-variant" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface">{n.body}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{formatDate(n.created_at)}</p>
                </div>
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
