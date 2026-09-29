/**
 * Sample backend for preview mode (see session.ts for what that is and
 * why it's opt-in). Answers this app's own /api/* routes from in-memory
 * fixtures, with the same response shapes and the same error cases the
 * real API produces, so pages can be exercised end to end with no
 * backend running.
 *
 * State lives in module memory: actions taken in preview (a transfer, a
 * profile edit, a linked M-Pesa number) persist while the tab stays
 * open and reset on a full page reload. Anything that genuinely needs
 * an external provider (Stripe cards, bank accounts) is answered with an
 * honest 501 rather than a fake success.
 */

import type {
  Account,
  Country,
  Notification,
  PaymentMethod,
  Payout,
  Transaction,
  User,
} from '@/types';
import type { PreviewRole } from './session';

// ─── Helpers ────────────────────────────────────────────────────────

const SAMPLE_PASSWORD = 'DemoPass123!';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
const noContent = () => new Response(null, { status: 204 });
const fail = (status: number, detail: string) => json({ detail }, status);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const hex = (n: number) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('');
const fakeUuid = () => `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;

const daysAgo = (days: number, hour = 10, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const kes = (n: number) =>
  `KES ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function readBody(init?: RequestInit): Record<string, unknown> {
  if (typeof init?.body !== 'string') return {};
  try {
    const parsed = JSON.parse(init.body);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function paginate<T>(items: T[], params: URLSearchParams) {
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(params.get('page_size')) || 20));
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, page_size: pageSize };
}

// ─── Sample countries (the real list has ~249; this is enough to exercise the UI) ───

export const PREVIEW_COUNTRIES: Country[] = [
  { code: 'KE', name: 'Kenya' },
  { code: 'UG', name: 'Uganda' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'EG', name: 'Egypt' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' },
  { code: 'AE', name: 'United Arab Emirates' },
];

// ─── Store ──────────────────────────────────────────────────────────

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  detail: string | null;
  ip_address: string | null;
  created_at: string;
}

interface Store {
  role: PreviewRole;
  user: User;
  account: Account;
  transactions: Transaction[]; // this user's, newest first
  allTransactions: Transaction[]; // platform-wide, for the admin view
  notifications: Notification[];
  methods: PaymentMethod[];
  payouts: Payout[];
  auditLogs: AuditLog[];
}

function buildStore(role: PreviewRole): Store {
  const isAdmin = role === 'admin';
  const user: User = {
    id: fakeUuid(),
    email: isAdmin ? 'demo-admin@bridgepay.dev' : 'demo-user@bridgepay.dev',
    full_name: isAdmin ? 'Demo Admin' : 'Demo User',
    country: 'KE',
    is_active: true,
    is_verified: true,
    created_at: daysAgo(120),
  };
  const account: Account = { id: fakeUuid(), balance: '0.00', currency: 'KES', created_at: daysAgo(120) };

  return {
    role,
    user,
    account,
    transactions: [],
    allTransactions: [],
    notifications: [],
    methods: [],
    payouts: [],
    auditLogs: [],
  };
}

const stores: Partial<Record<PreviewRole, Store>> = {};
function getStore(role: PreviewRole): Store {
  return (stores[role] ??= buildStore(role));
}

// ─── Mutation helpers ───────────────────────────────────────────────

function setBalance(s: Store, next: number) {
  s.account = { ...s.account, balance: next.toFixed(2) };
}

function pushTransaction(s: Store, t: Omit<Transaction, 'id' | 'currency' | 'created_at'>) {
  const created: Transaction = { id: fakeUuid(), currency: s.account.currency, created_at: new Date().toISOString(), ...t };
  s.transactions.unshift(created);
  s.allTransactions.unshift(created);
  return created;
}



/** Kenyan mobile: 07XXXXXXXX / 01XXXXXXXX / +2547XXXXXXXX / 2547XXXXXXXX. Returns 254-prefixed digits, or null. */
function normalizeKenyanPhone(raw: unknown): string | null {
  const digits = String(raw ?? '').replace(/[\s()-]/g, '');
  const m = digits.match(/^(?:\+?254|0)([17]\d{8})$/);
  return m ? `254${m[1]}` : null;
}

const maskPhone = (normalized: string) => `+254 ${normalized[3]}•• ••• ${normalized.slice(-3)}`;

// ─── Request handler ────────────────────────────────────────────────

const NEEDS_REAL_BACKEND =
  'Card and bank flows need Stripe and the real backend — not available in preview mode.';

export async function handlePreviewRequest(role: PreviewRole, input: string, init?: RequestInit): Promise<Response> {
  await sleep(120 + Math.random() * 180); // so loading states are visible, like a real network

  const s = getStore(role);
  const url = new URL(input, 'http://preview.local');
  const path = url.pathname.replace(/\/+$/, '');
  const method = (init?.method ?? 'GET').toUpperCase();
  const body = readBody(init);

  // ── Session / profile ──
  if (path === '/api/me' && method === 'GET') return json(s.user);

  if (path === '/api/me' && method === 'PATCH') {
    const fullName = body.full_name === undefined ? s.user.full_name : String(body.full_name).trim();
    const email = body.email === undefined ? s.user.email : String(body.email).trim();
    if (!fullName) return fail(422, 'Full name cannot be empty');
    if (!email.includes('@')) return fail(422, 'Enter a valid email address');
    s.user = { ...s.user, full_name: fullName, email, country: body.country ? String(body.country) : s.user.country };
    return json(s.user);
  }

  if (path === '/api/account' && method === 'GET') return json(s.account);
  if (path === '/api/auth/logout') return json({ success: true });
  if (path === '/api/auth/resend-verification') return noContent();

  if (path === '/api/users/change-password' && method === 'POST') {
    if (body.current_password !== SAMPLE_PASSWORD) return fail(400, 'Current password is incorrect');
    if (String(body.new_password ?? '').length < 8) return fail(422, 'New password must be at least 8 characters');

    return json({ success: true });
  }

  // ── Transactions & transfers ──
  if (path === '/api/transactions' && method === 'GET') return json(paginate(s.transactions, url.searchParams));

  if (path === '/api/transfers' && method === 'POST') {
    const to = String(body.to_email ?? '').trim();
    const amount = Number(body.amount);
    if (!to) return fail(422, 'Recipient email is required');
    if (!(amount > 0)) return fail(422, 'Amount must be greater than zero');
    if (to.toLowerCase() === s.user.email.toLowerCase()) return fail(400, 'You cannot send money to yourself');
    const balance = Number(s.account.balance);
    if (amount > balance) return fail(400, 'Insufficient funds');

    setBalance(s, balance - amount);
    const created = pushTransaction(s, {
      type: 'transfer',
      status: 'completed',
      amount: amount.toFixed(2),
      reference_note: body.reference_note ? String(body.reference_note) : null,
      from_account_id: s.account.id,
      to_account_id: fakeUuid(),
      from_user_email: s.user.email,
      to_user_email: to,
    });

    return json(created, 201);
  }

  // ── Notifications ──
  if (path === '/api/notifications' && method === 'GET') {
    const page = paginate(s.notifications, url.searchParams);
    return json({ ...page, unread_count: s.notifications.filter((n) => !n.is_read).length });
  }
  if (path === '/api/notifications/read-all' && method === 'POST') {
    s.notifications = s.notifications.map((n) => ({ ...n, is_read: true }));
    return noContent();
  }
  const readMatch = path.match(/^\/api\/notifications\/([^/]+)\/read$/);
  if (readMatch && method === 'POST') {
    s.notifications = s.notifications.map((n) => (n.id === readMatch[1] ? { ...n, is_read: true } : n));
    return noContent();
  }

  // ── Payment methods ──
  if (path === '/api/payment-methods' && method === 'GET') return json(s.methods);

  if (path === '/api/payment-methods/mpesa' && method === 'POST') {
    const normalized = normalizeKenyanPhone(body.phone_number);
    if (!normalized) return fail(422, 'Enter a valid Kenyan mobile number, e.g. 0712 345 678');
    const masked = maskPhone(normalized);
    if (s.methods.some((m) => m.masked_details === masked)) return fail(400, 'This number is already linked');
    const created: PaymentMethod = {
      id: fakeUuid(),
      provider: 'mpesa',
      type: 'mobile_wallet',
      masked_details: masked,
      is_default: s.methods.length === 0,
      created_at: new Date().toISOString(),
    };
    s.methods.push(created);
    return json(created, 201);
  }

  if (path.startsWith('/api/payment-methods/stripe/')) return fail(501, NEEDS_REAL_BACKEND);

  const methodMatch = path.match(/^\/api\/payment-methods\/([^/]+)$/);
  if (methodMatch && method === 'DELETE') {
    const index = s.methods.findIndex((m) => m.id === methodMatch[1]);
    if (index === -1) return fail(404, 'Payment method not found');
    const [removed] = s.methods.splice(index, 1);
    if (removed.is_default && s.methods.length > 0) s.methods[0] = { ...s.methods[0], is_default: true };
    return json({ success: true });
  }

  // ── Deposits ──
  if ((path === '/api/deposits/mpesa' || path === '/api/deposits/airtel') && method === 'POST') {
    const amount = Number(body.amount);
    if (!(amount > 0)) return fail(422, 'Amount must be greater than zero');
    if (!normalizeKenyanPhone(body.phone_number)) return fail(422, 'Enter a valid Kenyan mobile number, e.g. 0712 345 678');
    const provider = path.endsWith('mpesa') ? 'M-Pesa' : 'Airtel Money';

    // Like the real flow, the deposit is pending until the provider's
    // callback lands; simulate that a few seconds after the request.
    setTimeout(() => {
      setBalance(s, Number(s.account.balance) + amount);
      pushTransaction(s, {
        type: 'deposit',
        status: 'completed',
        amount: amount.toFixed(2),
        reference_note: `${provider} deposit`,
        from_account_id: null,
        to_account_id: s.account.id,
        to_user_email: s.user.email,
      });

    }, 4000);

    return json({ deposit_id: fakeUuid(), message: `Check your phone to approve the ${kes(amount)} ${provider} deposit.` }, 201);
  }
  if (path === '/api/deposits/stripe') return fail(501, NEEDS_REAL_BACKEND);

  // ── Payouts ──
  if (path === '/api/payouts' && method === 'GET') return json(paginate(s.payouts, url.searchParams));

  if ((path === '/api/payouts/mpesa' || path === '/api/payouts/airtel') && method === 'POST') {
    const amount = Number(body.amount);
    const recipient = String(body.recipient_email ?? '').trim();
    if (!(amount > 0)) return fail(422, 'Amount must be greater than zero');
    if (!recipient) return fail(422, 'Recipient email is required');
    if (!normalizeKenyanPhone(body.phone_number)) return fail(422, 'Enter a valid Kenyan mobile number, e.g. 0712 345 678');
    const balance = Number(s.account.balance);
    if (amount > balance) return fail(400, 'Insufficient funds');

    const provider = path.endsWith('mpesa') ? 'mpesa' : 'airtel';
    const label = provider === 'mpesa' ? 'M-Pesa' : 'Airtel Money';
    setBalance(s, balance - amount);
    pushTransaction(s, {
      type: 'withdrawal',
      status: 'completed',
      amount: amount.toFixed(2),
      reference_note: `${label} payout`,
      from_account_id: s.account.id,
      to_account_id: null,
      from_user_email: s.user.email,
    });
    const now = new Date().toISOString();
    const payout: Payout = {
      id: fakeUuid(),
      provider,
      status: 'completed',
      recipient_email: recipient,
      amount: amount.toFixed(2),
      currency: s.account.currency,
      failure_reason: null,
      created_at: now,
      completed_at: now,
    };
    s.payouts.unshift(payout);

    return json(payout, 201);
  }
  if (path === '/api/payouts/stripe-card' || path === '/api/payouts/bank-account') return fail(501, NEEDS_REAL_BACKEND);

  // ── Admin (real backend returns 403 for non-admins; the /admin page relies on that) ──
  if (path.startsWith('/api/admin/')) {
    if (s.role !== 'admin') return fail(403, 'Admin access required');

    if (path === '/api/admin/transactions' && method === 'GET') {
      const q = url.searchParams.get('user_email')?.trim().toLowerCase();
      const rows = q
        ? s.allTransactions.filter((t) => [t.from_user_email, t.to_user_email].some((e) => e?.toLowerCase().includes(q)))
        : s.allTransactions;
      return json(paginate(rows, url.searchParams));
    }
    if (path === '/api/admin/audit-logs' && method === 'GET') {
      const action = url.searchParams.get('action')?.trim().toLowerCase();
      const rows = action ? s.auditLogs.filter((l) => l.action.toLowerCase().includes(action)) : s.auditLogs;
      return json(paginate(rows, url.searchParams));
    }
  }

  return fail(501, `Not available in preview mode: ${method} ${path}`);
}
