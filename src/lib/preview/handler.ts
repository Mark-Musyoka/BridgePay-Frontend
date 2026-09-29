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

const PEOPLE = [
  { name: 'Wanjiku Kamau', email: 'wanjiku.kamau@example.com', accountId: fakeUuid() },
  { name: 'Brian Otieno', email: 'brian.otieno@example.com', accountId: fakeUuid() },
  { name: 'Amina Hassan', email: 'amina.hassan@example.com', accountId: fakeUuid() },
  { name: 'Peter Mwangi', email: 'peter.mwangi@example.com', accountId: fakeUuid() },
];
const [WANJIKU, BRIAN, AMINA, PETER] = PEOPLE;

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
  const account: Account = { id: fakeUuid(), balance: '48250.00', currency: 'KES', created_at: daysAgo(120) };

  type TxInit = Pick<Transaction, 'type' | 'status' | 'amount' | 'reference_note' | 'created_at'> &
    Partial<Pick<Transaction, 'from_account_id' | 'to_account_id' | 'from_user_email' | 'to_user_email'>>;
  const tx = (t: TxInit): Transaction => ({
    id: fakeUuid(),
    from_account_id: null,
    to_account_id: null,
    currency: 'KES',
    ...t,
  });

  const mine = account.id;
  const transactions: Transaction[] = [
    tx({ type: 'deposit', status: 'completed', amount: '12000.00', reference_note: 'M-Pesa deposit', created_at: daysAgo(0, 9, 15), to_account_id: mine, to_user_email: user.email }),
    tx({ type: 'transfer', status: 'completed', amount: '3500.00', reference_note: 'Rent share', created_at: daysAgo(1, 18, 40), from_account_id: mine, to_account_id: BRIAN.accountId, from_user_email: user.email, to_user_email: BRIAN.email }),
    tx({ type: 'transfer', status: 'completed', amount: '4500.00', reference_note: 'Thanks for lunch', created_at: daysAgo(2, 13, 5), from_account_id: WANJIKU.accountId, to_account_id: mine, from_user_email: WANJIKU.email, to_user_email: user.email }),
    tx({ type: 'deposit', status: 'completed', amount: '8000.00', reference_note: 'Airtel Money deposit', created_at: daysAgo(3, 8, 30), to_account_id: mine, to_user_email: user.email }),
    tx({ type: 'withdrawal', status: 'completed', amount: '5000.00', reference_note: 'M-Pesa payout', created_at: daysAgo(4, 16, 20), from_account_id: mine, from_user_email: user.email }),
    tx({ type: 'transfer', status: 'pending', amount: '900.00', reference_note: 'Awaiting confirmation', created_at: daysAgo(5, 11, 0), from_account_id: mine, to_account_id: AMINA.accountId, from_user_email: user.email, to_user_email: AMINA.email }),
    tx({ type: 'transfer', status: 'completed', amount: '2750.00', reference_note: null, created_at: daysAgo(7, 15, 45), from_account_id: PETER.accountId, to_account_id: mine, from_user_email: PETER.email, to_user_email: user.email }),
    tx({ type: 'deposit', status: 'failed', amount: '2000.00', reference_note: 'M-Pesa deposit', created_at: daysAgo(8, 12, 10), to_account_id: mine, to_user_email: user.email }),
    tx({ type: 'transfer', status: 'completed', amount: '650.00', reference_note: 'Airtime', created_at: daysAgo(9, 19, 30), from_account_id: mine, to_account_id: WANJIKU.accountId, from_user_email: user.email, to_user_email: WANJIKU.email }),
    tx({ type: 'transfer', status: 'completed', amount: '10000.00', reference_note: 'Invoice #1042', created_at: daysAgo(11, 10, 15), from_account_id: BRIAN.accountId, to_account_id: mine, from_user_email: BRIAN.email, to_user_email: user.email }),
    tx({ type: 'deposit', status: 'completed', amount: '15000.00', reference_note: 'M-Pesa deposit', created_at: daysAgo(13, 9, 0), to_account_id: mine, to_user_email: user.email }),
    tx({ type: 'withdrawal', status: 'completed', amount: '6000.00', reference_note: 'Airtel Money payout', created_at: daysAgo(15, 17, 25), from_account_id: mine, from_user_email: user.email }),
    tx({ type: 'transfer', status: 'completed', amount: '1850.00', reference_note: 'Groceries', created_at: daysAgo(18, 14, 0), from_account_id: mine, to_account_id: AMINA.accountId, from_user_email: user.email, to_user_email: AMINA.email }),
    tx({ type: 'transfer', status: 'completed', amount: '3200.00', reference_note: null, created_at: daysAgo(21, 11, 35), from_account_id: PETER.accountId, to_account_id: mine, from_user_email: PETER.email, to_user_email: user.email }),
  ];

  // Platform-wide transactions between other people, for the admin view.
  const others: Transaction[] = [
    tx({ type: 'transfer', status: 'completed', amount: '7200.00', reference_note: 'Supplies', created_at: daysAgo(0, 11, 20), from_account_id: PETER.accountId, to_account_id: AMINA.accountId, from_user_email: PETER.email, to_user_email: AMINA.email }),
    tx({ type: 'deposit', status: 'completed', amount: '25000.00', reference_note: 'M-Pesa deposit', created_at: daysAgo(1, 9, 45), to_account_id: BRIAN.accountId, to_user_email: BRIAN.email }),
    tx({ type: 'transfer', status: 'failed', amount: '99999.00', reference_note: 'Insufficient funds', created_at: daysAgo(2, 20, 5), from_account_id: WANJIKU.accountId, to_account_id: PETER.accountId, from_user_email: WANJIKU.email, to_user_email: PETER.email }),
    tx({ type: 'withdrawal', status: 'completed', amount: '18000.00', reference_note: 'Bank payout', created_at: daysAgo(3, 14, 50), from_account_id: AMINA.accountId, from_user_email: AMINA.email }),
    tx({ type: 'transfer', status: 'completed', amount: '450.00', reference_note: null, created_at: daysAgo(6, 16, 15), from_account_id: BRIAN.accountId, to_account_id: WANJIKU.accountId, from_user_email: BRIAN.email, to_user_email: WANJIKU.email }),
    tx({ type: 'deposit', status: 'pending', amount: '5000.00', reference_note: 'Airtel Money deposit', created_at: daysAgo(6, 18, 0), to_account_id: PETER.accountId, to_user_email: PETER.email }),
  ];
  const allTransactions = [...transactions, ...others].sort((a, b) => b.created_at.localeCompare(a.created_at));

  const note = (
    type: Notification['type'],
    title: string,
    body: string,
    createdAt: string,
    isRead: boolean,
  ): Notification => ({ id: fakeUuid(), type, title, body, is_read: isRead, created_at: createdAt });

  const notifications: Notification[] = [
    note('transfer_received', 'Money received', `You received ${kes(4500)} from ${WANJIKU.name}.`, daysAgo(2, 13, 5), false),
    note('deposit_completed', 'Deposit completed', `${kes(12000)} from M-Pesa has been added to your wallet.`, daysAgo(0, 9, 16), false),
    note('payout_sent', 'Payout sent', `${kes(5000)} was sent to your M-Pesa number.`, daysAgo(4, 16, 21), true),
    note('security_alert', 'New sign-in', 'A new sign-in to your account was detected from Nairobi, Kenya.', daysAgo(6, 8, 0), true),
    note('deposit_failed', 'Deposit failed', `Your ${kes(2000)} M-Pesa deposit did not go through.`, daysAgo(8, 12, 11), true),
    note('account_update', 'Welcome to BridgePay', 'Your account is set up and your email is verified.', daysAgo(120, 10, 0), true),
  ];

  const methods: PaymentMethod[] = [
    { id: fakeUuid(), provider: 'mpesa', type: 'mobile_wallet', masked_details: '+254 7•• ••• 821', is_default: true, created_at: daysAgo(90) },
    { id: fakeUuid(), provider: 'stripe', type: 'card', masked_details: 'Visa •••• 4242', is_default: false, created_at: daysAgo(45) },
  ];

  const payouts: Payout[] = [
    { id: fakeUuid(), provider: 'mpesa', status: 'completed', recipient_email: user.email, amount: '5000.00', currency: 'KES', failure_reason: null, created_at: daysAgo(4, 16, 20), completed_at: daysAgo(4, 16, 21) },
    { id: fakeUuid(), provider: 'airtel', status: 'completed', recipient_email: user.email, amount: '6000.00', currency: 'KES', failure_reason: null, created_at: daysAgo(15, 17, 25), completed_at: daysAgo(15, 17, 26) },
  ];

  const audit = (action: string, detail: string | null, userId: string | null, days: number, hour: number): AuditLog => ({
    id: fakeUuid(),
    user_id: userId,
    action,
    detail,
    ip_address: `41.90.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 200) + 10}`,
    created_at: daysAgo(days, hour),
  });
  const auditLogs: AuditLog[] = [
    audit('auth.login', 'Successful sign-in', user.id, 0, 8),
    audit('transfer.create', `Transfer of ${kes(3500)} to ${BRIAN.email}`, user.id, 1, 18),
    audit('deposit.completed', `M-Pesa deposit of ${kes(12000)}`, user.id, 0, 9),
    audit('auth.password_reset_requested', 'Password reset email requested', null, 2, 21),
    audit('payout.created', `M-Pesa payout of ${kes(5000)}`, user.id, 4, 16),
    audit('auth.login_failed', 'Incorrect password', null, 5, 7),
    audit('user.email_verified', 'Email verified', user.id, 120, 10),
    audit('transfer.failed', 'Insufficient funds', WANJIKU.accountId, 2, 20),
    audit('payout.created', `Bank payout of ${kes(18000)}`, AMINA.accountId, 3, 14),
    audit('auth.login', 'Successful sign-in', PETER.accountId, 1, 7),
  ];

  return { role, user, account, transactions, allTransactions, notifications, methods, payouts, auditLogs };
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

function pushNotification(s: Store, type: Notification['type'], title: string, body: string) {
  s.notifications.unshift({ id: fakeUuid(), type, title, body, is_read: false, created_at: new Date().toISOString() });
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
    pushNotification(s, 'security_alert', 'Password changed', 'Your BridgePay password was changed.');
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

    const known = PEOPLE.find((p) => p.email.toLowerCase() === to.toLowerCase());
    setBalance(s, balance - amount);
    const created = pushTransaction(s, {
      type: 'transfer',
      status: 'completed',
      amount: amount.toFixed(2),
      reference_note: body.reference_note ? String(body.reference_note) : null,
      from_account_id: s.account.id,
      to_account_id: known?.accountId ?? fakeUuid(),
      from_user_email: s.user.email,
      to_user_email: to,
    });
    pushNotification(s, 'transfer_sent', 'Transfer sent', `You sent ${kes(amount)} to ${to}.`);
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
      pushNotification(s, 'deposit_completed', 'Deposit completed', `${kes(amount)} from ${provider} has been added to your wallet.`);
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
    pushNotification(s, 'payout_sent', 'Payout sent', `${kes(amount)} was sent via ${label}.`);
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
